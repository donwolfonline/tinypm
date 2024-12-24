// app/api/user/route.ts
import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import prisma from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';
import { Prisma } from '@prisma/client';

// Helper function to check database connection
async function checkDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection check failed:', error);
    return false;
  }
}

export async function GET() {
  try {
    // Check database connection first
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      return NextResponse.json(
        { error: 'Database connection error', details: 'Could not connect to the database' },
        { status: 503 }
      );
    }

    const session = await getAuthSession();

    if (!session?.user?.email) {
      console.log('No authenticated session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Fetching user data for:', session.user.email);

    // Find or create user with proper error handling
    try {
      const user = await prisma.user.upsert({
        where: { 
          email: session.user.email 
        },
        update: {
          lastLogin: new Date(),
          // Update name and image if they changed in the session
          ...(session.user.name && { name: session.user.name }),
          ...(session.user.image && { image: session.user.image })
        },
        create: {
          email: session.user.email,
          name: session.user.name || '',
          image: session.user.image || '',
          lastLogin: new Date(),
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          username: true,
          pageTitle: true,
          pageDesc: true,
          theme: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('User data:', user);
      }

      return NextResponse.json({ user });
    } catch (error) {
      console.error('Error upserting user:', error);
      throw error; // Let the outer catch handle it
    }

  } catch (error) {
    console.error('Error in user API:', error);
    
    // Handle Prisma-specific errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error('Prisma known error:', {
        code: error.code,
        message: error.message,
        meta: error.meta,
      });
      return NextResponse.json(
        { error: 'Database error', code: error.code, details: error.message },
        { status: 500 }
      );
    }

    if (error instanceof Prisma.PrismaClientInitializationError) {
      console.error('Prisma initialization error:', error.message);
      return NextResponse.json(
        { error: 'Database initialization error', details: error.message },
        { status: 503 }
      );
    }

    if (error instanceof Prisma.PrismaClientRustPanicError) {
      console.error('Prisma client panic error:', error.message);
      return NextResponse.json(
        { error: 'Critical database error', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to fetch user',
        details: error instanceof Error ? error.message : 'Unknown error'
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

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }

    // Validate fields
    const allowedFields = ['name', 'pageTitle', 'pageDesc', 'theme'];
    const updates = Object.keys(body)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = body[key];
        return obj;
      }, {} as Record<string, any>);

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Update user
    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: updates,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        username: true,
        pageTitle: true,
        pageDesc: true,
        theme: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Revalidate user data
    revalidateTag('user');

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error updating user:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
