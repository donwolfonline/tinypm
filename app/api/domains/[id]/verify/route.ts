// app/api/domains/[id]/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import dns from 'dns/promises';

const VERIFICATION_COOLDOWN = 5 * 60 * 1000; // 5 minutes
const MAX_VERIFICATION_ATTEMPTS = 5;

export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch domain with user check for security
    const domain = await prisma.customDomain.findFirst({
      where: {
        id: context.params.id,
        userId: session.user.id,
      },
      include: {
        user: {
          include: {
            subscription: true
          }
        }
      }
    });

    if (!domain) {
      return NextResponse.json({ error: 'Domain not found' }, { status: 404 });
    }

    // Verify subscription status
    if (domain.user.subscription?.status !== 'ACTIVE') {
      return NextResponse.json({ 
        error: 'Active subscription required',
        code: 'SUBSCRIPTION_REQUIRED'
      }, { status: 402 });
    }

    // Check verification attempt cooldown
    if (domain.lastAttemptAt) {
      const timeSinceLastAttempt = Date.now() - domain.lastAttemptAt.getTime();
      if (timeSinceLastAttempt < VERIFICATION_COOLDOWN) {
        const remainingCooldown = Math.ceil((VERIFICATION_COOLDOWN - timeSinceLastAttempt) / 1000);
        return NextResponse.json({
          error: `Please wait ${remainingCooldown} seconds before retrying`,
          code: 'RATE_LIMITED'
        }, { 
          status: 429,
          headers: {
            'Retry-After': remainingCooldown.toString()
          }
        });
      }
    }

    // Check maximum attempts
    if (domain.verificationAttempts >= MAX_VERIFICATION_ATTEMPTS) {
      return NextResponse.json({
        error: 'Maximum verification attempts exceeded. Please contact support.',
        code: 'MAX_ATTEMPTS_EXCEEDED'
      }, { status: 429 });
    }

    // Update attempt counter and timestamp
    await prisma.customDomain.update({
      where: { id: context.params.id },
      data: {
        verificationAttempts: { increment: 1 },
        lastAttemptAt: new Date(),
        status: 'DNS_VERIFICATION'
      }
    });

    try {
      // Verify CNAME record
      const records = await dns.resolveCname(domain.domain);
      
      if (!records.includes(domain.cnameTarget)) {
        await prisma.customDomain.update({
          where: { id: context.params.id },
          data: {
            status: 'FAILED',
            errorMessage: `CNAME record should point to ${domain.cnameTarget}`
          }
        });

        return NextResponse.json({
          error: `CNAME record should point to ${domain.cnameTarget}`,
          code: 'DNS_ERROR'
        }, { status: 400 });
      }

      // DNS verification successful
      const verifiedDomain = await prisma.customDomain.update({
        where: { id: context.params.id },
        data: {
          status: 'ACTIVE',
          verifiedAt: new Date(),
          errorMessage: null
        }
      });

      return NextResponse.json(verifiedDomain);
    } catch (dnsError) {
      // Handle DNS resolution failures
      const errorMessage = dnsError instanceof Error ? 
        `DNS verification failed: ${dnsError.message}` : 
        'DNS verification failed';

      await prisma.customDomain.update({
        where: { id: context.params.id },
        data: {
          status: 'FAILED',
          errorMessage: errorMessage
        }
      });

      return NextResponse.json({
        error: errorMessage,
        code: 'DNS_ERROR'
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Domain verification error:', error);
    return NextResponse.json({
      error: 'An unexpected error occurred during domain verification',
      requestId: crypto.randomUUID()
    }, { status: 500 });
  }
}