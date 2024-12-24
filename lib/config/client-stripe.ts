// lib/config/client-stripe.ts
import { env } from './env';

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
    const { publishableKey, premiumMonthlyPriceId, premiumYearlyPriceId } = env.stripe;

    if (!publishableKey || !premiumMonthlyPriceId || !premiumYearlyPriceId) {
      console.error('Stripe configuration:', {
        publishableKey: !!publishableKey,
        premiumMonthlyPriceId: !!premiumMonthlyPriceId,
        premiumYearlyPriceId: !!premiumYearlyPriceId
      });
      throw new Error('Missing required Stripe public configuration');
    }

    return {
      publishableKey,
      prices: {
        premiumMonthly: premiumMonthlyPriceId,
        premiumYearly: premiumYearlyPriceId
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