import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import {
  Business,
  CreateBusinessApiResponse,
  CreateBusinessRequest,
  CreateBusinessResult,
} from '@core/models/business.model';
import { ApiService } from './api.service';

export function mapCreateBusinessResponse(response: CreateBusinessApiResponse): CreateBusinessResult {
  return {
    business: response.data,
    websiteIntegrationKey: response.websiteIntegrationKey,
  };
}

@Injectable({ providedIn: 'root' })
export class BusinessService {
  constructor(private readonly apiService: ApiService) {}

  getBusinesses(): Observable<Business[]> {
    return this.apiService.get<Business[]>('businesses');
  }

  getBusinessById(businessId: string): Observable<Business> {
    return this.apiService.get<Business>(`businesses/${businessId}`);
  }

  createBusiness(payload: CreateBusinessRequest): Observable<CreateBusinessResult> {
    return this.apiService
      .postResponse<CreateBusinessApiResponse, CreateBusinessRequest>('businesses', payload)
      .pipe(map(mapCreateBusinessResponse));
  }
}
