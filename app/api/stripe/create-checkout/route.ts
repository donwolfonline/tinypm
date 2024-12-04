// app/api/stripe/create-checkout/route.ts
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { SUBSCRIPTION_PLANS } from '@/lib/subscription';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { priceId } = await req.json();
    const session = await getAuthSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Validate priceId matches one of our plans
    const isValidPriceId = Object.values(SUBSCRIPTION_PLANS)
      .some(plan => plan.priceId === priceId);
    if (!isValidPriceId) {
      return NextResponse.json({ error: 'Invalid price ID' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { subscription: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get or create Stripe customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
        name: user.name ?? undefined,
        metadata: { userId: user.id }
      });
      customerId = customer.id;
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId }
      });
    }

    // Create checkout session with tax and usage collection
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      // Collect necessary info for tax compliance
      automatic_tax: { enabled: true },
      customer_update: {
        address: 'auto',
        name: 'auto',
      },
      tax_id_collection: { enabled: true },
      // Allow customers to promote codes
      allow_promotion_codes: true,
      // Use Stripe's hosted success/cancel pages
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?canceled=true`,
      metadata: { userId: user.id }
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' }, 
      { status: 500 }
    );
  }
}

