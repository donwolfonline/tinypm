import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// Helper function to check database connection
async function checkDatabaseConnection() {
  try {
    // Log the DATABASE_URL (without sensitive info) for debugging
    const dbUrl = process.env.DATABASE_URL || '';
    console.log('Database URL pattern:', dbUrl.replace(/\/\/[^@]*@/, '//<credentials>@'));

    // Try a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('Database connection test result:', result);
    return true;
  } catch (error) {
    console.error('Database connection check failed:', {
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      } : 'Unknown error',
      prismaVersion: Prisma.prismaVersion.client,
      nodeVersion: process.version,
    });
    return false;
  }
}

export async function POST(req: Request) {
  console.log('Username check request received');
  
  try {
    // Check database connection first
    console.log('Checking database connection...');
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      console.error('Database connection failed');
      return NextResponse.json(
        { error: 'Database connection error', details: 'Could not connect to the database' },
        { status: 503 }
      );
    }
    console.log('Database connection successful');

    // Parse request body
    let username: string;
    try {
      const body = await req.json();
      username = body.username;
      console.log('Received username check request for:', username);
    } catch (error) {
      console.error('Error parsing request body:', error);
      return NextResponse.json(
        { error: 'Invalid request body', details: 'Could not parse JSON body' },
        { status: 400 }
      );
    }

    // Basic validation
    if (!username) {
      console.log('Empty username received');
      return NextResponse.json(
        { error: 'Username is required', details: 'Username field must not be empty' },
        { status: 400 }
      );
    }

    // Username format validation
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    if (!usernameRegex.test(username)) {
      console.log('Invalid username format:', username);
      return NextResponse.json(
        {
          error: 'Invalid username format',
          details: 'Username must be 3-20 characters long and can only contain letters, numbers, underscores, and hyphens',
        },
        { status: 400 }
      );
    }

    // Check reserved usernames
    const reservedUsernames = [
      'admin', 'administrator', 'root',
      'settings', 'config', 'configuration',
      'login', 'logout', 'signin', 'signout',
      'signup', 'register', 'auth',
      'api', 'graphql', 'rest',
      'dashboard', 'account', 'profile',
      'user', 'users', 'member', 'members',
      'subscription', 'subscriptions', 'billing',
      'support', 'help', 'contact',
      'docs', 'documentation', 'guide',
      'terms', 'privacy', 'legal',
      'about', 'home', 'index',
      'tiny', 'tinypm', 'tiny-pm',
    ];

    if (reservedUsernames.includes(username.toLowerCase())) {
      console.log('Reserved username attempted:', username);
      return NextResponse.json(
        { error: 'Reserved username', details: 'This username is reserved and cannot be used' },
        { status: 400 }
      );
    }

    // Check if username exists
    try {
      console.log('Checking if username exists:', username);
      const existingUser = await prisma.user.findUnique({
        where: { username },
        select: { id: true }, // Only select id for performance
      });

      if (existingUser) {
        console.log('Username already taken:', username);
        return NextResponse.json(
          { error: 'Username taken', details: 'This username is already in use' },
          { status: 400 }
        );
      }

      console.log('Username is available:', username);
      return NextResponse.json({ available: true, username });
    } catch (error) {
      console.error('Database error checking username:', {
        username,
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        } : 'Unknown error'
      });

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
          error: 'Internal server error',
          details: error instanceof Error ? error.message : 'Unknown error checking username',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Unhandled error in username API:', {
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      } : 'Unknown error'
    });
    
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error in username API',
      },
      { status: 500 }
    );
  }
}
