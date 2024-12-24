// app/api/subscription/route.ts
import { NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';
import { Prisma, SubscriptionStatus } from '@prisma/client';
import Stripe from 'stripe';

export const runtime = 'nodejs'; // Force Node.js runtime

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

// Helper function to check database connection
async function checkDatabaseConnection() {
  try {
    const prisma = await getPrismaClient();
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection check failed:', error);
    return false;
  }
}

// Helper function to get Stripe subscription data
async function getStripeSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return subscription;
  } catch (error) {
    console.error('Error fetching Stripe subscription:', error);
    return null;
  }
}

export async function GET() {
  console.log('Subscription API GET request started');
  
  try {
    // Check database connection first
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      console.error('Database connection failed during subscription fetch');
      return NextResponse.json(
        { error: 'Database connection error', details: 'Could not connect to the database' },
        { status: 503 }
      );
    }

    const session = await getAuthSession();

    if (!session?.user?.email) {
      console.log('No authenticated session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Fetching subscription data for:', session.user.email);

    try {
      const prisma = await getPrismaClient();
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
          subscription: true,
        },
      });

      if (!user) {
        console.log('User not found:', session.user.email);
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // If user has no subscription, they're on the free plan
      if (!user.subscription) {
        console.log('User has no subscription, returning free plan');
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

      // Get latest Stripe data if available
      let stripeData = null;
      if (user.subscription.stripeSubscriptionId) {
        stripeData = await getStripeSubscription(user.subscription.stripeSubscriptionId);
      }

      // Format subscription data
      const subscription = {
        plan: stripeData?.items?.data[0]?.price?.lookup_key || 'free',
        status: user.subscription.status,
        active: user.subscription.status === SubscriptionStatus.ACTIVE,
        cancelAtPeriodEnd: user.subscription.cancelAtPeriodEnd,
        currentPeriodEnd: user.subscription.currentPeriodEnd,
        stripeSubscriptionId: user.subscription.stripeSubscriptionId,
        stripeCustomerId: user.stripeCustomerId,
      };

      if (process.env.NODE_ENV === 'development') {
        console.log('Subscription data:', subscription);
      }

      return NextResponse.json({ subscription });
    } catch (error) {
      console.error('Error fetching subscription:', error);

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Log specific Prisma error details
        console.error('Prisma error details:', {
          code: error.code,
          meta: error.meta,
          message: error.message,
          clientVersion: error.clientVersion,
        });

        return NextResponse.json(
          { 
            error: 'Database error',
            code: error.code,
            details: error.message
          },
          { status: 500 }
        );
      }

      if (error instanceof Prisma.PrismaClientValidationError) {
        console.error('Prisma validation error:', error.message);
        return NextResponse.json(
          { error: 'Invalid data format', details: error.message },
          { status: 400 }
        );
      }

      if (error instanceof Prisma.PrismaClientInitializationError) {
        console.error('Prisma initialization error:', error.message);
        return NextResponse.json(
          { error: 'Database initialization error', details: error.message },
          { status: 503 }
        );
      }

      throw error; // Let the outer catch handle other errors
    }
  } catch (error) {
    console.error('Error in subscription API:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch subscription',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}