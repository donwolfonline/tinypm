// app/api/content/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';
import { revalidateTag } from 'next/cache';
import type { ContentType } from '@/types';

export async function GET() {
  try {
    const session = await getAuthSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const content = await prisma.content.findMany({
      where: {
        user: {
          email: session.user.email,
        },
      },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ content });
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const data = await request.json();
    const type = data.type as ContentType;

    const contentData = {
      type,
      enabled: data.enabled ?? true,
      order: data.order ?? 0,
      userId: user.id,
      // Add fields based on content type
      ...(type === 'LINK' && {
        title: data.title || '',
        url: data.url || '',
        emoji: data.emoji || '🔗',
      }),
      ...(type === 'TITLE' && {
        title: data.title || '',
        emoji: data.emoji,
      }),
      ...(type === 'TEXT' && {
        text: data.text || '',
      }),
    };

    const content = await prisma.content.create({
      data: contentData,
    });

    // Revalidate the user's profile page cache
    revalidateTag(`user-${user.username}`);

    return NextResponse.json(content);
  } catch (error) {
    console.error('Error creating content:', error);
    return NextResponse.json({ error: 'Failed to create content' }, { status: 500 });
  }
}