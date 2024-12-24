// app/api/subscription/route.ts
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// Helper function to check database connection
async function checkDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection check failed:', error);
    return false;
  }
}

export async function GET() {
  try {
    // Check database connection first
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
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

    console.log('Fetching subscription for user:', session.user.email);

    // First, ensure the user exists
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      console.log('User not found:', session.user.email);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch subscription with user information
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
      },
      select: {
        id: true,
        status: true,
        stripeSubscriptionId: true,
        currentPeriodStart: true,
        currentPeriodEnd: true,
        cancelAtPeriodEnd: true,
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (process.env.NODE_ENV === 'development') {
      console.log('Fetched subscription:', subscription);
    }

    // Return null if no subscription found (this is a valid state)
    return NextResponse.json({ subscription: subscription || null });
  } catch (error) {
    console.error('Error in subscription API:', error);
    
    // Handle Prisma-specific errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error('Prisma known error:', {
        code: error.code,
        message: error.message,
        meta: error.meta,
      });
      return NextResponse.json(
        { error: 'Database error', code: error.code, details: error.message },
        { status: 500 }
      );
    }

    if (error instanceof Prisma.PrismaClientInitializationError) {
      console.error('Prisma initialization error:', error.message);
      return NextResponse.json(
        { error: 'Database initialization error', details: error.message },
        { status: 503 }
      );
    }

    if (error instanceof Prisma.PrismaClientRustPanicError) {
      console.error('Prisma client panic error:', error.message);
      return NextResponse.json(
        { error: 'Critical database error', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to fetch subscription',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}