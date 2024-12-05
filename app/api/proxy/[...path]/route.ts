// app/api/proxy/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * Custom domain proxy handler
 * Handles requests to custom domains by:
 * 1. Validating the domain against our database
 * 2. Mapping the request to the correct user profile
 * 3. Preserving query parameters and path components
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const hostname = request.headers.get('host');
    if (!hostname) {
      return new NextResponse('Invalid request', { status: 400 });
    }

    // Clean hostname by removing port and normalizing
    const cleanHostname = hostname.split(':')[0].toLowerCase();
    
    // Skip processing for primary domain
    if (cleanHostname === 'tiny.pm' || cleanHostname.endsWith('.tiny.pm')) {
      return NextResponse.next();
    }

    // Find and validate custom domain configuration
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
      console.error('[Proxy] Domain not found or inactive:', cleanHostname);
      return new NextResponse('Domain not configured', { status: 404 });
    }

    // Construct the internal URL for the user's profile
    const url = new URL(request.url);
    const pathSegments = params.path || [];
    url.pathname = `/${customDomain.user.username}/${pathSegments.join('/')}`;

    console.info('[Proxy] Rewriting request:', {
      from: request.url,
      to: url.toString(),
      domain: cleanHostname,
      username: customDomain.user.username,
      timestamp: new Date().toISOString(),
    });

    // Rewrite the request to the user's profile while preserving query params
    return NextResponse.rewrite(url);

  } catch (error) {
    console.error('[Proxy] Error handling request:', {
      error,
      url: request.url,
      timestamp: new Date().toISOString(),
    });
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Support all common HTTP methods by pointing them to the GET handler
export const POST = GET;
export const PUT = GET;
export const DELETE = GET;
export const PATCH = GET;
export const HEAD = GET;
export const OPTIONS = GET;