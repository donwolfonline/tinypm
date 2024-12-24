// app/api/user/route.ts
import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { getPrismaClient } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';
import { Prisma, Theme } from '@prisma/client';

export const runtime = 'nodejs'; // Force Node.js runtime

// Helper function to check database connection
async function checkDatabaseConnection() {
  try {
    const prisma = await getPrismaClient();
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection check failed:', error);
    return false;
  }
}

export async function GET() {
  console.log('User API GET request started');
  
  try {
    // Check database connection first
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      console.error('Database connection failed during user fetch');
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

    try {
      const prisma = await getPrismaClient();
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
          theme: Theme.YELLOW,
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
          stripeCustomerId: true,
        },
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('User data:', user);
      }

      return NextResponse.json({ user });
    } catch (error) {
      console.error('Error upserting user:', error);

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Log specific Prisma error details
        console.error('Prisma error details:', {
          code: error.code,
          meta: error.meta,
          message: error.message,
          clientVersion: error.clientVersion,
        });

        return NextResponse.json(
          { 
            error: 'Database error',
            code: error.code,
            details: error.message
          },
          { status: 500 }
        );
      }

      if (error instanceof Prisma.PrismaClientValidationError) {
        console.error('Prisma validation error:', error.message);
        return NextResponse.json(
          { error: 'Invalid data format', details: error.message },
          { status: 400 }
        );
      }

      if (error instanceof Prisma.PrismaClientInitializationError) {
        console.error('Prisma initialization error:', error.message);
        return NextResponse.json(
          { error: 'Database initialization error', details: error.message },
          { status: 503 }
        );
      }

      throw error; // Let the outer catch handle other errors
    }
  } catch (error) {
    console.error('Error in user API:', error);
    
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
  console.log('User API PATCH request started');
  
  try {
    const session = await getAuthSession();

    if (!session?.user?.email) {
      console.log('No authenticated session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body;
    try {
      body = await request.json();
    } catch (e) {
      console.error('Invalid request body:', e);
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
        // Validate theme enum
        if (key === 'theme' && !Object.values(Theme).includes(body[key])) {
          throw new Error(`Invalid theme value: ${body[key]}`);
        }
        obj[key] = body[key];
        return obj;
      }, {} as Record<string, any>);

    if (Object.keys(updates).length === 0) {
      console.log('No valid fields to update');
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    console.log('Updating user:', session.user.email, 'with:', updates);

    try {
      // Update user
      const prisma = await getPrismaClient();
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
          stripeCustomerId: true,
        },
      });

      // Revalidate user data
      revalidateTag('user');

      console.log('User updated successfully:', user.email);
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

        return NextResponse.json(
          { 
            error: 'Database error',
            code: error.code,
            details: error.message
          },
          { status: 500 }
        );
      }

      throw error; // Let the outer catch handle other errors
    }
  } catch (error) {
    console.error('Error in user API PATCH:', error);

    return NextResponse.json(
      { 
        error: 'Failed to update user',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
