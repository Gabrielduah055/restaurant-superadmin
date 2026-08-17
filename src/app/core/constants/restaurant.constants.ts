import { AssistantTone, RestaurantStatus } from '@core/models/restaurant.model';

export interface SelectOption<TValue extends string = string> {
  label: string;
  value: TValue;
}

export const RESTAURANT_PAGE_COPY = {
  listTitle: 'Restaurants',
  listSubtitle: 'Manage and monitor all restaurant partners across the platform.',
  addTitle: 'Onboard New Restaurant',
  addSubtitle: 'Configure the core business, delivery, and AI assistant settings.',
  detailsFallbackTitle: 'Restaurant Details',
  addRestaurantLabel: 'Add Restaurant',
  restaurantListLabel: 'Restaurant List',
  exportReportLabel: 'Export Report',
  saveRestaurantLabel: 'Save Restaurant',
  saveContinueLabel: 'Save & Continue',
};

export const RESTAURANT_STATUS_OPTIONS: SelectOption<RestaurantStatus>[] = [
  { label: 'Trial', value: 'trial' },
  { label: 'Active', value: 'active' },
  { label: 'Paused', value: 'paused' },
  { label: 'Cancelled', value: 'cancelled' },
];

export const ASSISTANT_TONE_OPTIONS: SelectOption<AssistantTone>[] = [
  { label: 'Friendly', value: 'friendly' },
  { label: 'Professional', value: 'professional' },
  { label: 'Casual', value: 'casual' },
  { label: 'Concise', value: 'concise' },
];
