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

  // Check format (alphanumeric and hyphens only)
  if (!/^[a-zA-Z0-9-]+$/.test(username)) {
    return { isValid: false, error: 'Username can only contain letters, numbers, and hyphens' };
  }

  // Check for consecutive hyphens
  if (username.includes('--')) {
    return { isValid: false, error: 'Username cannot contain consecutive hyphens' };
  }

  // Check start and end characters
  if (username.startsWith('-') || username.endsWith('-')) {
    return { isValid: false, error: 'Username cannot start or end with a hyphen' };
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }

    const { username } = body;

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    // Validate username format
    const validation = validateUsername(username);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Check for offensive content
    if (containsOffensiveContent(username)) {
      return NextResponse.json(
        { error: 'Username contains inappropriate content' },
        { status: 400 }
      );
    }

    try {
      const prisma = await getPrismaClient();
      
      // Check if username is already taken
      const existingUser = await prisma.user.findFirst({
        where: {
          username: {
            equals: username,
            mode: 'insensitive',
          },
        },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'Username is already taken' },
          { status: 409 }
        );
      }

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

      return NextResponse.json({ user: updatedUser });
    } catch (error) {
      console.error('Database error:', error);

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          return NextResponse.json(
            { error: 'Username is already taken' },
            { status: 409 }
          );
        }
        return NextResponse.json(
          { error: 'Database error', code: error.code },
          { status: 500 }
        );
      }

      throw error; // Let the outer catch handle other errors
    }
  } catch (error) {
    console.error('Error in username registration:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to register username',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}