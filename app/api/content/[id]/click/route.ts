// app/api/content/[id]/click/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const id = request.url.split('/').slice(-2)[0];

    const content = await prisma.content.findUnique({
      where: { id },
    });

    if (!content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    // Only increment clicks for LINK type content
    if (content.type !== 'LINK') {
      return NextResponse.json({ error: 'Only links can be clicked' }, { status: 400 });
    }

    const updatedContent = await prisma.content.update({
      where: { id },
      data: {
        clicks: {
          increment: 1,
        },
      },
    });

    return NextResponse.json(updatedContent);
  } catch (error) {
    console.error('Error updating click count:', error);
    return NextResponse.json({ error: 'Failed to update click count' }, { status: 500 });
  }
}