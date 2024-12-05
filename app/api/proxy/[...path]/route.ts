// app/api/proxy/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Type for the Next.js route parameters structure
type RouteContext = {
  params: {
    path: string[];
  };
};

/**
 * Custom domain proxy handler for Next.js App Router
 * Routes requests from custom domains to the appropriate user profile
 * while preserving path segments and query parameters.
 * 
 * @param request - Incoming request from the custom domain
 * @param context - Route context containing path parameters
 * @returns NextResponse with either a rewrite to the correct user profile or an error
 */
async function handler(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const hostname = request.headers.get('host');
    if (!hostname) {
      console.warn('[Proxy] Missing host header');
      return new NextResponse('Invalid request', { status: 400 });
    }

    // Normalize hostname by removing port and converting to lowercase
    const cleanHostname = hostname.split(':')[0].toLowerCase();
    
    // Skip proxying for main domain and subdomains
    if (cleanHostname === 'tiny.pm' || cleanHostname.endsWith('.tiny.pm')) {
      return NextResponse.next();
    }

    // Query for active domain configuration
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
        timestamp: new Date().toISOString(),
      });
      return new NextResponse('Domain not configured', { 
        status: 404,
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    }

    // Construct the target URL with preserved query parameters
    const url = new URL(request.url);
    const pathSegments = context.params.path || [];
    url.pathname = `/${customDomain.user.username}/${pathSegments.join('/')}`;

    // Log the rewrite for monitoring
    console.info('[Proxy] Rewriting request:', {
      from: request.url,
      to: url.toString(),
      domain: cleanHostname,
      username: customDomain.user.username,
      timestamp: new Date().toISOString(),
    });

    // Rewrite the request with custom headers for tracking
    return NextResponse.rewrite(url, {
      headers: {
        'X-Proxied-For': cleanHostname,
        'X-Original-Host': hostname,
      },
    });

  } catch (error) {
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

// Export the handler for all HTTP methods
export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
export const HEAD = handler;
export const OPTIONS = handler;