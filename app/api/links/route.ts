// app/api/links/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';
import { revalidateTag } from 'next/cache';

export async function GET() {
  try {
    const session = await getAuthSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const links = await prisma.link.findMany({
      where: {
        user: {
          email: session.user.email,
        },
      },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ links });
  } catch (error) {
    console.error('Error fetching links:', error);
    return NextResponse.json({ error: 'Failed to fetch links' }, { status: 500 });
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

    const link = await prisma.link.create({
      data: {
        title: data.title || '',
        url: data.url || '',
        enabled: data.enabled ?? true,
        order: data.order ?? 0,
        userId: user.id,
      },
    });

    // Revalidate the user's profile page cache
    revalidateTag(`user-${user.username}`);

    return NextResponse.json(link);
  } catch (error) {
    console.error('Error creating link:', error);
    return NextResponse.json({ error: 'Failed to create link' }, { status: 500 });
  }
}
