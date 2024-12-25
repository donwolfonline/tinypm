// app/api/content/[id]/route.ts
import { NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';
import { revalidateTag } from 'next/cache';
import { ContentType, Prisma } from '@prisma/client';

export async function PATCH(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = request.url.split('/').pop();
    if (!id) {
      return NextResponse.json({ error: 'Content ID is required' }, { status: 400 });
    }

    let data;
    try {
      data = await request.json();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const prisma = await getPrismaClient();
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

    // Prepare update data with proper null handling
    const updateData = {
      title: data.title ?? null,
      url: data.url ?? null,
      text: data.text ?? null,
      emoji: data.emoji ?? null,
      enabled: data.enabled ?? true,
      order: data.order ?? content.order,
      type: data.type ? (data.type as ContentType) : content.type,
    };

    const updatedContent = await prisma.content.update({
      where: { id },
      data: updateData,
    });

    // Revalidate the user's profile page cache
    if (content.user.username) {
      revalidateTag(`user-${content.user.username}`);
    }

    return NextResponse.json({ content: updatedContent });
  } catch (error) {
    console.error('Error updating content:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { error: 'Database error: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update content' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = request.url.split('/').pop();
    if (!id) {
      return NextResponse.json({ error: 'Content ID is required' }, { status: 400 });
    }

    const prisma = await getPrismaClient();
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
    if (content.user.username) {
      revalidateTag(`user-${content.user.username}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting content:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { error: 'Database error: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete content' },
      { status: 500 }
    );
  }
}