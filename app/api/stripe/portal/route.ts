// app/api/stripe/portal/route.ts

import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import prisma from '@/lib/prisma';

export async function POST() {
    try {
      const session = await getAuthSession();
      if (!session?.user?.email) {
        return new Response('Unauthorized', { status: 401 });
      }
  
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { subscription: true }
      });
  
      if (!user?.stripeCustomerId) {
        return new Response('No billing account found', { status: 404 });
      }
  
      // Create customer portal session
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
        // Configure available portal features
        configuration: process.env.STRIPE_PORTAL_CONFIG_ID,
      });
  
      return NextResponse.json({ url: portalSession.url });
    } catch (error) {
        console.error('Portal session error:', error);
        return new Response('Internal server error', { status: 500 });
      }
  }