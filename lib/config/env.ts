// lib/config/env.ts

const getEnvironmentVariable = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

const validateEnvironment = () => {
  // Validate all required environment variables
  const requiredVars = [
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'NEXT_PUBLIC_STRIPE_PREMIUM_MONTHLY_PRICE_ID',
    'NEXT_PUBLIC_STRIPE_PREMIUM_YEARLY_PRICE_ID',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET'
  ];

  const missing = requiredVars.filter(key => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

// Validate environment variables immediately
validateEnvironment();

export const env = {
  stripe: {
    publishableKey: getEnvironmentVariable('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'),
    premiumMonthlyPriceId: getEnvironmentVariable('NEXT_PUBLIC_STRIPE_PREMIUM_MONTHLY_PRICE_ID'),
    premiumYearlyPriceId: getEnvironmentVariable('NEXT_PUBLIC_STRIPE_PREMIUM_YEARLY_PRICE_ID'),
    secretKey: getEnvironmentVariable('STRIPE_SECRET_KEY'),
    webhookSecret: getEnvironmentVariable('STRIPE_WEBHOOK_SECRET')
  },
  nextPublic: {
    appUrl: process.env.NEXT_PUBLIC_APP_URL || '',
    vercelUrl: process.env.NEXT_PUBLIC_VERCEL_URL || ''
  }
};
