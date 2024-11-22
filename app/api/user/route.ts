// app/api/user/route.ts
import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import prisma from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';

export async function GET() {
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

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch user',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) {
      if (!data.name?.trim()) {
        return NextResponse.json({ error: 'Name cannot be empty' }, { status: 400 });
      }
      updateData.name = data.name.trim();
    }

    if (data.theme !== undefined) {
      updateData.theme = data.theme;
    }

    if (data.pageTitle !== undefined) {
      updateData.pageTitle = data.pageTitle.trim() || null;
    }

    if (data.pageDesc !== undefined) {
      updateData.pageDesc = data.pageDesc.trim() || null;
    }

    if (data.image !== undefined) {
      // If image is empty string or null, set to null in DB
      if (!data.image || !data.image.trim()) {
        updateData.image = null;
      } else {
        const trimmedImage = data.image.trim();
        // Only validate URL if there is an actual URL to validate
        try {
          new URL(trimmedImage);
          updateData.image = trimmedImage;
        } catch (e) {
          return NextResponse.json({ error: 'Invalid image URL format' }, { status: 400 });
        }
      }
    }

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: updateData,
    });

    // Revalidate the user's profile page cache
    revalidateTag(`user-${updatedUser.username}`);

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error in user update:', error);
    return NextResponse.json(
      {
        error: 'Failed to update user',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
