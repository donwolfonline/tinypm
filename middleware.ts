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
        '/',
        '/api',
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
    return hostname.toLowerCase().split(':')[0];
  },

  /**
   * Checks if a path should bypass domain verification
   * Used for static assets and API routes that don't require domain checks
   */
  isPublicPath(pathname: string): boolean {
    return appConfig.domains.public.paths.some(
      publicPath => pathname === publicPath || pathname.startsWith(publicPath + '/')
    );
  },

  /**
   * Handles Cloudflare-specific SSL/TLS requirements
   * Manages HTTPS enforcement and security headers
   */
  handleCloudflareSSL(request: NextRequest): NextResponse | null {
    try {
      const cfVisitor = request.headers.get('cf-visitor');
      if (!cfVisitor) return null;

      const { scheme } = JSON.parse(cfVisitor);
      if (scheme === 'http') {
        const httpsUrl = request.nextUrl.clone();
        httpsUrl.protocol = 'https:';
        return NextResponse.redirect(httpsUrl);
      }
    } catch (error) {
      console.error('[SSL] Error parsing cf-visitor:', error);
    }
    return null;
  }
};

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Skip middleware for static files and special paths
  if (pathname.match(/\\.(ico|png|jpg|jpeg|svg|css|js|woff|woff2)$/)) {
    return NextResponse.next();
  }

  // Skip middleware for not-found and 404 pages
  if (pathname === '/404' || pathname === '/not-found') {
    return NextResponse.next();
  }

  // Enhanced request logging
  if (pathname.includes('/api/domains/verify')) {
    console.log('[Middleware] Verification request:', {
      method: request.method,
      url: pathname,
      headers: Object.fromEntries(request.headers),
      cfRay: request.headers.get('cf-ray'),
      timestamp: new Date().toISOString()
    });
  }

  // API request logging
  if (pathname.startsWith('/api/')) {
    console.log('[API Request]', {
      method: request.method,
      path: pathname,
      host: request.headers.get('host'),
      timestamp: new Date().toISOString()
    });
  }

  // SSL/TLS verification
  const sslRedirect = utils.handleCloudflareSSL(request);
  if (sslRedirect) return sslRedirect;

  const hostname = request.headers.get('host') || '';
  const normalizedHost = utils.normalizeHostname(hostname);

  // Allow access for configured domains
  if (appConfig.domains.public.allowed.has(normalizedHost)) {
    // Public path handling
    if (utils.isPublicPath(pathname)) {
      const response = NextResponse.next();
      response.headers.set('Strict-Transport-Security', appConfig.security.ssl.headers.hsts);
      return response;
    }
  }

  // Handle invalid domains or paths
  console.log('[Domain] Invalid access attempt:', {
    host: hostname,
    path: pathname,
    timestamp: new Date().toISOString()
  });

  // For invalid paths on valid domains, show the 404 page
  if (appConfig.domains.public.allowed.has(normalizedHost)) {
    return NextResponse.next();
  }

  // For invalid domains, redirect to the homepage
  const url = request.nextUrl.clone();
  url.pathname = '/';
  url.host = 'tinypm.vercel.app';
  url.protocol = 'https:';
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    // Match all paths except static files
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ]
};