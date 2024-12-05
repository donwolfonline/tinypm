// lib/subscription.ts
import { getStripePrice } from './config/client-stripe';

export type SubscriptionInterval = 'month' | 'year';
export type SubscriptionStatus = 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'EXPIRED';

interface SubscriptionPlan {
  readonly name: string;
  readonly priceId: string;
  readonly interval: SubscriptionInterval;
  readonly amount: number;
  readonly features: readonly string[];
}

// Make the entire structure immutable
type SubscriptionPlans = Readonly<{
  MONTHLY: SubscriptionPlan;
  YEARLY: SubscriptionPlan;
}>;

const isDev = process.env.NODE_ENV === 'development';

/**
 * Development price IDs - ensures type safety in dev mode
 */
const DEV_PRICE_IDS = {
  MONTHLY: 'dev_monthly',
  YEARLY: 'dev_yearly'
} as const;

/**
 * Helper to get appropriate price ID based on environment
 */
function getPriceId(type: 'MONTHLY' | 'YEARLY'): string {
  if (isDev) {
    return DEV_PRICE_IDS[type];
  }
  return getStripePrice(type === 'MONTHLY' ? 'premiumMonthly' : 'premiumYearly');
}

export const SUBSCRIPTION_PLANS: SubscriptionPlans = {
  MONTHLY: {
    name: 'Premium Monthly',
    priceId: getPriceId('MONTHLY'),
    interval: 'month',
    amount: 3.99,
    features: [
      'Custom domain support',
      'Priority support',
      'Remove tiny.pm branding'
    ]
  },
  YEARLY: {
    name: 'Premium Yearly',
    priceId: getPriceId('YEARLY'),
    interval: 'year',
    amount: 35,
    features: [
      'All Premium Monthly features',
      '2 months free',
    ]
  }
} as const;

/**
 * Development helpers and mocks
 * Only available in development environment
 */
export const DEV_HELPERS = {
  mockSubscription: isDev ? {
    id: 'mock_sub_id',
    status: 'ACTIVE' as const,
    stripeSubscriptionId: 'mock_stripe_sub_id',
    currentPeriodStart: new Date(),
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    cancelAtPeriodEnd: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: 'mock_user_id'
  } : null,
  
  isDevelopment: isDev,

  /**
   * Helper to calculate subscription periods
   * Useful for testing different subscription states
   */
  getTestPeriod(daysFromNow: number) {
    const now = new Date();
    return {
      start: now,
      end: new Date(now.getTime() + daysFromNow * 24 * 60 * 60 * 1000)
    };
  },

  /**
   * Mock a subscription status
   * @param status The desired subscription status
   * @param daysRemaining Days until subscription ends
   */
  getMockSubscription(status: 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'EXPIRED', daysRemaining = 30) {
    if (!isDev) return null;
    
    const period = this.getTestPeriod(daysRemaining);
    return {
      ...this.mockSubscription,
      status,
      currentPeriodStart: period.start,
      currentPeriodEnd: period.end
    };
  }
};

/**
 * Utility functions for subscription management
 */
export const subscriptionUtils = {
  /**
   * Calculate savings between monthly and yearly plans
   */
  calculateYearlySavings(): number {
    const monthlyAnnualCost = SUBSCRIPTION_PLANS.MONTHLY.amount * 12;
    return monthlyAnnualCost - SUBSCRIPTION_PLANS.YEARLY.amount;
  },

  /**
   * Get monthly equivalent cost for yearly plan
   */
  getMonthlyEquivalent(): number {
    return SUBSCRIPTION_PLANS.YEARLY.amount / 12;
  },

  /**
   * Format price for display
   */
  formatPrice(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
};

// Type guard for subscription status
export function isValidSubscriptionStatus(
  status: unknown
): status is 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'EXPIRED' {
  return typeof status === 'string' && 
    ['ACTIVE', 'PAST_DUE', 'CANCELED', 'EXPIRED'].includes(status);
}