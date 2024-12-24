// components/dashboard/SubscriptionSection.tsx
import { useState } from 'react';
import { CreditCard, Loader2 } from 'lucide-react';
import { SUBSCRIPTION_PLANS, DEV_HELPERS } from '@/lib/subscription';
import { isStripeConfigured } from '@/lib/config/client-stripe';
import type { Subscription } from  '@/types';

interface SubscriptionSectionProps {
  subscription: Subscription | null;
}

export function SubscriptionSection({ subscription }: SubscriptionSectionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // In development, use mock subscription data
  if (process.env.NODE_ENV === 'development') {
    console.log('SubscriptionSection received:', { subscription });
  }

  const isValidSubscription = subscription && 
    subscription.status === 'ACTIVE' && 
    new Date(subscription.currentPeriodEnd) > new Date();

  const handleCheckout = async (interval: 'month' | 'year') => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if Stripe is configured
      if (!isStripeConfigured()) {
        setError('Payment system is not configured. Please try again later.');
        return;
      }

      // In development, simulate redirect with delay
      if (DEV_HELPERS.isDevelopment) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('Development mode - Simulating checkout for:', interval);
        window.location.href = '/dashboard?dev_checkout=success';
        return;
      }

      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: interval === 'month' 
            ? SUBSCRIPTION_PLANS.MONTHLY.priceId 
            : SUBSCRIPTION_PLANS.YEARLY.priceId
        }),
      });

      const { url, error: apiError } = await response.json();
      if (apiError) throw new Error(apiError);
      window.location.href = url;
    } catch (error) {
      console.error('Failed to initiate checkout:', error);
      setError('Failed to initiate checkout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // If Stripe is not configured, show a message
  if (!isStripeConfigured()) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Premium Features</h2>
        </div>
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <p className="text-sm text-yellow-800">
            Premium features are currently unavailable. Please check back later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Premium Features</h2>
        {isValidSubscription && (
          <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
            Active
          </span>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Monthly Plan */}
        <div className="rounded-lg border p-4 shadow-sm">
          <h3 className="font-medium">{SUBSCRIPTION_PLANS.MONTHLY.name}</h3>
          <p className="mt-1 text-2xl font-semibold">
            ${SUBSCRIPTION_PLANS.MONTHLY.amount}
            <span className="text-sm font-normal text-gray-500">/month</span>
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            {SUBSCRIPTION_PLANS.MONTHLY.features.map((feature) => (
              <li key={feature} className="flex items-center">
                <svg className="mr-2 h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {feature}
              </li>
            ))}
          </ul>
          <button
            onClick={() => handleCheckout('month')}
            disabled={isLoading || isValidSubscription}
            className={`mt-6 flex w-full items-center justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm ${
              isValidSubscription
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-black hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black'
            }`}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CreditCard className="mr-2 h-4 w-4" />
            )}
            {isValidSubscription ? 'Current Plan' : 'Subscribe Monthly'}
          </button>
        </div>

        {/* Yearly Plan */}
        <div className="rounded-lg border p-4 shadow-sm">
          <h3 className="font-medium">{SUBSCRIPTION_PLANS.YEARLY.name}</h3>
          <p className="mt-1 text-2xl font-semibold">
            ${SUBSCRIPTION_PLANS.YEARLY.amount}
            <span className="text-sm font-normal text-gray-500">/year</span>
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            {SUBSCRIPTION_PLANS.YEARLY.features.map((feature) => (
              <li key={feature} className="flex items-center">
                <svg className="mr-2 h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {feature}
              </li>
            ))}
          </ul>
          <button
            onClick={() => handleCheckout('year')}
            disabled={isLoading || isValidSubscription}
            className={`mt-6 flex w-full items-center justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm ${
              isValidSubscription
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-black hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black'
            }`}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CreditCard className="mr-2 h-4 w-4" />
            )}
            {isValidSubscription ? 'Current Plan' : 'Subscribe Yearly'}
          </button>
        </div>
      </div>
    </div>
  );
}