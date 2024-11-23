// app/api/content/[id]/route.ts
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

    const content = await prisma.content.findFirst({
      where: {
        id,
        user: {
          email: session.user.email,
        },
      },
      include: {
        user: true,
      },
    });

    if (!content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    // Remove undefined values to avoid Prisma errors
    const updateData = Object.fromEntries(
      Object.entries({
        title: data.title,
        url: data.url,
        text: data.text,
        emoji: data.emoji,
        enabled: data.enabled,
        order: data.order,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      }).filter(([_, v]) => v !== undefined)
    );

    const updatedContent = await prisma.content.update({
      where: { id },
      data: updateData,
    });

    // Revalidate the user's profile page cache
    revalidateTag(`user-${content.user.username}`);

    return NextResponse.json(updatedContent);
  } catch (error) {
    console.error('Error updating content:', error);
    return NextResponse.json({ error: 'Failed to update content' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = request.url.split('/').pop();

    const content = await prisma.content.findFirst({
      where: {
        id,
        user: {
          email: session.user.email,
        },
      },
      include: {
        user: true,
      },
    });

    if (!content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    await prisma.content.delete({
      where: { id },
    });

    // Revalidate the user's profile page cache
    revalidateTag(`user-${content.user.username}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting content:', error);
    return NextResponse.json({ error: 'Failed to delete content' }, { status: 500 });
  }
}