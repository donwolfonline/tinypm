// lib/subscription.ts
import { getStripePrice } from './config/stripe';

/**
 * Type definitions for subscription plans and intervals
 */
export type SubscriptionInterval = 'month' | 'year';

interface SubscriptionPlan {
  name: string;
  priceId: string;
  interval: SubscriptionInterval;
  amount: number;
  features?: string[];
}

type SubscriptionPlans = {
  readonly MONTHLY: SubscriptionPlan;
  readonly YEARLY: SubscriptionPlan;
};

const isDev = process.env.NODE_ENV === 'development';

/**
 * Subscription plan configuration
 * Uses environment variables in production, development values in dev mode
 */
export const SUBSCRIPTION_PLANS: SubscriptionPlans = {
  MONTHLY: {
    name: 'Premium Monthly',
    priceId: isDev ? 'dev_monthly' : getStripePrice('premiumMonthly'),
    interval: 'month',
    amount: 9,
    features: [
      'Custom domain support',
      'Advanced analytics',
      'Priority support',
      'Remove tiny.pm branding'
    ]
  },
  YEARLY: {
    name: 'Premium Yearly',
    priceId: isDev ? 'dev_yearly' : getStripePrice('premiumYearly'),
    interval: 'year',
    amount: 90,
    features: [
      'All Premium Monthly features',
      '2 months free',
      'Early access to new features'
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