import { Component, OnDestroy, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { firstValueFrom, Subject, takeUntil } from 'rxjs';
import { CreateBusinessRequest } from '@core/models/business.model';
import { BusinessService } from '@core/services/business.service';
import {
  hostnameListValidator,
  httpsUrlValidator,
  localPathValidator,
  originListValidator,
  parseLineSeparatedValues,
  storefrontProductUrlTemplateValidator,
} from '@core/utils/business-form.util';
import { environment } from '@env/environment';

interface BusinessSetupSecrets {
  businessId: string;
  businessName: string;
  websiteIntegrationKey: string;
  catalogApiKey: string;
  environmentBlock: string;
}

@Component({
  selector: 'app-add-business',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './add-business.component.html',
})
export class AddBusinessComponent implements OnDestroy {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly businessService = inject(BusinessService);
  private readonly orderBridgeBaseUrl = environment.apiBaseUrl.replace(/\/api\/?$/, '');
  private readonly destroyed$ = new Subject<void>();
  private destroyed = false;

  isSaving = false;
  errorMessage = '';
  copiedValue = '';
  setup?: BusinessSetupSecrets;

  readonly businessForm = this.formBuilder.group({
    business: this.formBuilder.group({
      name: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(200)]],
      slug: ['', [Validators.maxLength(120), Validators.pattern(/^[a-z0-9-]*$/)]],
      ownerName: [''],
      ownerEmail: ['', Validators.email],
      ownerPhone: [''],
      timezone: ['Africa/Accra', Validators.required],
      agentInstructions: ['', Validators.maxLength(4000)],
    }),
    website: this.formBuilder.group({
      allowedOrigins: ['', originListValidator],
      requestsPerMinute: [60, [Validators.required, Validators.min(1), Validators.max(600)]],
      storefrontProductUrlTemplate: [
        '',
        [Validators.required, storefrontProductUrlTemplateValidator],
      ],
    }),
    commerce: this.formBuilder.group({
      baseUrl: ['https://kawama-admin-backend.onrender.com', [Validators.required, httpsUrlValidator]],
      apiKey: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(1000)]],
      authType: ['bearer' as 'bearer' | 'header', Validators.required],
      apiKeyHeader: ['x-api-key', Validators.pattern(/^[A-Za-z0-9-]{1,80}$/)],
      timeoutMs: [5000, [Validators.required, Validators.min(500), Validators.max(15000)]],
      searchPath: ['/api/integrations/orderbridge/products/search', [Validators.required, localPathValidator()]],
      productPath: ['/api/integrations/orderbridge/products/{productId}', [Validators.required, localPathValidator(true)]],
      availabilityPath: ['/api/integrations/orderbridge/products/{productId}/availability', [Validators.required, localPathValidator(true)]],
      policiesPath: ['/api/integrations/orderbridge/policies', [Validators.required, localPathValidator()]],
      canonicalProductHosts: ['', hostnameListValidator],
    }),
  });

  ngOnDestroy(): void {
    this.destroyed = true;
    this.destroyed$.next();
    this.destroyed$.complete();
    this.isSaving = false;
    this.businessForm.controls.commerce.controls.apiKey.setValue('');
    if (this.setup) {
      this.setup.websiteIntegrationKey = '';
      this.setup.catalogApiKey = '';
      this.setup.environmentBlock = '';
    }
    this.setup = undefined;
  }

  canDeactivate(): boolean {
    return !this.isSaving;
  }

  async createBusiness(): Promise<void> {
    this.errorMessage = '';
    if (this.businessForm.invalid) {
      this.businessForm.markAllAsTouched();
      this.errorMessage = 'Review the highlighted business, website, and commerce fields before creating the account.';
      return;
    }

    this.isSaving = true;
    const value = this.businessForm.getRawValue();
    const catalogApiKey = value.commerce.apiKey.trim();
    const storefrontProductUrlTemplate = value.website.storefrontProductUrlTemplate.trim();
    const optional = (input: string): string | undefined => input.trim() || undefined;
    const payload: CreateBusinessRequest = {
      name: value.business.name.trim(),
      slug: optional(value.business.slug),
      type: 'ecommerce',
      status: 'trial',
      ownerName: optional(value.business.ownerName),
      ownerEmail: optional(value.business.ownerEmail),
      ownerPhone: optional(value.business.ownerPhone),
      staff: [],
      timezone: value.business.timezone.trim(),
      enabledChannels: ['website'],
      capabilities: ['commerce_catalog_read', 'website_chat'],
      agentInstructions: optional(value.business.agentInstructions),
      websiteIntegration: {
        enabled: true,
        allowedOrigins: parseLineSeparatedValues(value.website.allowedOrigins),
        requestsPerMinute: value.website.requestsPerMinute,
      },
      commerceIntegration: {
        baseUrl: value.commerce.baseUrl.trim().replace(/\/$/, ''),
        apiKey: catalogApiKey,
        authType: value.commerce.authType,
        apiKeyHeader: optional(value.commerce.apiKeyHeader),
        timeoutMs: value.commerce.timeoutMs,
        paths: {
          search: value.commerce.searchPath.trim(),
          product: value.commerce.productPath.trim(),
          availability: value.commerce.availabilityPath.trim(),
          policies: value.commerce.policiesPath.trim(),
        },
        canonicalProductHosts: parseLineSeparatedValues(value.commerce.canonicalProductHosts).map((host) => host.toLowerCase()),
      },
    };

    try {
      const result = await firstValueFrom(
        this.businessService.createBusiness(payload).pipe(takeUntil(this.destroyed$)),
      );
      if (this.destroyed) return;
      const websiteIntegrationKey = result.websiteIntegrationKey ?? '';
      this.setup = {
        businessId: result.business._id,
        businessName: result.business.name,
        websiteIntegrationKey,
        catalogApiKey,
        environmentBlock: this.buildEnvironmentBlock(
          result.business._id,
          websiteIntegrationKey,
          catalogApiKey,
          storefrontProductUrlTemplate,
        ),
      };
      this.businessForm.controls.commerce.controls.apiKey.setValue('');
    } catch (error) {
      if (this.destroyed) return;
      this.errorMessage = error instanceof Error ? error.message : 'Unable to create the business. No setup values were stored.';
    } finally {
      if (!this.destroyed) this.isSaving = false;
    }
  }

  async copyValue(label: string, value: string): Promise<void> {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      this.copiedValue = label;
    } catch {
      this.errorMessage = 'Clipboard access was unavailable. Select the value and copy it manually.';
    }
  }

  private buildEnvironmentBlock(
    businessId: string,
    websiteKey: string,
    catalogApiKey: string,
    storefrontProductUrlTemplate: string,
  ): string {
    return [
      'AI_CHAT_ENABLED=true',
      'AI_CHAT_ENGINE=orderbridge',
      `ORDERBRIDGE_BASE_URL=${this.orderBridgeBaseUrl}`,
      `ORDERBRIDGE_BUSINESS_ID=${businessId}`,
      `ORDERBRIDGE_WEBSITE_INTEGRATION_KEY=${websiteKey}`,
      'ORDERBRIDGE_CHAT_TIMEOUT_MS=60000',
      `ORDERBRIDGE_API_KEY=${catalogApiKey}`,
      `STOREFRONT_PRODUCT_URL_TEMPLATE=${storefrontProductUrlTemplate}`,
    ].join('\n');
  }
}
