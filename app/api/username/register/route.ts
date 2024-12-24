import { NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';
import { Filter } from 'bad-words';
import { Prisma } from '@prisma/client';

// Initialize the filter with custom options
const filter = new Filter();

// Add custom words to the filter's blacklist
filter.addWords('scam', 'phishing', 'warez', 'crack', 'hack', 'leaked', 'dump');

// Common offensive terms and protected keywords
const reservedUsernames = new Set([
  // System routes and common endpoints
  'admin',
  'administrator',
  'settings',
  'login',
  'logout',
  'signup',
  'signin',
  'register',
  'api',
  'dashboard',
  'profile',
  'account',
  'help',
  'support',
  'billing',
  'payment',
  'subscribe',
  'mod',
  'moderator',
  'staff',
  'team',

  // Protected brand terms
  'official',
  'verified',
  'support',
  'security',
  'help',
  'info',
  'news',
  'announcement',
  'service',
  'bot',
  'system',

  // Common impersonation attempts
  'admin-team',
  'mod-team',
  'support-team',
  'team-member',
  'staff-member',
  'customer-service',
  'customer-support',
  'helpdesk',
  'service-desk',
]);

// Username validation function
function validateUsername(username: string): { isValid: boolean; error?: string } {
  // Check length
  if (username.length < 3) {
    return { isValid: false, error: 'Username must be at least 3 characters long' };
  }
  if (username.length > 20) {
    return { isValid: false, error: 'Username must be no longer than 20 characters' };
  }

  // Check format (alphanumeric, underscores, and hyphens only)
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return { isValid: false, error: 'Username can only contain letters, numbers, underscores, and hyphens' };
  }

  // Check for consecutive special characters
  if (/[-_]{2,}/.test(username)) {
    return { isValid: false, error: 'Username cannot contain consecutive special characters' };
  }

  // Check start and end characters
  if (/^[-_]|[-_]$/.test(username)) {
    return { isValid: false, error: 'Username cannot start or end with special characters' };
  }

  // Check reserved usernames
  if (reservedUsernames.has(username.toLowerCase())) {
    return { isValid: false, error: 'This username is reserved' };
  }

  return { isValid: true };
}

// Check for offensive content
function containsOffensiveContent(username: string): boolean {
  try {
    // Check if the username contains any profanity
    if (filter.isProfane(username)) {
      return true;
    }

    // Additional custom checks can be added here
    return false;
  } catch (error) {
    console.error('Error checking offensive content:', error);
    return false;
  }
}

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

export async function POST(req: Request) {
  console.log('Username registration started');
  
  try {
    // Check database connection first
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      console.error('Database connection failed during username registration');
      return NextResponse.json(
        { error: 'Database connection error', details: 'Could not connect to the database' },
        { status: 503 }
      );
    }

    // Get session
    const session = await getAuthSession();
    if (!session?.user?.email) {
      console.log('No authenticated session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Processing username registration for:', session.user.email);

    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (e) {
      console.error('Invalid request body:', e);
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }

    const { username } = body;

    if (!username) {
      console.log('No username provided');
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    console.log('Validating username:', username);

    // Validate username format
    const validation = validateUsername(username);
    if (!validation.isValid) {
      console.log('Username validation failed:', validation.error);
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Check for offensive content
    if (containsOffensiveContent(username)) {
      console.log('Username contains inappropriate content:', username);
      return NextResponse.json(
        { error: 'Username contains inappropriate content' },
        { status: 400 }
      );
    }

    try {
      console.log('Getting Prisma client');
      const prisma = await getPrismaClient();
      
      console.log('Checking for existing username');
      // Check if username is already taken (case-insensitive)
      const existingUser = await prisma.user.findFirst({
        where: {
          username: {
            equals: username,
            mode: 'insensitive',
          },
        },
      });

      if (existingUser) {
        console.log('Username already taken:', username);
        return NextResponse.json(
          { error: 'Username is already taken' },
          { status: 409 }
        );
      }

      console.log('Updating user with new username');
      // Update user with new username
      const updatedUser = await prisma.user.update({
        where: { email: session.user.email },
        data: { username },
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          image: true,
        },
      });

      console.log('Username registration successful:', updatedUser.username);
      return NextResponse.json({ user: updatedUser });
    } catch (error) {
      console.error('Database error during username registration:', error);

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Log specific Prisma error details
        console.error('Prisma error details:', {
          code: error.code,
          meta: error.meta,
          message: error.message,
          clientVersion: error.clientVersion,
        });

        if (error.code === 'P2002') {
          return NextResponse.json(
            { error: 'Username is already taken' },
            { status: 409 }
          );
        }

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
    // Log the full error with stack trace
    console.error('Unhandled error in username registration:', {
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to register username',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}