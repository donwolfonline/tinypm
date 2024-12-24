// lib/config/server-stripe.ts
import Stripe from 'stripe';
import { env } from './env';

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
      const { secretKey, webhookSecret } = env.stripe;

      if (!secretKey || !webhookSecret) {
        console.error('Stripe server configuration:', {
          secretKey: !!secretKey,
          webhookSecret: !!webhookSecret
        });
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
export const WEBHOOK_SECRET = env.stripe.webhookSecret;