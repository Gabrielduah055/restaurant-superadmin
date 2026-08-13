export type RestaurantPlan = 'starter' | 'growth' | 'premium';
export type RestaurantStatus = 'trial' | 'active' | 'paused' | 'cancelled';
export type AssistantTone = 'friendly' | 'professional' | 'casual' | 'concise' | 'playful';

export interface Restaurant {
  _id: string;
  name: string;
  slug: string;
  ownerName?: string;
  ownerPhone: string;
  contactEmail?: string;
  primaryCuisine?: string;
  managerPhones: string[];
  managerContacts?: RestaurantManagerContact[];
  plan: RestaurantPlan;
  status: RestaurantStatus;
  subscriptionRenewalDate?: string;
  wasenderSessionId: string;
  wasenderApiToken?: string;
  whatsappNumber: string;
  openingHours?: string;
  pickupAddress?: string;
  deliveryEnabled: boolean;
  deliveryAreas: string[];
  deliveryRadiusKm?: number;
  minimumOrderValue?: number;
  allowTakeaway?: boolean;
  freeDeliveryThresholdEnabled?: boolean;
  deliveryFeeNote?: string;
  assistantTone: AssistantTone;
  assistantPersonalitySummary?: string;
  followUpEnabled: boolean;
  followUpDelayMinutes: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface RestaurantManagerContact {
  name?: string;
  phone: string;
}

export interface CreateRestaurantRequest {
  name: string;
  ownerName?: string;
  ownerPhone: string;
  contactEmail?: string;
  primaryCuisine?: string;
  managerPhones: string[];
  managerContacts?: RestaurantManagerContact[];
  plan: RestaurantPlan;
  status: RestaurantStatus;
  subscriptionRenewalDate?: string;
  wasenderSessionId: string;
  wasenderApiToken?: string;
  whatsappNumber: string;
  openingHours?: string;
  pickupAddress?: string;
  deliveryEnabled: boolean;
  deliveryAreas: string[];
  deliveryRadiusKm?: number;
  minimumOrderValue?: number;
  allowTakeaway?: boolean;
  freeDeliveryThresholdEnabled?: boolean;
  deliveryFeeNote?: string;
  assistantTone: AssistantTone;
  assistantPersonalitySummary?: string;
  followUpEnabled: boolean;
  followUpDelayMinutes: number;
}
