// hooks/use-subscription.ts
import { useState } from 'react';
import { SUBSCRIPTION_PLANS } from '@/lib/subscription';

export function useSubscription() {
  const [isLoading, setIsLoading] = useState(false);

  const createCheckoutSession = async (interval: 'month' | 'year') => {
    try {
      setIsLoading(true);
      const priceId = interval === 'month' 
        ? SUBSCRIPTION_PLANS.MONTHLY.priceId
        : SUBSCRIPTION_PLANS.YEARLY.priceId;

      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId })
      });

      const { url, error } = await response.json();
      if (error) throw new Error(error);
      
      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      console.error('Checkout error:', error);
      // Handle error (show toast, etc.)
    } finally {
      setIsLoading(false);
    }
  };

  const createPortalSession = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/stripe/portal', {
        method: 'POST'
      });

      const { url, error } = await response.json();
      if (error) throw new Error(error);

      // Redirect to Customer Portal
      window.location.href = url;
    } catch (error) {
      console.error('Portal error:', error);
      // Handle error
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    createCheckoutSession,
    createPortalSession
  };
}