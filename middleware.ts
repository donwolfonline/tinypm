// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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
        '/api',
        '/_next',
        '/images',
        '/fonts',
        '/favicon.ico',
        '/dashboard',
      ],
      // Development domains with exact matching for performance
      allowed: new Set([
        'localhost:3131',
        '127.0.0.1:3131',
        'dev.tiny.pm:3131'
      ])
    }
  },

  // SSL/TLS and security configuration
  security: {
    ssl: {
      enforceHttps: true,
      minTlsVersion: '1.2',
      headers: {
        hsts: 'max-age=31536000; includeSubDomains',
        proto: 'https'
      }
    }
  }
} as const;

// Utility functions
const utils = {
  /**
   * Normalizes hostname by removing port and converting to lowercase
   * Ensures consistent hostname comparison across the application
   */
  normalizeHostname(hostname: string): string {
    return hostname.split(':')[0].toLowerCase();
  },

  /**
   * Checks if a path should bypass domain verification
   * Used for static assets and API routes that don't require domain checks
   */
  isPublicPath(pathname: string): boolean {
    return appConfig.domains.public.paths.some(path => pathname.startsWith(path));
  },

  /**
   * Handles Cloudflare-specific SSL/TLS requirements
   * Manages HTTPS enforcement and security headers
   */
  handleCloudflareSSL(request: NextRequest): NextResponse | null {
    try {
      const cfVisitor = JSON.parse(request.headers.get('cf-visitor') || '{}');
      
      if (process.env.NODE_ENV === 'production' && 
          cfVisitor.scheme === 'http' && 
          appConfig.security.ssl.enforceHttps) {
        const secureUrl = new URL(request.url);
        secureUrl.protocol = 'https:';
        return NextResponse.redirect(secureUrl);
      }
    } catch (error) {
      console.error('[SSL] Error parsing cf-visitor:', error);
    }
    return null;
  }
};

export async function middleware(request: NextRequest) {
  // Enhanced request logging
  if (request.nextUrl.pathname.includes('/api/domains/verify')) {
    console.log('[Middleware] Verification request:', {
      method: request.method,
      url: request.nextUrl.pathname,
      headers: Object.fromEntries(request.headers),
      cfRay: request.headers.get('cf-ray'),
      timestamp: new Date().toISOString()
    });
  }

  // API request logging
  if (request.nextUrl.pathname.startsWith('/api/')) {
    console.log('[API Request]', {
      method: request.method,
      path: request.nextUrl.pathname,
      host: request.headers.get('host'),
      timestamp: new Date().toISOString()
    });
  }

  // SSL/TLS verification
  const sslRedirect = utils.handleCloudflareSSL(request);
  if (sslRedirect) return sslRedirect;

  // Public path handling
  if (utils.isPublicPath(request.nextUrl.pathname)) {
    const response = NextResponse.next();
    response.headers.set('Strict-Transport-Security', appConfig.security.ssl.headers.hsts);
    return response;
  }

  const hostname = request.headers.get('host') || '';
  const normalizedHost = utils.normalizeHostname(hostname);

  // Development environment handling
  if (process.env.NODE_ENV === 'development' && 
      appConfig.domains.public.allowed.has(hostname)) {
    return NextResponse.next();
  }

  // Primary domain and subdomain handling
  if (normalizedHost === 'tiny.pm' || normalizedHost.endsWith('.tiny.pm')) {
    const response = NextResponse.next();
    response.headers.set('Strict-Transport-Security', appConfig.security.ssl.headers.hsts);
    return response;
  }

  try {
    // Production custom domain verification
    if (process.env.NODE_ENV === 'production') {
      const verifyUrl = new URL('/api/domains/verify', request.nextUrl.origin);
      const customDomain = await fetch(verifyUrl, {
        headers: { 
          host: normalizedHost,
          'x-real-ip': request.headers.get('x-real-ip') || '',
          'x-forwarded-for': request.headers.get('x-forwarded-for') || '',
          'x-forwarded-proto': appConfig.security.ssl.headers.proto,
        }
      });

      if (!customDomain.ok) {
        console.error('[Middleware] Domain verification failed:', {
          domain: normalizedHost,
          status: customDomain.status,
          timestamp: new Date().toISOString()
        });
        return NextResponse.redirect(new URL('/404', request.url));
      }
    }

    // Set security headers for verified requests
    const response = NextResponse.next();
    response.headers.set('Strict-Transport-Security', appConfig.security.ssl.headers.hsts);
    response.headers.set('X-Forwarded-Proto', appConfig.security.ssl.headers.proto);
    return response;

  } catch (error) {
    console.error('[Middleware] Error:', {
      error,
      domain: normalizedHost,
      timestamp: new Date().toISOString()
    });
    return NextResponse.redirect(new URL('/500', request.url));
  }
}

export const config = {
  matcher: [
    // Match all paths except static files
    '/((?!_next|static|.*\\..*|favicon.ico).*)',
    // Include API routes
    '/api/:path*'
  ],
};