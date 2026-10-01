import { Restaurant } from '@core/models/restaurant.model';
import {
  getEffectiveBillingStatus,
  getSubscriptionRenewalState,
  hasValidSubscriptionAmount,
  isActiveRevenueSubscription,
  parseSubscriptionCalendarDate,
} from './subscription-billing.util';

const makeSubscription = (overrides: Partial<Restaurant> = {}): Restaurant => ({
  _id: 'restaurant-1',
  name: 'Golden Grill',
  slug: 'golden-grill',
  ownerPhone: '+233500000001',
  managerPhones: [],
  plan: 'starter',
  status: 'active',
  wasenderSessionId: 'session-1',
  whatsappNumber: '+233500000001',
  deliveryEnabled: false,
  deliveryAreas: [],
  assistantTone: 'friendly',
  followUpEnabled: true,
  followUpDelayMinutes: 3,
  timezone: 'Africa/Accra',
  ownerDailySummaryEnabled: false,
  ownerDailySummaryTime: '08:00',
  ownerWeeklySummaryEnabled: false,
  ownerWeeklySummaryDay: 'monday',
  ownerWeeklySummaryTime: '08:00',
  ownerPendingActionReminderEnabled: false,
  ownerPendingActionReminderDelayMinutes: 3,
  orderCheckInEnabled: true,
  pickupCheckInDelayMinutes: 45,
  deliveryCheckInDelayMinutes: 75,
  ...overrides,
});

describe('subscription billing rules', () => {
  const today = new Date(2026, 7, 17);

  it('distinguishes missing billing configuration from inactive billing', () => {
    expect(getEffectiveBillingStatus(makeSubscription(), today)).toBe('not_configured');
    expect(getEffectiveBillingStatus(makeSubscription({ billingStatus: 'inactive' }), today)).toBe('inactive');
  });

  it('treats a stale active subscription due today or earlier as past due', () => {
    expect(getEffectiveBillingStatus(makeSubscription({
      billingStatus: 'active',
      subscriptionRenewalDate: '2026-08-17T00:00:00.000Z',
    }), today)).toBe('past_due');
    expect(getSubscriptionRenewalState(makeSubscription({
      billingStatus: 'active',
      subscriptionRenewalDate: '2026-08-16T23:00:00.000Z',
    }), today)).toBe('payment_due');
  });

  it('excludes expired and amount-less subscriptions from active MRR', () => {
    expect(isActiveRevenueSubscription(makeSubscription({
      billingStatus: 'active',
      subscriptionAmount: 1000,
      subscriptionRenewalDate: '2026-08-16',
    }), today)).toBeFalse();
    expect(isActiveRevenueSubscription(makeSubscription({
      billingStatus: 'active',
      subscriptionRenewalDate: '2026-09-17',
    }), today)).toBeFalse();
    expect(isActiveRevenueSubscription(makeSubscription({
      billingStatus: 'active',
      subscriptionAmount: 1000,
      subscriptionRenewalDate: '2026-09-17',
    }), today)).toBeTrue();
  });

  it('requires a positive configured subscription amount', () => {
    expect(hasValidSubscriptionAmount(makeSubscription())).toBeFalse();
    expect(hasValidSubscriptionAmount(makeSubscription({ subscriptionAmount: 0 }))).toBeFalse();
    expect(hasValidSubscriptionAmount(makeSubscription({ subscriptionAmount: 1000 }))).toBeTrue();
  });

  it('parses ISO calendar dates without UTC-to-local day shifts', () => {
    const parsed = parseSubscriptionCalendarDate('2026-08-17T00:00:00.000Z');
    expect(parsed?.getFullYear()).toBe(2026);
    expect(parsed?.getMonth()).toBe(7);
    expect(parsed?.getDate()).toBe(17);
  });
});
