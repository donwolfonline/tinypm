// app/api/user/route.ts
import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import prisma from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getAuthSession();

    if (!session?.user?.email) {
      console.log('No authenticated session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Fetching user data for:', session.user.email);

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        pageTitle: true,
        pageDesc: true,
        theme: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      console.log('User not found:', session.user.email);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('Fetched user data:', user);
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error in user API:', error);
    
    // Check for specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes('prisma')) {
        console.error('Prisma error:', error.message);
        return NextResponse.json(
          { error: 'Database error', details: error.message },
          { status: 500 }
        );
      }
    }

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
      console.log('No authenticated session found for update');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const updateData: Record<string, unknown> = {};

    // Validate and sanitize input data
    if (data.name !== undefined) {
      if (!data.name?.trim()) {
        return NextResponse.json({ error: 'Name cannot be empty' }, { status: 400 });
      }
      updateData.name = data.name.trim();
    }

    if (data.pageTitle !== undefined) {
      updateData.pageTitle = data.pageTitle.trim();
    }

    if (data.pageDesc !== undefined) {
      updateData.pageDesc = data.pageDesc.trim();
    }

    if (data.theme !== undefined) {
      updateData.theme = data.theme;
    }

    console.log('Updating user data for:', session.user.email, updateData);

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        pageTitle: true,
        pageDesc: true,
        theme: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (process.env.NODE_ENV === 'development') {
      console.log('Updated user data:', updatedUser);
    }

    // Revalidate user data
    revalidateTag('user');

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);

    // Check for specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes('prisma')) {
        console.error('Prisma error:', error.message);
        return NextResponse.json(
          { error: 'Database error', details: error.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      {
        error: 'Failed to update user',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
