// lib/stripe.ts
import { getStripePrice, getURL } from './config/client-stripe';
import { stripe as serverStripe } from './config/server-stripe';

// Export server-side stripe instance, but warn about usage
export const stripe = serverStripe;

// Export client-safe utilities
export { getStripePrice, getURL };

// Pre-computed price IDs that are safe to use on the client
export const PREMIUM_MONTHLY_PRICE = getStripePrice('premiumMonthly');
export const PREMIUM_YEARLY_PRICE = getStripePrice('premiumYearly');

// Type-safe helper to determine execution context
export const isServer = typeof window === 'undefined';

/**
 * Helper to ensure stripe operations only run on server
 * @throws Error if called from client context
 */
export function assertServer() {
  if (!isServer) {
    throw new Error('This operation can only be performed on the server');
  }
}