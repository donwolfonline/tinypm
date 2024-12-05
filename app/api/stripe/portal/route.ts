// app/api/stripe/portal/route.ts
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { stripe } from '@/lib/config/server-stripe'; // Updated import
import prisma from '@/lib/prisma';
import { headers } from 'next/headers';

/**
 * Handles creation of Stripe Customer Portal sessions
 * Enables customers to manage their subscription, payment methods, and billing details
 */
export async function POST() {
  try {
    // Validate authentication
    const session = await getAuthSession();
    if (!session?.user?.email) {
      return NextResponse.json({ 
        error: 'Authentication required' 
      }, { status: 401 });
    }

    // Fetch user with subscription data
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { subscription: true }
    });

    if (!user?.stripeCustomerId) {
      return NextResponse.json({ 
        error: 'No billing account found' 
      }, { status: 404 });
    }

    // Determine return URL based on environment
    const headersList = await headers();
    const host = headersList.get('host');
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? `${protocol}://${host}`;
    const returnUrl = new URL('/dashboard', baseUrl).toString();

    // Create portal session with configuration
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: returnUrl,
      configuration: process.env.STRIPE_PORTAL_CONFIG_ID
    });

    return NextResponse.json({ url: portalSession.url });
    
  } catch (error) {
    // Log detailed error information
    console.error('Portal session error:', {
      error,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({ 
      error: 'Failed to create portal session' 
    }, { status: 500 });
  }
}