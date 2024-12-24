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
  isConfigured: boolean;
}

class ClientStripeConfig {
  private static validateConfig(): StripePublicConfig {
    const { publishableKey, premiumMonthlyPriceId, premiumYearlyPriceId } = env.stripe;

    // Check if Stripe is fully configured
    const isConfigured = !!(publishableKey && premiumMonthlyPriceId && premiumYearlyPriceId);

    if (!isConfigured) {
      console.log('Stripe is not fully configured:', {
        publishableKey: !!publishableKey,
        premiumMonthlyPriceId: !!premiumMonthlyPriceId,
        premiumYearlyPriceId: !!premiumYearlyPriceId
      });
    }

    return {
      publishableKey: publishableKey || '',
      prices: {
        premiumMonthly: premiumMonthlyPriceId || '',
        premiumYearly: premiumYearlyPriceId || ''
      },
      isConfigured
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

export function isStripeConfigured(): boolean {
  return stripePublicConfig.isConfigured;
}

export function isStripeConfigured(): boolean {
  return stripePublicConfig.isConfigured;
}

export function getURL(): string {
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production env.
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
    'http://localhost:3000/';
  // Make sure to include `https://` when not localhost.
  url = url.includes('http') ? url : `https://${url}`;
  // Make sure to include trailing `/`.
  url = url.charAt(url.length - 1) === '/' ? url : `${url}/`;
  return url;
}