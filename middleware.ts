// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Core application configuration for domain and path handling.
 * Separated into logical groups for easier maintenance and updates.
 */
const domainConfig = {
  // Paths that bypass domain verification (prefix matching)
  publicPaths: [
    '/api',
    '/_next',
    '/images',
    '/fonts',
    '/favicon.ico',
    '/dashboard',
  ],

  // Development domains that are always allowed (exact matching for performance)
  devDomains: new Set([
    'localhost:3131',
    '127.0.0.1:3131',
    'dev.tiny.pm:3131'
  ])
} as const;

/**
 * Checks if a pathname should bypass domain verification
 * @param pathname The path to check
 * @returns boolean indicating if the path should bypass verification
 */
function isPublicPath(pathname: string): boolean {
  return domainConfig.publicPaths.some(path => pathname.startsWith(path));
}

/**
 * Validates and cleans a hostname, removing port and normalizing case
 * @param hostname Raw hostname from request
 * @returns Cleaned hostname without port
 */
function cleanHostname(hostname: string): string {
  return hostname.split(':')[0].toLowerCase();
}

export async function middleware(request: NextRequest) {
  // Add API request logging
  if (request.nextUrl.pathname.startsWith('/api/')) {
    console.log('[API Request]', {
      method: request.method,
      path: request.nextUrl.pathname,
      host: request.headers.get('host'),
      timestamp: new Date().toISOString()
    });
  }

  // Early return for public paths (including API routes)
  if (isPublicPath(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const hostname = request.headers.get('host') || '';

  // Development environment handling
  if (process.env.NODE_ENV === 'development') {
    if (domainConfig.devDomains.has(hostname)) {
      return NextResponse.next();
    }
  }

  // Handle primary domain and subdomains
  const clean = cleanHostname(hostname);
  if (clean === 'tiny.pm' || clean.endsWith('.tiny.pm')) {
    return NextResponse.next();
  }

  try {
    // Only verify custom domains in production
    if (process.env.NODE_ENV === 'production') {
      const verifyUrl = new URL('/api/domains/verify', request.nextUrl.origin);
      const customDomain = await fetch(verifyUrl, {
        headers: { 
          host: clean,
          'x-real-ip': request.headers.get('x-real-ip') || '',
          'x-forwarded-for': request.headers.get('x-forwarded-for') || '',
        }
      });

      if (!customDomain.ok) {
        return NextResponse.redirect(new URL('/404', request.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.redirect(new URL('/500', request.url));
  }
}

/**
 * Next.js middleware matcher configuration
 * Defines which routes the middleware should handle
 */
export const config = {
  matcher: [
    // Match all paths except static files
    '/((?!_next|static|.*\\..*|favicon.ico).*)',
    // Explicitly include API routes
    '/api/:path*'
  ],
};