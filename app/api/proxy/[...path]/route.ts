// app/api/proxy/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const hostname = request.headers.get('host') || '';
    
    // Skip processing for primary domain
    if (hostname === 'tiny.pm' || hostname.endsWith('.tiny.pm')) {
      return NextResponse.next();
    }

    // Verify domain configuration
    const customDomain = await prisma.customDomain.findFirst({
      where: {
        domain: hostname,
        status: 'ACTIVE',
      },
      include: {
        user: true,
      },
    });

    if (!customDomain) {
      console.error(`[Custom Domain] Invalid domain request: ${hostname}`);
      return new NextResponse('Domain not configured', { status: 404 });
    }

    // Rewrite the request to the user's profile page
    const url = new URL(request.url);
    url.pathname = `/${customDomain.user.username}${url.pathname}`;
    
    // Log successful rewrites for monitoring
    console.log('[Custom Domain] Rewriting request:', {
      from: request.url,
      to: url.toString(),
      domain: hostname,
      username: customDomain.user.username,
    });

    return NextResponse.rewrite(url);
  } catch (error) {
    console.error('[Custom Domain] Proxy error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Handle all HTTP methods
export const POST = GET;
export const PUT = GET;
export const DELETE = GET;
export const PATCH = GET;