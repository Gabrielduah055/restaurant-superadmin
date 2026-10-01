import { BillingStatus, Restaurant } from '@core/models/restaurant.model';

export type SubscriptionDisplayStatus = BillingStatus | 'not_configured';
export type SubscriptionRenewalState = 'renewing_soon' | 'payment_due' | undefined;

const toCalendarDayNumber = (date: Date): number =>
  Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000;

export const parseSubscriptionCalendarDate = (value?: string): Date | undefined => {
  if (!value) return undefined;

  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch;
    const parsed = new Date(Number(year), Number(month) - 1, Number(day));
    if (
      parsed.getFullYear() === Number(year)
      && parsed.getMonth() === Number(month) - 1
      && parsed.getDate() === Number(day)
    ) {
      return parsed;
    }
    return undefined;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

export const getSubscriptionRenewalState = (
  restaurant: Pick<Restaurant, 'billingStatus' | 'subscriptionRenewalDate'>,
  today = new Date(),
): SubscriptionRenewalState => {
  if (restaurant.billingStatus === 'cancelled') return undefined;

  const renewalDate = parseSubscriptionCalendarDate(restaurant.subscriptionRenewalDate);
  if (!renewalDate) return restaurant.billingStatus === 'past_due' ? 'payment_due' : undefined;

  const daysUntilRenewal = toCalendarDayNumber(renewalDate) - toCalendarDayNumber(today);
  if (daysUntilRenewal <= 0) return 'payment_due';
  return restaurant.billingStatus === 'active' && daysUntilRenewal <= 7 ? 'renewing_soon' : undefined;
};

export const getEffectiveBillingStatus = (
  restaurant: Pick<Restaurant, 'billingStatus' | 'subscriptionRenewalDate'>,
  today = new Date(),
): SubscriptionDisplayStatus => {
  if (!restaurant.billingStatus) return 'not_configured';
  if (
    restaurant.billingStatus === 'active'
    && getSubscriptionRenewalState(restaurant, today) === 'payment_due'
  ) {
    return 'past_due';
  }
  return restaurant.billingStatus;
};

export const getBillingStatusLabel = (status: SubscriptionDisplayStatus): string => {
  if (status === 'not_configured') return 'Not configured';
  if (status === 'past_due') return 'Past Due';
  return status.charAt(0).toUpperCase() + status.slice(1);
};

export const hasValidSubscriptionAmount = (
  restaurant: Pick<Restaurant, 'subscriptionAmount'>,
): boolean => typeof restaurant.subscriptionAmount === 'number'
  && Number.isFinite(restaurant.subscriptionAmount)
  && restaurant.subscriptionAmount > 0;

export const isActiveRevenueSubscription = (
  restaurant: Pick<Restaurant, 'billingStatus' | 'subscriptionAmount' | 'subscriptionRenewalDate'>,
  today = new Date(),
): boolean => getEffectiveBillingStatus(restaurant, today) === 'active'
  && hasValidSubscriptionAmount(restaurant);
