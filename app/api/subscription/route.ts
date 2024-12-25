// app/api/subscription/route.ts
import { NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';
import { Prisma } from '@prisma/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Set a reasonable timeout for subscription operations
const SUBSCRIPTION_TIMEOUT = 10000; // 10 seconds

// Custom error for timeout
class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimeoutError';
  }
}

export async function GET(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const prisma = await getPrismaClient();
    
    // Use Promise.race to implement timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new TimeoutError('Subscription query timed out')), SUBSCRIPTION_TIMEOUT);
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

    const user = await Promise.race([subscriptionPromise, timeoutPromise]) as Awaited<typeof subscriptionPromise>;

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      subscription: user.subscription,
      stripeCustomerId: user.stripeCustomerId,
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    
    if (error instanceof TimeoutError) {
      return NextResponse.json(
        { error: 'Subscription service temporarily unavailable' },
        { status: 503 }
      );
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}