import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function POST(req: Request) {
  console.log('Username check request received');
  
  try {
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

    // Try to connect to the database and check if username exists
    try {
      console.log('Attempting database query...');
      
      // Use a raw query to check if the username exists
      const result = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT 1 FROM "User" WHERE username = ${username}
        ) as exists
      `;
      
      console.log('Database query result:', result);

      const exists = Array.isArray(result) && result.length > 0 && result[0].exists;
      
      if (exists) {
        console.log('Username already taken:', username);
        return NextResponse.json(
          { error: 'Username taken', details: 'This username is already in use' },
          { status: 400 }
        );
      }

      console.log('Username is available:', username);
      return NextResponse.json({ available: true, username });
    } catch (error) {
      console.error('Database error:', {
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        } : 'Unknown error',
        prismaVersion: Prisma.prismaVersion.client,
        nodeVersion: process.version,
      });

      // Check if it's a connection error
      if (error instanceof Error && 
          (error.message.includes('connect ECONNREFUSED') || 
           error.message.includes('failed to connect'))) {
        return NextResponse.json(
          { error: 'Database connection error', details: 'Could not connect to the database' },
          { status: 503 }
        );
      }

      return NextResponse.json(
        {
          error: 'Database error',
          details: error instanceof Error ? error.message : 'Unknown database error',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Unhandled error:', {
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      } : 'Unknown error',
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
