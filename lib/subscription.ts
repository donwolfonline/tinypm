// lib/subscription.ts

const isDev = process.env.NODE_ENV === 'development';

// Define subscription plans with fallback pricing for development
export const SUBSCRIPTION_PLANS = {
  MONTHLY: {
    name: 'Premium Monthly',
    priceId: isDev ? 'dev_monthly' : process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID!,
    interval: 'month' as const,
    amount: 9, // $9/month
  },
  YEARLY: {
    name: 'Premium Yearly',
    priceId: isDev ? 'dev_yearly' : process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID!,
    interval: 'year' as const,
    amount: 90, // $90/year ($7.50/month)
  }
} as const;

// Validate environment variables only in production
if (!isDev) {
  const requiredEnvVars = [
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'STRIPE_PREMIUM_MONTHLY_PRICE_ID',
    'STRIPE_PREMIUM_YEARLY_PRICE_ID',
  ] as const;

  requiredEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  });
}

// Development helpers for mocking subscription state
export const DEV_HELPERS = {
  mockSubscription: isDev ? {
    id: 'mock_sub_id',
    status: 'ACTIVE' as const,
    stripeSubscriptionId: 'mock_stripe_sub_id',
    currentPeriodStart: new Date(),
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    cancelAtPeriodEnd: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: 'mock_user_id'
  } : null,
  
  // Helper to check if we're in development mode
  isDevelopment: isDev
};