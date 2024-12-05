// lib/stripe.ts
import { stripe, getStripePrice, getURL } from './config/stripe';

export { stripe, getStripePrice, getURL };

// If you need direct access to the config values:
export const PREMIUM_MONTHLY_PRICE = getStripePrice('premiumMonthly');
export const PREMIUM_YEARLY_PRICE = getStripePrice('premiumYearly');