// app/api/domains/[id]/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { DomainService } from '@/lib/services/domainService';
import { isDomainVerificationError } from '@/lib/errors/domain';

interface VerifyRouteParams {
  params: {
    id: string;
  };
}

/**
 * Handles domain verification requests
 * Rate limited to prevent abuse
 * Requires authentication and valid subscription
 */
export async function POST(
  request: NextRequest,
  { params }: VerifyRouteParams
) {
  try {
    // Validate session
    const session = await getAuthSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Attempt domain verification
    const result = await DomainService.verifyDomain(params.id);
    return NextResponse.json(result);
  } catch (error: unknown) {
    // Handle known error types
    if (isDomainVerificationError(error)) {
      // Map error codes to appropriate HTTP status codes
      const statusCodes: Record<typeof error.code, number> = {
        INVALID_DOMAIN: 400,
        DNS_ERROR: 400,
        VERIFICATION_FAILED: 400,
        RATE_LIMITED: 429,
        MAX_ATTEMPTS_EXCEEDED: 429,
        SUBSCRIPTION_REQUIRED: 402,
      };

      return NextResponse.json({
        error: error.message,
        code: error.code
      }, { 
        status: statusCodes[error.code],
        headers: error.code === 'RATE_LIMITED' ? {
          'Retry-After': '300' // 5 minutes cooldown
        } : undefined
      });
    }

    // Handle unexpected errors
    console.error('Unexpected error during domain verification:', error);
    
    // Log for monitoring but don't expose internals
    return NextResponse.json({
      error: 'An unexpected error occurred during domain verification',
      requestId: crypto.randomUUID() // For error tracking
    }, { 
      status: 500 
    });
  }
}