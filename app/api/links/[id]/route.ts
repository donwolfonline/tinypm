// app/api/links/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';

export async function PATCH(request: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get ID from URL
    const id = request.url.split('/').pop();
    const data = await request.json();

    // Verify the link belongs to the user
    const link = await prisma.link.findFirst({
      where: {
        id,
        user: {
          email: session.user.email,
        },
      },
    });

    if (!link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    const updatedLink = await prisma.link.update({
      where: { id },
      data: {
        title: data.title !== undefined ? data.title : undefined,
        url: data.url !== undefined ? data.url : undefined,
        enabled: data.enabled !== undefined ? data.enabled : undefined,
        order: data.order !== undefined ? data.order : undefined,
      },
    });

    return NextResponse.json(updatedLink);
  } catch (error) {
    console.error('Error updating link:', error);
    return NextResponse.json({ error: 'Failed to update link' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get ID from URL
    const id = request.url.split('/').pop();

    // Verify the link belongs to the user
    const link = await prisma.link.findFirst({
      where: {
        id,
        user: {
          email: session.user.email,
        },
      },
    });

    if (!link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    await prisma.link.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting link:', error);
    return NextResponse.json({ error: 'Failed to delete link' }, { status: 500 });
  }
}