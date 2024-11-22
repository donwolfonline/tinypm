// app/api/links/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';
import { revalidateTag } from 'next/cache';

export async function PATCH(request: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = request.url.split('/').pop();
    const data = await request.json();

    const link = await prisma.link.findFirst({
      where: {
        id,
        user: {
          email: session.user.email,
        },
      },
      include: {
        user: true, // Include user to get username for cache invalidation
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
        emoji: data.emoji !== undefined ? data.emoji : undefined, // Add emoji field
      },
    });

    // Revalidate the user's profile page cache
    revalidateTag(`user-${link.user.username}`);

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

    const id = request.url.split('/').pop();

    const link = await prisma.link.findFirst({
      where: {
        id,
        user: {
          email: session.user.email,
        },
      },
      include: {
        user: true, // Include user to get username for cache invalidation
      },
    });

    if (!link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    await prisma.link.delete({
      where: { id },
    });

    // Revalidate the user's profile page cache
    revalidateTag(`user-${link.user.username}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting link:', error);
    return NextResponse.json({ error: 'Failed to delete link' }, { status: 500 });
  }
}
