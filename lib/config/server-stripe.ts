// lib/config/server-stripe.ts
import Stripe from 'stripe';

/**
 * Server-side only Stripe configuration and initialization
 * This file should never be imported by client components
 */
class ServerStripeConfig {
  private static instance: Stripe | null = null;

  static getInstance(): Stripe {
    if (typeof window !== 'undefined') {
      throw new Error('Stripe instance cannot be accessed on the client side');
    }

    if (!this.instance) {
      const secretKey = process.env.STRIPE_SECRET_KEY;
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!secretKey || !webhookSecret) {
        throw new Error('Missing required Stripe server configuration');
      }

      this.instance = new Stripe(secretKey, {
        apiVersion: '2024-11-20.acacia' as const,
        typescript: true,
      });
    }

    return this.instance;
  }
}

// Export the server-side Stripe instance
export const stripe = ServerStripeConfig.getInstance();
export const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;