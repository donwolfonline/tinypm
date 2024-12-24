// lib/config/env.ts

const getEnvironmentVariable = (key: string, required: boolean = true): string => {
  const value = process.env[key];
  if (!value && required && typeof window === 'undefined') { // Only throw on server side
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || '';
};

const validateEnvironment = () => {
  // Only validate on server side
  if (typeof window !== 'undefined') {
    return;
  }

  // Validate auth-related environment variables
  const requiredVars = [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'NEXTAUTH_SECRET'
  ];

  const missing = requiredVars.filter(key => !process.env[key]);
  if (missing.length > 0) {
    console.error('Missing environment variables:', missing);
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

// Validate environment variables immediately, but only on server side
if (typeof window === 'undefined') {
  validateEnvironment();
}

export const env = {
  stripe: {
    publishableKey: getEnvironmentVariable('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', false),
    premiumMonthlyPriceId: getEnvironmentVariable('NEXT_PUBLIC_STRIPE_PREMIUM_MONTHLY_PRICE_ID', false),
    premiumYearlyPriceId: getEnvironmentVariable('NEXT_PUBLIC_STRIPE_PREMIUM_YEARLY_PRICE_ID', false),
    secretKey: getEnvironmentVariable('STRIPE_SECRET_KEY', false),
    webhookSecret: getEnvironmentVariable('STRIPE_WEBHOOK_SECRET', false)
  },
  nextPublic: {
    appUrl: process.env.NEXT_PUBLIC_APP_URL || '',
    vercelUrl: process.env.NEXT_PUBLIC_VERCEL_URL || ''
  },
  auth: {
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    nextAuthUrl: process.env.NEXTAUTH_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'
  }
};
