// app/api/domains/route.ts
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { DomainService, DomainVerificationError } from '@/lib/services/domainService';
import prisma from '@/lib/prisma';

// GET /api/domains - List user's domains
export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const domains = await prisma.customDomain.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ domains });
  } catch (error) {
    console.error('Error fetching domains:', error);
    return NextResponse.json({ error: 'Failed to fetch domains' }, { status: 500 });
  }
}

// POST /api/domains - Add new domain
export async function POST(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { domain } = await request.json();
    const result = await DomainService.addDomain(session.user.id, domain);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof DomainVerificationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('Error adding domain:', error);
    return NextResponse.json({ error: 'Failed to add domain' }, { status: 500 });
  }
}
