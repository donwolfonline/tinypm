// app/api/domains/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * Handles deletion of a custom domain
 * Ensures user owns the domain before deletion
 * 
 * @param request - Next.js request object
 * @param params - Route parameters containing domain ID
 * @returns NextResponse with success or error status
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify domain ownership using a compound query
    const domain = await prisma.customDomain.findFirst({
      where: {
        AND: [
          { id: params.id },
          { userId: session.user.id }
        ]
      },
    });

    if (!domain) {
      return NextResponse.json({ error: 'Domain not found' }, { status: 404 });
    }

    // Delete the domain record
    await prisma.customDomain.delete({
      where: { id: params.id },
    });

    // Success response with no content
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting domain:', error);
    return NextResponse.json(
      { error: 'Failed to delete domain' }, 
      { status: 500 }
    );
  }
}