import { DatePipe, TitleCasePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  Business,
  BusinessStatus,
  UpdateBusinessRequest,
} from '@core/models/business.model';
import { BusinessService } from '@core/services/business.service';
import {
  hostnameListValidator,
  httpsUrlValidator,
  localPathValidator,
  originListValidator,
  parseLineSeparatedValues,
} from '@core/utils/business-form.util';

function ianaTimezoneValidator(control: AbstractControl): ValidationErrors | null {
  const value = String(control.value ?? '').trim();
  if (!value) return null;

  try {
    new Intl.DateTimeFormat('en-US', { timeZone: value }).format();
    return null;
  } catch {
    return { timezone: true };
  }
}

function integerValidator(control: AbstractControl): ValidationErrors | null {
  const value = Number(control.value);
  return Number.isInteger(value) ? null : { integer: true };
}

@Component({
  selector: 'app-business-details',
  imports: [DatePipe, ReactiveFormsModule, RouterLink, TitleCasePipe],
  templateUrl: './business-details.component.html',
})
export class BusinessDetailsComponent implements OnInit {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly businessService = inject(BusinessService);

  business?: Business;
  isLoading = false;
  isEditing = false;
  isSaving = false;
  errorMessage = '';
  saveErrorMessage = '';
  successMessage = '';

  readonly statusOptions: readonly BusinessStatus[] = ['trial', 'active', 'paused', 'cancelled'];

  readonly businessForm = this.formBuilder.group({
    business: this.formBuilder.group({
      name: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(200)]],
      status: ['trial' as BusinessStatus, Validators.required],
      ownerName: [''],
      ownerEmail: ['', Validators.email],
      ownerPhone: ['', Validators.minLength(7)],
      timezone: ['', [Validators.required, ianaTimezoneValidator]],
      agentInstructions: ['', Validators.maxLength(4000)],
    }),
    website: this.formBuilder.group({
      enabled: [false],
      allowedOrigins: ['', originListValidator],
      requestsPerMinute: [
        60,
        [Validators.required, integerValidator, Validators.min(1), Validators.max(600)],
      ],
    }),
    commerce: this.formBuilder.group({
      baseUrl: ['', [Validators.required, httpsUrlValidator]],
      apiKey: ['', Validators.maxLength(1000)],
      authType: ['bearer' as 'bearer' | 'header', Validators.required],
      apiKeyHeader: ['', Validators.pattern(/^[A-Za-z0-9-]{1,80}$/)],
      searchPath: ['', [Validators.required, localPathValidator()]],
      productPath: ['', [Validators.required, localPathValidator(true)]],
      availabilityPath: ['', [Validators.required, localPathValidator(true)]],
      policiesPath: ['', [Validators.required, localPathValidator()]],
      canonicalProductHosts: ['', hostnameListValidator],
    }),
  });

  ngOnInit(): void {
    void this.loadBusiness();
  }

  startEditing(): void {
    if (!this.business || this.isSaving) return;
    this.populateForm(this.business);
    this.saveErrorMessage = '';
    this.successMessage = '';
    this.isEditing = true;
  }

  cancelEditing(): void {
    if (this.isSaving) return;
    if (this.business) this.populateForm(this.business);
    this.saveErrorMessage = '';
    this.isEditing = false;
  }

  async saveBusiness(): Promise<void> {
    if (this.isSaving || !this.business) return;

    this.saveErrorMessage = '';
    this.successMessage = '';
    if (this.businessForm.invalid) {
      this.businessForm.markAllAsTouched();
      this.saveErrorMessage = 'Review the highlighted business, website, and commerce fields before saving.';
      return;
    }

    const value = this.businessForm.getRawValue();
    const optional = (input: string): string | undefined => input.trim() || undefined;
    const ownerName = optional(value.business.ownerName);
    const ownerEmail = optional(value.business.ownerEmail);
    const ownerPhone = optional(value.business.ownerPhone);
    const agentInstructions = optional(value.business.agentInstructions);
    const apiKey = optional(value.commerce.apiKey);
    const apiKeyHeader = optional(value.commerce.apiKeyHeader);

    const payload: UpdateBusinessRequest = {
      name: value.business.name.trim(),
      status: value.business.status,
      ...(ownerName ? { ownerName } : {}),
      ...(ownerEmail ? { ownerEmail } : {}),
      ...(ownerPhone ? { ownerPhone } : {}),
      timezone: value.business.timezone.trim(),
      ...(agentInstructions ? { agentInstructions } : {}),
      websiteIntegration: {
        enabled: value.website.enabled,
        allowedOrigins: parseLineSeparatedValues(value.website.allowedOrigins),
        requestsPerMinute: value.website.requestsPerMinute,
      },
      commerceIntegration: {
        baseUrl: value.commerce.baseUrl.trim().replace(/\/$/, ''),
        authType: value.commerce.authType,
        ...(apiKeyHeader ? { apiKeyHeader } : {}),
        ...(apiKey ? { apiKey } : {}),
        paths: {
          search: value.commerce.searchPath.trim(),
          product: value.commerce.productPath.trim(),
          availability: value.commerce.availabilityPath.trim(),
          policies: value.commerce.policiesPath.trim(),
        },
        canonicalProductHosts: parseLineSeparatedValues(
          value.commerce.canonicalProductHosts,
        ).map((host) => host.toLowerCase()),
      },
    };

    this.isSaving = true;
    try {
      const updatedBusiness = await firstValueFrom(
        this.businessService.updateBusiness(this.business._id, payload),
      );

      let refreshedBusiness = updatedBusiness;
      try {
        refreshedBusiness = await firstValueFrom(
          this.businessService.getBusinessById(updatedBusiness._id),
        );
      } catch {
        // The PATCH response already contains the saved business. Keep it if the refresh fails.
      }

      this.business = refreshedBusiness;
      this.populateForm(refreshedBusiness);
      this.isEditing = false;
      this.successMessage = 'Business updated successfully.';
    } catch (error) {
      this.saveErrorMessage = error instanceof Error
        ? error.message
        : 'Unable to update this business. Your changes are still in the form.';
    } finally {
      this.isSaving = false;
    }
  }

  private async loadBusiness(): Promise<void> {
    const businessId = this.route.snapshot.paramMap.get('businessId');
    if (!businessId) {
      this.errorMessage = 'Business ID is missing from the route.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    try {
      this.business = await firstValueFrom(this.businessService.getBusinessById(businessId));
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Unable to load this business.';
    } finally {
      this.isLoading = false;
    }
  }

  private populateForm(business: Business): void {
    const commerce = business.commerceIntegration;
    this.businessForm.reset({
      business: {
        name: business.name,
        status: business.status,
        ownerName: business.ownerName ?? '',
        ownerEmail: business.ownerEmail ?? '',
        ownerPhone: business.ownerPhone ?? '',
        timezone: business.timezone,
        agentInstructions: business.agentInstructions ?? '',
      },
      website: {
        enabled: business.websiteIntegration?.enabled ?? false,
        allowedOrigins: business.websiteIntegration?.allowedOrigins?.join('\n') ?? '',
        requestsPerMinute: business.websiteIntegration?.requestsPerMinute ?? 60,
      },
      commerce: {
        baseUrl: commerce?.baseUrl ?? '',
        apiKey: '',
        authType: commerce?.authType ?? 'bearer',
        apiKeyHeader: commerce?.apiKeyHeader ?? '',
        searchPath: commerce?.paths.search ?? '',
        productPath: commerce?.paths.product ?? '',
        availabilityPath: commerce?.paths.availability ?? '',
        policiesPath: commerce?.paths.policies ?? '',
        canonicalProductHosts: commerce?.canonicalProductHosts.join('\n') ?? '',
      },
    });
  }
}
