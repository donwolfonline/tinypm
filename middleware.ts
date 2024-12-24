// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * Core application configuration that handles:
 * - Domain and path routing rules
 * - SSL/TLS security settings
 * - Development environment configuration
 * - Cloudflare integration settings
 */
const appConfig = {
  // Domain verification and routing
  domains: {
    public: {
      // Paths that bypass domain verification (prefix matching)
      paths: [
        '/',
        '/api',
        '/api/auth',
        '/api/auth/callback',
        '/api/auth/callback/google',
        '/api/auth/signin',
        '/api/auth/signout',
        '/api/auth/session',
        '/_next',
        '/images',
        '/fonts',
        '/favicon.ico',
        '/dashboard',
        '/404',
        '/not-found',
        '/login',
        '/register',
        '/about',
        '/pricing',
        '/terms',
        '/privacy'
      ],
      // Development domains with exact matching for performance
      allowed: new Set([
        'localhost:3131',
        '127.0.0.1:3131',
        'dev.tiny.pm:3131',
        'tinypm.vercel.app'
      ])
    }
  },

  // SSL/TLS and security configuration
  security: {
    ssl: {
      enforceHttps: true,
      minTlsVersion: '1.2',
      headers: {
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      }
    }
  }
};

/**
 * Normalizes hostname by removing port and converting to lowercase
 * Ensures consistent hostname comparison across the application
 */
function normalizeHostname(hostname: string): string {
  return hostname.split(':')[0].toLowerCase();
}

/**
 * Checks if a path should bypass domain verification
 * Used for static assets and API routes that don't require domain checks
 */
function isPublicPath(pathname: string): boolean {
  return appConfig.domains.public.paths.some(path => pathname.startsWith(path));
}

/**
 * Handles Cloudflare-specific SSL/TLS requirements
 * Manages HTTPS enforcement and security headers
 */
function handleCloudflareSSL(request: NextRequest): NextResponse | null {
  const proto = request.headers.get('x-forwarded-proto');

  // Redirect HTTP to HTTPS
  if (appConfig.security.ssl.enforceHttps && proto === 'http') {
    const secureUrl = 'https://' + request.headers.get('host') + request.nextUrl.pathname;
    return NextResponse.redirect(secureUrl);
  }

  // Add security headers
  const response = new NextResponse();
  Object.entries(appConfig.security.ssl.headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return null;
}

/**
 * Checks if a request should be protected by authentication
 */
function isProtectedRoute(pathname: string): boolean {
  // Add routes that require authentication
  const protectedPaths = ['/dashboard', '/api/user', '/api/subscription'];
  return protectedPaths.some(path => pathname.startsWith(path));
}

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;
    const hostname = normalizeHostname(request.headers.get('host') || '');

    // Handle SSL/TLS
    const sslResponse = handleCloudflareSSL(request);
    if (sslResponse) return sslResponse;

    // Skip domain verification for public paths
    if (!isPublicPath(pathname)) {
      // Verify domain is allowed
      if (!appConfig.domains.public.allowed.has(hostname)) {
        console.error('Invalid domain access attempt:', hostname);
        return new NextResponse(null, { status: 403 });
      }
    }

    // Check authentication for protected routes
    if (isProtectedRoute(pathname)) {
      try {
        const token = await getToken({
          req: request,
          secret: process.env.NEXTAUTH_SECRET,
        });

        if (!token) {
          console.log('Unauthorized access attempt:', pathname);
          
          // For API routes, return 401
          if (pathname.startsWith('/api/')) {
            return new NextResponse(
              JSON.stringify({ error: 'Unauthorized' }),
              {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
              }
            );
          }

          // For other routes, redirect to login
          const url = new URL('/login', request.url);
          url.searchParams.set('callbackUrl', pathname);
          return NextResponse.redirect(url);
        }
      } catch (error) {
        console.error('Auth error in middleware:', error);
        return new NextResponse(
          JSON.stringify({ error: 'Internal server error' }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // Continue with the request
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

export const config = {
  matcher: [
    // Match all paths except static files
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};