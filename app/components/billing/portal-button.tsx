// // components/billing/portal-button.tsx
// 'use client';

// import { useState } from 'react';
// import { Button } from '@/components/ui/button';

// interface PortalButtonProps {
//   className?: string;
// }

// export function PortalButton({ className }: PortalButtonProps) {
//   const [loading, setLoading] = useState(false);

//   const handlePortalAccess = async () => {
//     try {
//       setLoading(true);

//       const response = await fetch('/api/stripe/portal', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         }
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.error || 'Failed to access billing portal');
//       }

//       // Redirect to Stripe portal
//       window.location.href = data.url;
      
//     } catch (error) {
//       console.error('Portal access error:', error);
//       // You might want to add a toast notification here
      
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Button
//       onClick={handlePortalAccess}
//       disabled={loading}
//       className={className}
//     >
//       {loading ? 'Loading...' : 'Manage Subscription'}
//     </Button>
//   );
// }