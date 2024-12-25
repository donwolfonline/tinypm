// app/api/content/[id]/route.ts
import { NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';
import { revalidateTag } from 'next/cache';
import { ContentType, Prisma } from '@prisma/client';

const DEBUG_MODE = true;

const debugLog = (...args: any[]) => {
  if (DEBUG_MODE) {
    console.log('[CONTENT-API DEBUG]', ...args);
  }
};

export async function PATCH(request: Request) {
  try {
    const session = await getAuthSession();
    debugLog('Session:', session?.user?.email);

    if (!session?.user?.email) {
      debugLog('Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = request.url.split('/').pop();
    debugLog('Content ID:', id);

    if (!id) {
      debugLog('Missing Content ID');
      return NextResponse.json({ error: 'Content ID is required' }, { status: 400 });
    }

    let data;
    try {
      data = await request.json();
      debugLog('Request Data:', data);
    } catch (e) {
      debugLog('Invalid request body', e);
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

    debugLog('Existing Content:', content);

    if (!content) {
      debugLog('Content not found');
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

    debugLog('Update Data:', updateData);

    const updatedContent = await prisma.content.update({
      where: { id },
      data: updateData,
    });

    debugLog('Updated Content:', updatedContent);

    // Revalidate the user's profile page cache
    if (content.user.username) {
      revalidateTag(`user-${content.user.username}`);
    }

    return NextResponse.json({ content: updatedContent });
  } catch (error) {
    debugLog('Catch Block Error:', error);
    console.error('Error updating content:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { 
          error: 'Database error',
          details: error.message,
          code: error.code,
          meta: error.meta
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to update content',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getAuthSession();
    debugLog('Session:', session?.user?.email);

    if (!session?.user?.email) {
      debugLog('Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = request.url.split('/').pop();
    debugLog('Content ID:', id);

    if (!id) {
      debugLog('Missing Content ID');
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

    debugLog('Existing Content:', content);

    if (!content) {
      debugLog('Content not found');
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    await prisma.content.delete({
      where: { id },
    });

    debugLog('Content deleted successfully');

    // Revalidate the user's profile page cache
    if (content.user.username) {
      revalidateTag(`user-${content.user.username}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    debugLog('Catch Block Error:', error);
    console.error('Error deleting content:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { 
          error: 'Database error',
          details: error.message,
          code: error.code,
          meta: error.meta
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to delete content',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}