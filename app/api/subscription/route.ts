// app/api/subscription/route.ts
import { NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';
import { Prisma, SubscriptionStatus } from '@prisma/client';
import Stripe from 'stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

// Set a reasonable timeout for subscription operations
const SUBSCRIPTION_TIMEOUT = 10000; // 10 seconds

export async function GET(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prisma = await getPrismaClient();
    
    // Use Promise.race to implement timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Subscription query timed out')), SUBSCRIPTION_TIMEOUT);
    });

    const subscriptionPromise = prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        stripeCustomerId: true,
        subscription: {
          select: {
            id: true,
            status: true,
            currentPeriodEnd: true,
            cancelAtPeriodEnd: true,
          },
        },
      },
    });

    const user = await Promise.race([subscriptionPromise, timeoutPromise]) as any;

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Return free plan if no subscription
    if (!user.subscription) {
      return NextResponse.json({
        subscription: {
          plan: 'free',
          status: SubscriptionStatus.EXPIRED,
          active: false,
          cancelAtPeriodEnd: false,
          currentPeriodEnd: null,
          stripeSubscriptionId: null,
          stripeCustomerId: user.stripeCustomerId || null,
        },
      });
    }

    // Format subscription data
    const subscription = {
      plan: 'pro', // We'll get this from Stripe metadata later
      status: user.subscription.status,
      active: user.subscription.status === SubscriptionStatus.ACTIVE,
      cancelAtPeriodEnd: user.subscription.cancelAtPeriodEnd,
      currentPeriodEnd: user.subscription.currentPeriodEnd,
      stripeSubscriptionId: user.subscription.stripeSubscriptionId,
      stripeCustomerId: user.stripeCustomerId,
    };

    return NextResponse.json({ subscription });
  } catch (error) {
    console.error('Error in subscription API:', error);
    
    if (error.message === 'Subscription query timed out') {
      return NextResponse.json(
        { error: 'Subscription service temporarily unavailable' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}