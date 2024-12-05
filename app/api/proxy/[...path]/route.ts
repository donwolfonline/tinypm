import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * Custom domain proxy handler for Next.js App Router
 * Handles requests to custom domains by proxying them to the appropriate user profile
 * 
 * @param request - The incoming request object
 * @param context - Contains route params with dynamic path segments
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // Extract and validate host header
    const hostname = request.headers.get('host');
    if (!hostname) {
      console.warn('[Proxy] Missing host header', {
        url: request.url,
        timestamp: new Date().toISOString()
      });
      return new NextResponse('Invalid request', { status: 400 });
    }

    // Normalize hostname to handle ports and casing
    const cleanHostname = hostname.split(':')[0].toLowerCase();
    
    // Pass through requests to main domain
    if (cleanHostname === 'tiny.pm' || cleanHostname.endsWith('.tiny.pm')) {
      return NextResponse.next();
    }

    // Look up domain configuration
    const customDomain = await prisma.customDomain.findFirst({
      where: {
        domain: cleanHostname,
        status: 'ACTIVE',
      },
      include: {
        user: {
          select: {
            username: true,
            id: true,
          },
        },
      },
    });

    if (!customDomain?.user?.username) {
      console.error('[Proxy] Domain not configured:', {
        domain: cleanHostname,
        timestamp: new Date().toISOString()
      });
      return new NextResponse('Domain not configured', { 
        status: 404,
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    }

    // Construct target URL preserving path and query parameters
    const url = new URL(request.url);
    const pathSegments = params.path || [];
    url.pathname = `/${customDomain.user.username}/${pathSegments.join('/')}`;

    // Log rewrite operation
    console.info('[Proxy] Rewriting request:', {
      from: request.url,
      to: url.toString(),
      domain: cleanHostname,
      username: customDomain.user.username,
      timestamp: new Date().toISOString()
    });

    // Perform rewrite with tracking headers
    return NextResponse.rewrite(url, {
      headers: {
        'X-Proxied-For': cleanHostname,
        'X-Original-Host': hostname,
      },
    });

  } catch (error) {
    // Comprehensive error logging
    console.error('[Proxy] Error handling request:', {
      error,
      url: request.url,
      timestamp: new Date().toISOString(),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return new NextResponse('Internal Server Error', { 
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
}

// Apply the same handler to all HTTP methods
export const POST = GET;
export const PUT = GET;
export const DELETE = GET;
export const PATCH = GET;
export const HEAD = GET;
export const OPTIONS = GET;