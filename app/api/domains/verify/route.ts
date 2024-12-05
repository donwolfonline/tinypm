// app/api/verify-domain/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get('domain');

  if (!domain) {
    return new NextResponse('no', { status: 200 });
  }

  // Always allow development domains
  if (
    process.env.NODE_ENV === 'development' &&
    (domain.includes('localhost') ||
      domain.includes('127.0.0.1') ||
      domain.endsWith('.tiny.pm'))
  ) {
    return new NextResponse('yes', { status: 200 });
  }

  // Allow the main domain and its subdomains
  if (domain === 'tiny.pm' || domain.endsWith('.tiny.pm')) {
    return new NextResponse('yes', { status: 200 });
  }

  try {
    // Check custom domains
    const customDomain = await prisma.customDomain.findFirst({
      where: {
        domain,
        status: 'ACTIVE', // Ensure the domain is verified and active
      },
    });

    // Log verification attempts in development
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `Domain verification attempt for ${domain}: ${
          customDomain ? 'Found' : 'Not Found'
        }`
      );
    }

    return new NextResponse(customDomain ? 'yes' : 'no', { status: 200 });
  } catch (error) {
    console.error('Domain verification error:', error);
    return new NextResponse('no', { status: 200 });
  }
}