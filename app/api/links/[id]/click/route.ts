// app/api/links/[id]/click/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    // Get ID from URL
    const id = request.url.split('/').slice(-2)[0]; // Gets the ID from /api/links/[id]/click

    const link = await prisma.link.findUnique({
      where: { id },
    });

    if (!link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    // Update click count
    const updatedLink = await prisma.link.update({
      where: { id },
      data: {
        clicks: {
          increment: 1,
        },
      },
    });

    return NextResponse.json(updatedLink);
  } catch (error) {
    console.error('Error updating click count:', error);
    return NextResponse.json({ error: 'Failed to update click count' }, { status: 500 });
  }
}
