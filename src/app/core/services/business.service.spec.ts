import { firstValueFrom, of } from 'rxjs';
import {
  Business,
  CommerceConnectionTestResult,
  CreateBusinessApiResponse,
  CreateBusinessRequest,
} from '@core/models/business.model';
import { BusinessService, mapCreateBusinessResponse } from './business.service';
import { ApiService } from './api.service';

describe('BusinessService creation response mapping', () => {
  const business: Business = {
    _id: 'business-123',
    name: 'Kawama',
    slug: 'kawama',
    type: 'ecommerce',
    status: 'trial',
    staff: [],
    timezone: 'Africa/Accra',
    enabledChannels: ['website'],
    capabilities: ['commerce_catalog_read', 'website_chat'],
  };

  it('preserves both response data and the one-time top-level website key', () => {
    const response: CreateBusinessApiResponse = {
      success: true,
      data: business,
      websiteIntegrationKey: 'generated-key',
    };

    expect(mapCreateBusinessResponse(response)).toEqual({
      business,
      websiteIntegrationKey: 'generated-key',
    });
  });

  it('requests the raw API envelope when creating a business', async () => {
    const apiService = jasmine.createSpyObj<ApiService>('ApiService', ['postResponse']);
    const service = new BusinessService(apiService);
    const response: CreateBusinessApiResponse = {
      success: true,
      data: business,
      websiteIntegrationKey: 'generated-key',
    };
    const payload = {} as CreateBusinessRequest;
    apiService.postResponse.and.returnValue(of(response));

    const result = await firstValueFrom(service.createBusiness(payload));

    expect(apiService.postResponse).toHaveBeenCalledWith('businesses', payload);
    expect(result.websiteIntegrationKey).toBe('generated-key');
    expect(result.business).toBe(business);
  });

  it('posts the catalog search term to the saved commerce connection check', async () => {
    const apiService = jasmine.createSpyObj<ApiService>('ApiService', ['post']);
    const service = new BusinessService(apiService);
    const response: CommerceConnectionTestResult = {
      checkedAt: '2026-11-02T10:00:00.000Z',
      checks: [
        { name: 'productSearch', success: true, details: 'Product search returned a valid empty product list.' },
        { name: 'policies', success: true, details: 'Policies returned a valid empty list.' },
      ],
    };
    apiService.post.and.returnValue(of(response));

    const result = await firstValueFrom(
      service.testCommerceConnection('business-123', { searchTerm: 'phone' }),
    );

    expect(apiService.post).toHaveBeenCalledWith(
      'businesses/business-123/commerce/test',
      { searchTerm: 'phone' },
    );
    expect(result).toBe(response);
  });
});
