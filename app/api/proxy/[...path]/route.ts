// app/api/proxy/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface RouteParams {
  params: {
    path: string[];
  };
  searchParams: { [key: string]: string | string[] | undefined };
}

/**
 * Custom domain proxy handler for Next.js App Router
 * Handles requests to custom domains by proxying them to the appropriate user profile
 * while preserving path segments and query parameters
 */
export async function GET(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const hostname = request.headers.get('host');
    if (!hostname) {
      console.warn('[Proxy] Missing host header');
      return new NextResponse('Invalid request', { status: 400 });
    }

    // Normalize hostname and handle port numbers
    const cleanHostname = hostname.split(':')[0].toLowerCase();
    
    // Early return for primary domain requests
    if (cleanHostname === 'tiny.pm' || cleanHostname.endsWith('.tiny.pm')) {
      return NextResponse.next();
    }

    // Fetch active domain configuration with associated user
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

    // Validate domain configuration
    if (!customDomain?.user?.username) {
      console.error('[Proxy] Invalid domain configuration:', {
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

    // Construct target URL preserving path segments and query parameters
    const url = new URL(request.url);
    const pathSegments = context.params.path || [];
    url.pathname = `/${customDomain.user.username}/${pathSegments.join('/')}`;

    // Log rewrite operation for monitoring
    console.info('[Proxy] Rewriting request:', {
      from: request.url,
      to: url.toString(),
      domain: cleanHostname,
      username: customDomain.user.username,
      timestamp: new Date().toISOString(),
    });

    // Perform the rewrite while maintaining original request properties
    return NextResponse.rewrite(url, {
      headers: {
        'X-Proxied-For': cleanHostname,
        'X-Original-Host': hostname,
      },
    });

  } catch (error) {
    // Log error with context for debugging
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

// Handler mapping for other HTTP methods
export const POST = GET;
export const PUT = GET;
export const DELETE = GET;
export const PATCH = GET;
export const HEAD = GET;
export const OPTIONS = GET;