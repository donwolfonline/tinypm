// lib/config/stripe.ts
import Stripe from 'stripe';

/**
 * Configuration interface for Stripe-related settings
 * Centralizes all Stripe configuration to ensure consistency
 */
interface StripeConfig {
  secretKey: string;
  publishableKey: string;
  webhookSecret: string;
  prices: {
    premiumMonthly: string;
    premiumYearly: string;
  };
}

/**
 * Environment validation function to ensure all required variables are present
 * Throws detailed errors during initialization rather than runtime
 */
function validateEnv(): StripeConfig {
  const requiredEnvVars = {
    secretKey: process.env.STRIPE_SECRET_KEY,
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    premiumMonthly: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID,
    premiumYearly: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID,
  };

  const missingVars = Object.entries(requiredEnvVars)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }

  return {
    secretKey: requiredEnvVars.secretKey!,
    publishableKey: requiredEnvVars.publishableKey!,
    webhookSecret: requiredEnvVars.webhookSecret!,
    prices: {
      premiumMonthly: requiredEnvVars.premiumMonthly!,
      premiumYearly: requiredEnvVars.premiumYearly!,
    },
  };
}

/**
 * Stripe configuration singleton
 * Ensures Stripe is only initialized once with proper configuration
 */
class StripeService {
  private static instance: Stripe;
  private static config: StripeConfig;

  static getInstance(): Stripe {
    if (!this.instance) {
      this.config = validateEnv();
      this.instance = new Stripe(this.config.secretKey, {
        apiVersion: '2024-11-20.acacia' as const,
        typescript: true,
      });
    }
    return this.instance;
  }

  static getConfig(): StripeConfig {
    if (!this.config) {
      this.config = validateEnv();
    }
    return this.config;
  }
}

/**
 * URL helper for Stripe redirects
 * Handles various environment configurations
 */
export function getURL(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL 
    ?? process.env.NEXT_PUBLIC_VERCEL_URL 
    ?? 'http://dev.tiny.pm:3131';

  return url.endsWith('/') ? url : `${url}/`;
}

// Export configured Stripe instance
export const stripe = StripeService.getInstance();

// Export configuration for use in components
export const stripeConfig = StripeService.getConfig();