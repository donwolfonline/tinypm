// app/api/domains/[id]/verify/route.ts
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { DomainService, DomainVerificationError } from '@/lib/services/domainService';

// POST /api/domains/[id]/verify - Verify domain
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await DomainService.verifyDomain(params.id);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof DomainVerificationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('Error verifying domain:', error);
    return NextResponse.json({ error: 'Failed to verify domain' }, { status: 500 });
  }
}