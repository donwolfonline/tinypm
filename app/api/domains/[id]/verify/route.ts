// app/api/domains/[id]/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import dns from 'dns/promises';

// Constants for verification settings
const VERIFICATION_SETTINGS = {
  COOLDOWN_MS: 5 * 60 * 1000,        // 5 minute cooldown between attempts
  MAX_ATTEMPTS: 5,                    // Maximum verification attempts allowed
  DNS_TIMEOUT_MS: 10000,             // DNS resolution timeout (10s)
  ALLOWED_STATUS_TRANSITIONS: new Set(['PENDING', 'DNS_VERIFICATION', 'FAILED']), // Valid status transitions
} as const;

// Type guard for DNS errors
function isDnsError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && 'code' in error;
}

// Helper to format DNS error messages for users
function formatDnsError(error: NodeJS.ErrnoException): string {
  const errorMessages: Record<string, string> = {
    ENODATA: 'No DNS records found. Please ensure you have added the CNAME record.',
    ENOTFOUND: 'Domain not found. Please check if the domain exists and try again.',
    ETIMEOUT: 'DNS lookup timed out. Please try again in a few minutes.',
    ESERVFAIL: 'DNS server error. Please check your DNS configuration.',
  };

  return errorMessages[error.code ?? ''] || 'DNS verification failed. Please check your configuration.';
}

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const session = await getAuthSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract and validate domain ID from URL
    const pathParts = request.nextUrl.pathname.split('/');
    const idIndex = pathParts.length - 2;
    const id = pathParts[idIndex];

    if (!id?.trim()) {
      return NextResponse.json({ error: 'Invalid domain ID' }, { status: 400 });
    }

    // Fetch domain with related data in a single query
    const domain = await prisma.customDomain.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            subscription: {
              select: {
                status: true,
              },
            },
          },
        },
      },
    });

    // Comprehensive domain validation
    if (!domain) {
      return NextResponse.json({ error: 'Domain not found' }, { status: 404 });
    }

    if (!domain.user.subscription || domain.user.subscription.status !== 'ACTIVE') {
      return NextResponse.json(
        {
          error: 'Active subscription required',
          code: 'SUBSCRIPTION_REQUIRED',
        },
        { status: 402 }
      );
    }

    // Validate current domain status
    if (!VERIFICATION_SETTINGS.ALLOWED_STATUS_TRANSITIONS.has(domain.status)) {
      return NextResponse.json(
        {
          error: 'Domain cannot be verified in its current state',
          code: 'INVALID_STATE',
        },
        { status: 400 }
      );
    }

    // Rate limiting and attempt tracking
    if (domain.lastAttemptAt) {
      const cooldownRemaining = VERIFICATION_SETTINGS.COOLDOWN_MS - 
        (Date.now() - domain.lastAttemptAt.getTime());
      
      if (cooldownRemaining > 0) {
        const remainingSeconds = Math.ceil(cooldownRemaining / 1000);
        return NextResponse.json(
          {
            error: `Please wait ${remainingSeconds} seconds before retrying`,
            code: 'RATE_LIMITED',
            remainingSeconds,
          },
          {
            status: 429,
            headers: {
              'Retry-After': remainingSeconds.toString(),
            },
          }
        );
      }
    }

    if (domain.verificationAttempts >= VERIFICATION_SETTINGS.MAX_ATTEMPTS) {
      return NextResponse.json(
        {
          error: 'Maximum verification attempts exceeded. Please contact support.',
          code: 'MAX_ATTEMPTS_EXCEEDED',
        },
        { status: 429 }
      );
    }

    // Update attempt tracking before verification
    await prisma.customDomain.update({
      where: { id },
      data: {
        verificationAttempts: { increment: 1 },
        lastAttemptAt: new Date(),
        status: 'DNS_VERIFICATION',
      },
    });

    try {
      // Set up DNS resolution with timeout
      const dnsPromise = dns.resolveCname(domain.domain);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('DNS lookup timed out')), 
          VERIFICATION_SETTINGS.DNS_TIMEOUT_MS);
      });

      // Race between DNS resolution and timeout
      const records = await Promise.race([dnsPromise, timeoutPromise]) as string[];

      // Validate CNAME record
      if (!records.includes(domain.cnameTarget)) {
        await prisma.customDomain.update({
          where: { id },
          data: {
            status: 'FAILED',
            errorMessage: `CNAME record must point to ${domain.cnameTarget}`,
          },
        });

        return NextResponse.json(
          {
            error: `Invalid CNAME configuration. Expected ${domain.cnameTarget}`,
            code: 'INVALID_CNAME',
          },
          { status: 400 }
        );
      }

      // Success case - update domain status
      const verifiedDomain = await prisma.customDomain.update({
        where: { id },
        data: {
          status: 'ACTIVE',
          verifiedAt: new Date(),
          errorMessage: null,
        },
      });

      return NextResponse.json(verifiedDomain);

    } catch (error) {
      // Handle DNS-specific errors
      const errorMessage = isDnsError(error) 
        ? formatDnsError(error)
        : 'DNS verification failed';

      await prisma.customDomain.update({
        where: { id },
        data: {
          status: 'FAILED',
          errorMessage: errorMessage,
        },
      });

      return NextResponse.json(
        {
          error: errorMessage,
          code: 'DNS_ERROR',
        },
        { status: 400 }
      );
    }

  } catch (error) {
    // Log error with request context for debugging
    console.error('Domain verification error:', {
      error,
      requestId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        error: 'An unexpected error occurred during domain verification',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}