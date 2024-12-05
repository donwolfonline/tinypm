// lib/config/client-stripe.ts
/**
 * Client-safe configuration
 * Only includes public values that are safe to expose in the browser
 */

export interface StripePublicConfig {
  publishableKey: string;
  prices: {
    premiumMonthly: string;
    premiumYearly: string;
  };
}

class ClientStripeConfig {
  private static validateConfig(): StripePublicConfig {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    const premiumMonthly = process.env.NEXT_PUBLIC_STRIPE_PREMIUM_MONTHLY_PRICE_ID;
    const premiumYearly = process.env.NEXT_PUBLIC_STRIPE_PREMIUM_YEARLY_PRICE_ID;

    if (!publishableKey || !premiumMonthly || !premiumYearly) {
      throw new Error('Missing required Stripe public configuration');
    }

    return {
      publishableKey,
      prices: {
        premiumMonthly,
        premiumYearly
      }
    };
  }

  static getConfig(): StripePublicConfig {
    return this.validateConfig();
  }
}

export const stripePublicConfig = ClientStripeConfig.getConfig();

// Helper functions that are safe to use on the client
export function getStripePrice(type: keyof StripePublicConfig['prices']): string {
  return stripePublicConfig.prices[type];
}

export function getURL(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL 
    ?? process.env.NEXT_PUBLIC_VERCEL_URL 
    ?? 'http://dev.tiny.pm:3131';

  return url.endsWith('/') ? url : `${url}/`;
}