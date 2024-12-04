import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';
import { Filter } from 'bad-words';

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
  'help-desk',
  'official-support',
  'verification',
  'verify',
  'authenticated',

  'tinypm',
  'tiny_pm',
  'tiny-pm',
  'tiny',
  'tiny_',
  'pm_',
  '_pm',
  '_tiny',
]);

function validateUsername(username: string): { isValid: boolean; error?: string } {
  // Basic validation
  if (!username || typeof username !== 'string') {
    return { isValid: false, error: 'Username is required' };
  }

  // Format validation
  const usernameRegex = /^[a-zA-Z0-9][a-zA-Z0-9_-]{1,18}[a-zA-Z0-9]$/;
  if (!usernameRegex.test(username)) {
    return { 
      isValid: false, 
      error: 'Username must be 3-20 characters long, start and end with a letter or number, and can only contain letters, numbers, underscores, and hyphens'
    };
  }

  // Consecutive special characters
  if (username.match(/[_-]{2,}/)) {
    return { 
      isValid: false, 
      error: 'Username cannot contain consecutive special characters' 
    };
  }

  // Reserved usernames
  if (reservedUsernames.has(username.toLowerCase())) {
    return { isValid: false, error: 'This username is reserved' };
  }

  // Offensive content check
  if (containsOffensiveContent(username)) {
    return { 
      isValid: false, 
      error: 'This username contains inappropriate content' 
    };
  }

  return { isValid: true };
}

function containsOffensiveContent(username: string): boolean {
  const normalized = username.toLowerCase();

  if (filter.isProfane(normalized)) return true;

  // Impersonation patterns
  const impersonationPatterns = [
    /(official|real|true|actual)_.+/i,
    /.+_(official|support|team)/i,
    /[0-9]+_(admin|mod|staff)/i
  ];

  return impersonationPatterns.some(pattern => pattern.test(normalized));
}

export async function POST(req: Request) {
  try {
    // Authentication check
    const session = await getAuthSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'You must be logged in' },
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Safe request body parsing
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const { username } = body;

    // Validate username
    const validation = validateUsername(username);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Check for existing username
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username is already taken' },
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: { username },
    });

    return NextResponse.json(
      updatedUser,
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    // Structured error logging
    console.error('Username registration error:', {
      error: error instanceof Error ? {
        message: error.message,
        name: error.name,
        stack: error.stack
      } : error,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(
      { error: 'Failed to register username' },
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}