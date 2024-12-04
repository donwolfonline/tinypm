'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, Sparkles } from 'lucide-react';

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);

  // Isolated pricing toggle component with smooth transitions
  const PricingToggle = () => (
    <div className="mb-12 text-center">
      <div className="inline-flex items-center rounded-lg border-2 border-black bg-white p-1">
        <button
          onClick={() => setIsYearly(false)}
          className={`relative px-4 py-2 transition-all duration-300 ${
            !isYearly ? 'rounded-md bg-black text-[#FFCC00]' : 'text-black hover:bg-black/5'
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setIsYearly(true)}
          className={`group relative px-4 py-2 transition-all duration-300 ${
            isYearly ? 'rounded-md bg-black text-[#FFCC00]' : 'text-black hover:bg-black/5'
          }`}
        >
          Yearly
          {/* Savings indicator that follows the yearly toggle */}
          <span
            className={`absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#FFCC00] text-xs font-bold text-black transition-all duration-300 ${
              isYearly ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
            }`}
          >
            💫
          </span>
        </button>
      </div>
      {/* Savings callout below toggle */}
      <div
        className={`mt-2 text-sm transition-all duration-300 ${
          isYearly ? 'transform-none opacity-100' : '-translate-y-2 opacity-0'
        }`}
      >
        Save $4 yearly
      </div>
    </div>
  );

  // Premium button with integrated checkout handling
  const PremiumButton = () => {
    const handleCheckout = async () => {
      try {
        const response = await fetch('/api/create-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isYearly }),
        });
        const { url } = await response.json();
        if (url) window.location.href = url;
      } catch (error) {
        console.error('Checkout error:', error);
      }
    };

    return (
      <button
        onClick={handleCheckout}
        className="group mb-8 block w-full rounded-lg bg-[#FFCC00] px-4 py-2 text-center text-black transition-all duration-300 hover:bg-[#FFD700]"
      >
        <span className="inline-flex items-center gap-2">
          Get Premium
          {isYearly && (
            <Sparkles className="h-4 w-4 transition-all duration-300 group-hover:scale-110" />
          )}
        </span>
      </button>
    );
  };

  return (
    <main className="min-h-screen bg-[#FFCC00]">
      <div className="mx-auto max-w-5xl px-4 py-16">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-black/60 transition-colors hover:text-black"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <h1 className="mb-8 text-4xl font-bold">Simple, transparent pricing</h1>

        <PricingToggle />

        <div className="grid gap-8 md:grid-cols-3">
          {/* Free Tier */}
          <div className="rounded-lg border-2 border-black bg-white p-6 transition-all duration-300 hover:shadow-lg">
            <div className="mb-6">
              <h2 className="mb-2 text-2xl font-bold">Free</h2>
              <p className="text-black/60">Perfect for getting started</p>
            </div>
            <div className="mb-6">
              <div className="mb-1 text-3xl font-bold">$0</div>
              <div className="text-sm text-black/60">Forever free</div>
            </div>
            <Link
              href="/login"
              className="mb-8 block rounded-lg bg-black px-4 py-2 text-center text-[#FFCC00] transition-all duration-300 hover:bg-black/80"
            >
              Get Started
            </Link>
            <ul className="space-y-4">
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-600" />
                <span>Unlimited links</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-600" />
                <span>Basic analytics</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-600" />
                <span>Custom profile</span>
              </li>
            </ul>
          </div>

          {/* Premium Tier */}
          <div className="relative rounded-lg border-2 border-black bg-black p-6 text-[#FFCC00] transition-all duration-300 hover:shadow-lg">
            {/* Best Value indicator */}
            {isYearly && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border-2 border-black bg-[#FFCC00] px-3 py-1 text-xs font-bold text-black shadow-sm">
                Best Value
              </div>
            )}
            <div className="mb-6">
              <h2 className="mb-2 text-2xl font-bold">Premium</h2>
              <p className="text-[#FFCC00]/60">For creators and professionals</p>
            </div>
            <div className="mb-6">
              <div className="mb-1 text-3xl font-bold transition-all duration-300">
                {isYearly ? '$20' : '$1.99'}
              </div>
              <div className="text-sm text-[#FFCC00]/60">per {isYearly ? 'year' : 'month'}</div>
            </div>
            <PremiumButton />
            <ul className="space-y-4">
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-[#FFCC00]" />
                <span>Everything in Free</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-[#FFCC00]" />
                <span>Custom domain support</span>
              </li>
              {/* <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-[#FFCC00]" />
                <span>Advanced analytics</span>
              </li> */}
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-[#FFCC00]" />
                <span>Priority support</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-[#FFCC00]" />
                <span>No TinyPM branding</span>
              </li>
            </ul>
          </div>

          {/* Enterprise Tier */}
          <div className="rounded-lg border-2 border-black bg-white p-6 transition-all duration-300 hover:shadow-lg">
            <div className="mb-6">
              <h2 className="mb-2 text-2xl font-bold">Enterprise</h2>
              <p className="text-black/60">For large organizations</p>
            </div>
            <div className="mb-6">
              <div className="mb-1 text-3xl font-bold">Custom</div>
              <div className="text-sm text-black/60">Contact for pricing</div>
            </div>
            <Link
              href="mailto:enterprise@tiny.pm"
              className="mb-8 block rounded-lg bg-black px-4 py-2 text-center text-[#FFCC00] transition-all duration-300 hover:bg-black/80"
            >
              Contact Sales
            </Link>
            <ul className="space-y-4">
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-600" />
                <span>Everything in Premium</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-600" />
                <span>Custom integrations</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-600" />
                <span>Dedicated support</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-600" />
                <span>SLA guarantee</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-600" />
                <span>Custom features</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
