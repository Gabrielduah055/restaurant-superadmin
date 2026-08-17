export type RestaurantPlan = 'starter' | 'growth' | 'premium';
export type RestaurantStatus = 'trial' | 'active' | 'paused' | 'cancelled';
export type AssistantTone = 'friendly' | 'professional' | 'casual' | 'concise' | 'playful';
export type BillingStatus = 'active' | 'inactive' | 'past_due' | 'cancelled';
export type OwnerSummaryWeekday = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface RestaurantDeliveryPricingZone { name: string; aliases?: string[]; fee: number; }
export interface RestaurantDeliveryPricing { type: 'flat' | 'zone_based' | 'manual_confirmation'; flatFee?: number; freeDeliveryThreshold?: number; zones?: RestaurantDeliveryPricingZone[]; }

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
  subscriptionAmount?: number;
  billingStatus?: BillingStatus;
  wasenderSessionId: string;
  wasenderApiToken?: string;
  whatsappNumber: string;
  openingHours?: string;
  pickupAddress?: string;
  deliveryEnabled: boolean;
  deliveryAreas: string[];
  deliveryRadiusKm?: number;
  deliveryPricing?: RestaurantDeliveryPricing;
  minimumOrderValue?: number;
  allowTakeaway?: boolean;
  freeDeliveryThresholdEnabled?: boolean;
  deliveryFeeNote?: string;
  assistantTone: AssistantTone;
  assistantPersonalitySummary?: string;
  followUpEnabled: boolean;
  followUpDelayMinutes: number;
  timezone: string;
  ownerDailySummaryEnabled: boolean;
  ownerDailySummaryTime: string;
  ownerWeeklySummaryEnabled: boolean;
  ownerWeeklySummaryDay: OwnerSummaryWeekday;
  ownerWeeklySummaryTime: string;
  ownerPendingActionReminderEnabled: boolean;
  ownerPendingActionReminderDelayMinutes: number;
  orderCheckInEnabled: boolean;
  pickupCheckInDelayMinutes: number;
  deliveryCheckInDelayMinutes: number;
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
  subscriptionAmount?: number;
  billingStatus?: BillingStatus;
  wasenderSessionId: string;
  wasenderApiToken?: string;
  whatsappNumber: string;
  openingHours?: string;
  pickupAddress?: string;
  deliveryEnabled: boolean;
  deliveryAreas: string[];
  deliveryRadiusKm?: number;
  deliveryPricing?: RestaurantDeliveryPricing;
  minimumOrderValue?: number;
  allowTakeaway?: boolean;
  freeDeliveryThresholdEnabled?: boolean;
  deliveryFeeNote?: string;
  assistantTone: AssistantTone;
  assistantPersonalitySummary?: string;
  followUpEnabled: boolean;
  followUpDelayMinutes: number;
  timezone?: string;
  ownerDailySummaryEnabled?: boolean;
  ownerDailySummaryTime?: string;
  ownerWeeklySummaryEnabled?: boolean;
  ownerWeeklySummaryDay?: OwnerSummaryWeekday;
  ownerWeeklySummaryTime?: string;
  ownerPendingActionReminderEnabled?: boolean;
  ownerPendingActionReminderDelayMinutes?: number;
  orderCheckInEnabled?: boolean;
  pickupCheckInDelayMinutes?: number;
  deliveryCheckInDelayMinutes?: number;
}
