// app/api/subscription/route.ts
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getAuthSession();

    if (!session?.user?.email) {
      console.log('No authenticated session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Fetching subscription for user:', session.user.email);

    // First, ensure the user exists
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
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
      include: {
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
    
    // Check for specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes('prisma')) {
        console.error('Prisma error:', error.message);
        return NextResponse.json(
          { error: 'Database error', details: error.message },
          { status: 500 }
        );
      }
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