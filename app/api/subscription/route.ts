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

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prisma = await getPrismaClient();
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        subscription: true,
      },
    });

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
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}