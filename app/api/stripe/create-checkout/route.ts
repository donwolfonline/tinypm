// app/api/stripe/create-checkout/route.ts
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { stripe } from '@/lib/config/server-stripe'; // Updated import
import { SUBSCRIPTION_PLANS } from '@/lib/subscription';
import prisma from '@/lib/prisma';
import { headers } from 'next/headers';

/**
 * Helper to get the fully qualified URL for redirect
 * Handles various deployment environments correctly
 */
async function getBaseUrl(): Promise<string> {
  // First try the configured app URL
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (configuredUrl) {
    return configuredUrl.endsWith('/') ? configuredUrl : `${configuredUrl}/`;
  }

  // Fallback to request origin for preview deployments
  const headersList = await headers();
  const host = headersList.get('host');
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  return `${protocol}://${host}/`;
}

export async function POST(req: Request) {
  try {
    // Parse and validate request body
    let priceId: string;
    try {
      const body = await req.json();
      priceId = body.priceId;
    } catch (e) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // Validate authentication
    const session = await getAuthSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Validate price ID against our plans
    const matchingPlan = Object.values(SUBSCRIPTION_PLANS)
      .find(plan => plan.priceId === priceId);
    
    if (!matchingPlan) {
      console.error(`Invalid price ID attempted: ${priceId}`);
      return NextResponse.json({ 
        error: 'Invalid subscription plan selected' 
      }, { status: 400 });
    }

    // Fetch user with subscription status
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { subscription: true }
    });

    if (!user) {
      console.error(`User not found for email: ${session.user.email}`);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Handle existing subscriptions
    if (user.subscription?.status === 'ACTIVE') {
      return NextResponse.json({ 
        error: 'User already has an active subscription' 
      }, { status: 400 });
    }

    // Get or create Stripe customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      try {
        const customer = await stripe.customers.create({
          email: user.email!,
          name: user.name ?? undefined,
          metadata: { 
            userId: user.id,
            environment: process.env.NODE_ENV
          }
        });
        customerId = customer.id;
        await prisma.user.update({
          where: { id: user.id },
          data: { stripeCustomerId: customerId }
        });
      } catch (e) {
        console.error('Failed to create/update Stripe customer:', e);
        return NextResponse.json({ 
          error: 'Payment configuration failed' 
        }, { status: 500 });
      }
    }

    // Prepare success/cancel URLs
    const baseUrl = await getBaseUrl();
    const successUrl = new URL('dashboard', baseUrl);
    const cancelUrl = new URL('dashboard', baseUrl);
    successUrl.searchParams.set('success', 'true');
    cancelUrl.searchParams.set('canceled', 'true');

    // Create checkout session
    try {
      const checkoutSession = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{
          price: priceId,
          quantity: 1,
        }],
        automatic_tax: { enabled: true },
        customer_update: {
          address: 'auto',
          name: 'auto',
        },
        tax_id_collection: { enabled: true },
        allow_promotion_codes: true,
        success_url: successUrl.toString(),
        cancel_url: cancelUrl.toString(),
        metadata: { 
          userId: user.id,
          planId: matchingPlan.priceId,
          environment: process.env.NODE_ENV
        }
      });

      return NextResponse.json({ url: checkoutSession.url });
    } catch (e) {
      console.error('Stripe checkout session creation failed:', e);
      return NextResponse.json({ 
        error: 'Failed to initialize checkout' 
      }, { status: 500 });
    }

  } catch (error) {
    // Log the full error for debugging
    console.error('Unhandled checkout error:', {
      error,
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { error: 'An unexpected error occurred' }, 
      { status: 500 }
    );
  }
}