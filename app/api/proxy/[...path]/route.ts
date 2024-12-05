import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Next.js 15 expects a very specific type for route handlers with dynamic params
export async function GET(
  req: NextRequest & { params: { path: string[] } }
) {
  try {
    const hostname = req.headers.get('host');
    if (!hostname) {
      console.warn('[Proxy] Missing host header');
      return new NextResponse('Invalid request', { status: 400 });
    }

    const cleanHostname = hostname.split(':')[0].toLowerCase();
    
    // Early return for root domain
    if (cleanHostname === 'tiny.pm' || cleanHostname.endsWith('.tiny.pm')) {
      return NextResponse.next();
    }

    // Lookup domain mapping
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
      return new NextResponse('Domain not configured', { 
        status: 404,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    // Construct target URL
    const url = new URL(req.url);
    const pathSegments = req.params.path;
    url.pathname = `/${customDomain.user.username}/${pathSegments.join('/')}`;

    // Forward the request with custom headers
    return NextResponse.rewrite(url, {
      headers: {
        'X-Proxied-For': cleanHostname,
        'X-Original-Host': hostname,
      },
    });

  } catch (error) {
    console.error('[Proxy] Error:', error);
    return new NextResponse('Internal Server Error', { 
      status: 500,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}

// Share handler across methods
export const POST = GET;
export const PUT = GET;
export const DELETE = GET;
export const PATCH = GET;
export const HEAD = GET;
export const OPTIONS = GET;