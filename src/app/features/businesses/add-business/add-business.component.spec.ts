import { NonNullableFormBuilder } from '@angular/forms';
import { TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import { Business, CreateBusinessRequest, CreateBusinessResult } from '@core/models/business.model';
import { BusinessService } from '@core/services/business.service';
import { AddBusinessComponent } from './add-business.component';
import { pendingBusinessCreationGuard } from './pending-business-creation.guard';

describe('AddBusinessComponent setup safety', () => {
  let businessService: jasmine.SpyObj<BusinessService>;
  let component: AddBusinessComponent;

  const createdBusiness = {
    _id: 'business-123',
    name: 'Kawama',
    slug: 'kawama',
    type: 'ecommerce',
    status: 'trial',
    staff: [],
    timezone: 'Africa/Accra',
    enabledChannels: ['website'],
    capabilities: ['commerce_catalog_read', 'website_chat'],
  } as Business;

  beforeEach(() => {
    businessService = jasmine.createSpyObj<BusinessService>('BusinessService', ['createBusiness']);
    TestBed.configureTestingModule({
      providers: [
        NonNullableFormBuilder,
        { provide: BusinessService, useValue: businessService },
      ],
    });
    component = TestBed.runInInjectionContext(() => new AddBusinessComponent());
  });

  afterEach(() => {
    component.ngOnDestroy();
    TestBed.resetTestingModule();
  });

  function completeRequiredFields(): void {
    component.businessForm.patchValue({
      business: { name: 'Kawama' },
      website: {
        storefrontProductUrlTemplate: 'https://shop.example.com/product/{slug}',
      },
      commerce: {
        apiKey: 'catalog-secret',
        canonicalProductHosts: 'shop.example.com',
      },
    });
  }

  it('blocks route navigation while creation is pending', () => {
    component.isSaving = true;

    const decision = pendingBusinessCreationGuard(
      component,
      {} as never,
      {} as never,
      {} as never,
    );

    expect(decision).toBeFalse();
  });

  it('ignores a late creation response and clears secrets after destruction', async () => {
    const response = new Subject<CreateBusinessResult>();
    businessService.createBusiness.and.returnValue(response.asObservable());
    completeRequiredFields();

    const save = component.createBusiness();
    expect(component.isSaving).toBeTrue();

    component.ngOnDestroy();
    response.next({ business: createdBusiness, websiteIntegrationKey: 'late-secret' });
    response.complete();
    await save;

    expect(component.setup).toBeUndefined();
    expect(component.businessForm.controls.commerce.controls.apiKey.value).toBe('');
    expect(component.errorMessage).toBe('');
  });

  it('adds the storefront template only to setup environment output and clears completed secrets', async () => {
    businessService.createBusiness.and.returnValue(
      of({ business: createdBusiness, websiteIntegrationKey: 'website-secret' }),
    );
    completeRequiredFields();

    await component.createBusiness();

    const payload = businessService.createBusiness.calls.mostRecent().args[0] as CreateBusinessRequest;
    expect(JSON.stringify(payload)).not.toContain('storefrontProductUrlTemplate');
    expect(component.setup?.environmentBlock).toContain(
      'STOREFRONT_PRODUCT_URL_TEMPLATE=https://shop.example.com/product/{slug}',
    );

    const setup = component.setup;
    component.ngOnDestroy();
    expect(setup?.websiteIntegrationKey).toBe('');
    expect(setup?.catalogApiKey).toBe('');
    expect(setup?.environmentBlock).toBe('');
    expect(component.setup).toBeUndefined();
  });
});
