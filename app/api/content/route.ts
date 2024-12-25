// app/api/content/route.ts
import { NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';
import { ContentType, Prisma } from '@prisma/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Validate content data
function validateContent(data: any): { isValid: boolean; error?: string } {
  if (!data) {
    return { isValid: false, error: 'Content data is required' };
  }

  const { type = 'LINK', title, url, text } = data;

  // Validate type
  if (!Object.values(ContentType).includes(type)) {
    return { isValid: false, error: 'Invalid content type' };
  }

  // Validate based on type
  switch (type) {
    case 'LINK':
      if (!url) {
        return { isValid: false, error: 'URL is required for link content' };
      }
      if (!title) {
        return { isValid: false, error: 'Title is required for link content' };
      }
      break;
    case 'TITLE':
      if (!title) {
        return { isValid: false, error: 'Title is required for title content' };
      }
      break;
    case 'TEXT':
      if (!text) {
        return { isValid: false, error: 'Text is required for text content' };
      }
      break;
    case 'DIVIDER':
      // No validation needed
      break;
  }

  return { isValid: true };
}

export async function GET(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const prisma = await getPrismaClient();
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const content = await prisma.content.findMany({
      where: { userId: user.id },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ content });
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }

    // Validate content data
    const validation = validateContent(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { type = 'LINK', title, url, text, emoji } = body;

    const prisma = await getPrismaClient();
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get the highest order
    const lastContent = await prisma.content.findFirst({
      where: { userId: user.id },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const newOrder = (lastContent?.order ?? -1) + 1;

    // Create the content
    const content = await prisma.content.create({
      data: {
        type: type as ContentType,
        title: title || null,
        url: url || null,
        text: text || null,
        emoji: emoji || null,
        enabled: true,
        order: newOrder,
        userId: user.id,
      },
    });

    return NextResponse.json({ content });
  } catch (error) {
    console.error('Error creating content:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { error: 'Database error: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create content' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }

    const { id, type, title, url, text, emoji, enabled, order } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Content ID is required' },
        { status: 400 }
      );
    }

    // Validate content data
    const validation = validateContent({ type, title, url, text });
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const prisma = await getPrismaClient();
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    const existingContent = await prisma.content.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingContent) {
      return NextResponse.json(
        { error: 'Content not found or unauthorized' },
        { status: 404 }
      );
    }

    // Update the content
    const content = await prisma.content.update({
      where: { id },
      data: {
        type: type as ContentType,
        title: title || null,
        url: url || null,
        text: text || null,
        emoji: emoji || null,
        enabled: enabled ?? true,
        order: order ?? existingContent.order,
      },
    });

    return NextResponse.json({ content });
  } catch (error) {
    console.error('Error updating content:', error);
    return NextResponse.json(
      { error: 'Failed to update content' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Content ID is required' },
        { status: 400 }
      );
    }

    const prisma = await getPrismaClient();
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    const existingContent = await prisma.content.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingContent) {
      return NextResponse.json(
        { error: 'Content not found or unauthorized' },
        { status: 404 }
      );
    }

    // Delete the content
    await prisma.content.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting content:', error);
    return NextResponse.json(
      { error: 'Failed to delete content' },
      { status: 500 }
    );
  }
}