// app/api/domains/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function DELETE(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract the dynamic route parameter from the request URL
    const pathParts = request.nextUrl.pathname.split('/');
    const idIndex = pathParts.length - 1;
    const id = pathParts[idIndex];

    // Ensure the extracted ID is not undefined
    if (!id) {
      return NextResponse.json({ error: 'Invalid domain ID' }, { status: 400 });
    }

    const domain = await prisma.customDomain.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!domain) {
      return NextResponse.json({ error: 'Domain not found' }, { status: 404 });
    }

    await prisma.customDomain.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting domain:', error);
    return NextResponse.json(
      { error: 'Failed to delete domain' },
      { status: 500 }
    );
  }
}