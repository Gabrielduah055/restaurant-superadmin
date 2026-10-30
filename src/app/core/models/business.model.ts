import type { ApiResponse } from '@core/services/api.service';

export type BusinessType = 'restaurant' | 'ecommerce';
export type BusinessStatus = 'trial' | 'active' | 'paused' | 'cancelled';
export type AgentChannel = 'whatsapp' | 'website';
export type BusinessCapability =
  | 'restaurant_operations'
  | 'restaurant_ordering'
  | 'commerce_catalog_read'
  | 'website_chat'
  | 'whatsapp_chat';

export interface BusinessStaffContact {
  name?: string;
  phone?: string;
  email?: string;
  role: 'owner' | 'manager';
}

export interface WebsiteIntegrationConfiguration {
  enabled: boolean;
  allowedOrigins: string[];
  requestsPerMinute: number;
}

export interface CommerceApiPaths {
  search: string;
  product: string;
  availability: string;
  policies: string;
}

export interface CommerceIntegrationConfiguration {
  baseUrl: string;
  authType: 'bearer' | 'header';
  apiKeyHeader?: string;
  timeoutMs: number;
  paths: CommerceApiPaths;
  canonicalProductHosts: string[];
}

export interface Business {
  _id: string;
  name: string;
  slug: string;
  type: BusinessType;
  status: BusinessStatus;
  restaurantId?: string;
  ownerName?: string;
  ownerEmail?: string;
  ownerPhone?: string;
  staff: BusinessStaffContact[];
  timezone: string;
  enabledChannels: AgentChannel[];
  capabilities: BusinessCapability[];
  agentInstructions?: string;
  websiteIntegration?: WebsiteIntegrationConfiguration;
  commerceIntegration?: CommerceIntegrationConfiguration;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBusinessRequest {
  name: string;
  slug?: string;
  type: 'ecommerce';
  status: 'trial';
  ownerName?: string;
  ownerEmail?: string;
  ownerPhone?: string;
  staff: BusinessStaffContact[];
  timezone: string;
  enabledChannels: ['website'];
  capabilities: ['commerce_catalog_read', 'website_chat'];
  agentInstructions?: string;
  websiteIntegration: {
    enabled: true;
    allowedOrigins: string[];
    requestsPerMinute: number;
  };
  commerceIntegration: CommerceIntegrationConfiguration & {
    apiKey: string;
  };
}

export interface CreateBusinessApiResponse extends ApiResponse<Business> {
  websiteIntegrationKey?: string;
}

export interface CreateBusinessResult {
  business: Business;
  websiteIntegrationKey?: string;
}
