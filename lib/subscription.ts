// lib/subscription.ts
import { getStripePrice, isStripeConfigured } from './config/client-stripe';

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
  
  // Return empty string if Stripe is not configured
  if (!isStripeConfigured()) {
    console.log('Stripe is not configured, using placeholder price ID');
    return '';
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
    amount: 39.99,
    features: [
      'Custom domain support',
      'Priority support',
      'Remove tiny.pm branding',
      '2 months free'
    ]
  }
};

// Development helpers
export const DEV_HELPERS = {
  isDevelopment: process.env.NODE_ENV === 'development',
  
  /**
   * Helper to calculate subscription periods
   * Useful for testing different subscription states
   */
  getTestPeriod(daysFromNow: number) {
    const now = new Date();
    const future = new Date();
    future.setDate(now.getDate() + daysFromNow);
    return {
      start: now.toISOString(),
      end: future.toISOString()
    };
  },

  /**
   * Mock a subscription status
   * @param status The desired subscription status
   * @param daysRemaining Days until subscription ends
   */
  getMockSubscription(status: 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'EXPIRED', daysRemaining = 30) {
    const { start, end } = this.getTestPeriod(daysRemaining);
    return {
      id: 'mock_sub_id',
      status,
      priceId: DEV_PRICE_IDS.MONTHLY,
      currentPeriodStart: start,
      currentPeriodEnd: end,
      cancelAtPeriodEnd: status === 'CANCELED'
    };
  }
};

/**
 * Utility functions for subscription management
 */
export const SUBSCRIPTION_UTILS = {
  /**
   * Calculate savings between monthly and yearly plans
   */
  calculateYearlySavings(): number {
    const monthlyTotal = SUBSCRIPTION_PLANS.MONTHLY.amount * 12;
    return monthlyTotal - SUBSCRIPTION_PLANS.YEARLY.amount;
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
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  }
};

/**
 * Type guard for subscription status
 */
export function isValidSubscriptionStatus(
  status: unknown
): status is 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'EXPIRED' {
  return typeof status === 'string' && ['ACTIVE', 'PAST_DUE', 'CANCELED', 'EXPIRED'].includes(status);
}