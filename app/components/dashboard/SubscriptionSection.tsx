// components/dashboard/SubscriptionSection.tsx
import { useState } from 'react';
import { CreditCard, Loader2 } from 'lucide-react';
import { SUBSCRIPTION_PLANS, DEV_HELPERS } from '@/lib/subscription';
import type { Subscription } from '@prisma/client';

interface SubscriptionSectionProps {
 subscription: Subscription | null;
}

export function SubscriptionSection({ subscription }: SubscriptionSectionProps) {
 const [isLoading, setIsLoading] = useState(false);

 // In development, use mock subscription data
 const effectiveSubscription = DEV_HELPERS.isDevelopment 
   ? DEV_HELPERS.mockSubscription 
   : subscription;

 const handleCheckout = async (interval: 'month' | 'year') => {
   try {
     setIsLoading(true);

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

     const { url, error } = await response.json();
     if (error) throw new Error(error);
     window.location.href = url;
   } catch (error) {
     console.error('Failed to initiate checkout:', error);
   } finally {
     setIsLoading(false);
   }
 };

 const handlePortal = async () => {
   try {
     setIsLoading(true);

     // In development, simulate portal redirect
     if (DEV_HELPERS.isDevelopment) {
       await new Promise(resolve => setTimeout(resolve, 1000));
       console.log('Development mode - Simulating portal access');
       window.location.href = '/dashboard?dev_portal=success';
       return;
     }

     const response = await fetch('/api/stripe/portal', { method: 'POST' });
     const { url, error } = await response.json();
     if (error) throw new Error(error);
     window.location.href = url;
   } catch (error) {
     console.error('Failed to open customer portal:', error);
   } finally {
     setIsLoading(false);
   }
 };

 // Active subscription UI remains the same for both dev and prod
 if (effectiveSubscription?.status === 'ACTIVE') {
   return (
     <div className="space-y-4">
       <h3 className="font-medium">Subscription</h3>
       <div className="rounded-lg bg-green-50 p-4">
         <div className="flex items-center justify-between">
           <div>
             <p className="font-medium text-green-800">Premium Active</p>
             <p className="text-sm text-green-700">
               Renews {new Date(effectiveSubscription.currentPeriodEnd).toLocaleDateString()}
             </p>
           </div>
           <button
             onClick={handlePortal}
             disabled={isLoading}
             className="flex items-center gap-2 rounded-lg border border-green-300 bg-white px-4 py-2 text-sm text-green-700 hover:bg-green-50"
           >
             {isLoading ? (
               <Loader2 className="h-4 w-4 animate-spin" />
             ) : (
               <CreditCard className="h-4 w-4" />
             )}
             Manage Billing
           </button>
         </div>
       </div>
     </div>
   );
 }

 // Upgrade UI remains the same for both dev and prod
 return (
   <div className="space-y-4">
     <h3 className="font-medium">Upgrade to Premium</h3>
     <div className="rounded-lg border border-gray-200 p-4">
       <div className="space-y-4">
         <div className="flex flex-col gap-2">
           <p className="font-medium">Premium Features</p>
           <ul className="list-inside list-disc space-y-1 text-sm text-gray-600">
             <li>Custom Domain Support</li>
             <li>Advanced Analytics</li>
             <li>Priority Support</li>
             <li>No Branding</li>
           </ul>
         </div>
         <div className="flex gap-3">
           <button
             onClick={() => handleCheckout('month')}
             disabled={isLoading}
             className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm hover:bg-gray-50"
           >
             {isLoading ? (
               <Loader2 className="h-4 w-4 animate-spin" />
             ) : (
               `$${SUBSCRIPTION_PLANS.MONTHLY.amount}/month`
             )}
           </button>
           <button
             onClick={() => handleCheckout('year')}
             disabled={isLoading}
             className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
           >
             {isLoading ? (
               <Loader2 className="h-4 w-4 animate-spin" />
             ) : (
               `$${SUBSCRIPTION_PLANS.YEARLY.amount}/year`
             )}
           </button>
         </div>
       </div>
     </div>
   </div>
 );
}