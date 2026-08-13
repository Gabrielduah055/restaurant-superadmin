import { AssistantTone, RestaurantPlan, RestaurantStatus } from '@core/models/restaurant.model';

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

export const RESTAURANT_PLAN_OPTIONS: SelectOption<RestaurantPlan>[] = [
  { label: 'Starter', value: 'starter' },
  { label: 'Growth', value: 'growth' },
  { label: 'Premium', value: 'premium' },
];

export const RESTAURANT_PLAN_CARDS = [
  {
    label: 'Starter',
    value: 'starter',
    price: '$49/mo',
    managerLimit: 2,
    features: ['Up to 2 Managers', '500 Messages/mo', 'Basic AI Assistant'],
  },
  {
    label: 'Growth',
    value: 'growth',
    price: '$129/mo',
    managerLimit: 10,
    features: ['Up to 10 Managers', 'Unlimited Messages', 'Advanced AI + Follow-ups'],
  },
  {
    label: 'Premium',
    value: 'premium',
    price: '$299/mo',
    managerLimit: 999,
    features: ['Unlimited Managers', 'Priority Support', 'Custom AI Training'],
  },
] satisfies Array<{
  label: string;
  value: RestaurantPlan;
  price: string;
  managerLimit: number;
  features: string[];
}>;

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
