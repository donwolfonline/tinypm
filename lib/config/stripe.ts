// lib/config/stripe.ts
import Stripe from 'stripe';

/**
 * Core configuration interfaces
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
 * Environment configuration error handling
 */
class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

/**
 * Environment variable validation with type narrowing
 * @throws ConfigurationError if required variables are missing
 */
function getRequiredEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new ConfigurationError(`Missing required environment variable: ${name}`);
  }
  return value;
}

/**
 * Server-side configuration management
 * Only accessible in server contexts
 */
class ServerConfig {
  private static instance: ServerConfig | null = null;
  private readonly config: StripeConfig;

  private constructor() {
    if (typeof window !== 'undefined') {
      throw new ConfigurationError('ServerConfig cannot be instantiated on the client side');
    }

    // Validate and collect all required environment variables
    try {
      this.config = {
        secretKey: getRequiredEnvVar('STRIPE_SECRET_KEY'),
        webhookSecret: getRequiredEnvVar('STRIPE_WEBHOOK_SECRET'),
        publishableKey: getRequiredEnvVar('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'),
        prices: {
          premiumMonthly: getRequiredEnvVar('NEXT_PUBLIC_STRIPE_PREMIUM_MONTHLY_PRICE_ID'),
          premiumYearly: getRequiredEnvVar('NEXT_PUBLIC_STRIPE_PREMIUM_YEARLY_PRICE_ID'),
        }
      };
    } catch (error) {
      if (error instanceof ConfigurationError) {
        throw error;
      }
      throw new ConfigurationError('Failed to initialize Stripe configuration');
    }
  }

  static getInstance(): ServerConfig {
    if (!ServerConfig.instance) {
      ServerConfig.instance = new ServerConfig();
    }
    return ServerConfig.instance;
  }

  getConfig(): StripeConfig {
    return this.config;
  }
}

/**
 * Public configuration accessible on both client and server
 */
interface PublicConfig {
  publishableKey: string;
  prices: {
    premiumMonthly: string;
    premiumYearly: string;
  };
}

/**
 * Client-side configuration management
 */
class ClientConfig {
  private static instance: ClientConfig | null = null;
  private readonly config: PublicConfig;

  private constructor() {
    try {
      this.config = {
        publishableKey: getRequiredEnvVar('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'),
        prices: {
          premiumMonthly: getRequiredEnvVar('NEXT_PUBLIC_STRIPE_PREMIUM_MONTHLY_PRICE_ID'),
          premiumYearly: getRequiredEnvVar('NEXT_PUBLIC_STRIPE_PREMIUM_YEARLY_PRICE_ID'),
        }
      };
    } catch (error) {
      if (error instanceof ConfigurationError) {
        throw error;
      }
      throw new ConfigurationError('Failed to initialize public configuration');
    }
  }

  static getInstance(): ClientConfig {
    if (!ClientConfig.instance) {
      ClientConfig.instance = new ClientConfig();
    }
    return ClientConfig.instance;
  }

  getConfig(): PublicConfig {
    return this.config;
  }
}

/**
 * URL helper for Stripe redirects
 */
export function getURL(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL 
    ?? process.env.NEXT_PUBLIC_VERCEL_URL 
    ?? 'http://dev.tiny.pm:3131';

  return url.endsWith('/') ? url : `${url}/`;
}

/**
 * Initialize Stripe instance
 * Only available in server contexts
 */
function initializeStripe(): Stripe {
  if (typeof window !== 'undefined') {
    throw new ConfigurationError('Stripe can only be initialized on the server side');
  }

  const config = ServerConfig.getInstance().getConfig();
  return new Stripe(config.secretKey, {
    apiVersion: '2024-11-20.acacia' as const,
    typescript: true,
  });
}

// Export singleton instances with proper typing
export const stripe = initializeStripe();
export const stripeConfig = ServerConfig.getInstance().getConfig();
export const publicConfig = ClientConfig.getInstance().getConfig();

// Type-safe helper for accessing price IDs
export function getStripePrice(type: keyof PublicConfig['prices']): string {
  return publicConfig.prices[type];
}