import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';
import { Filter } from 'bad-words';

// Initialize the filter with custom options
const filter = new Filter();

// Add custom words to the filter's blacklist
filter.addWords(
  'scam',
  'phishing',
  'warez',
  'crack',
  'hack',
  'leaked',
  'dump'
);

// Common offensive terms and protected keywords
const reservedUsernames = new Set([
  // System routes and common endpoints
  'admin', 'administrator', 'settings', 'login', 'logout', 'signup', 'signin',
  'register', 'api', 'dashboard', 'profile', 'account', 'help', 'support',
  'billing', 'payment', 'subscribe', 'mod', 'moderator', 'staff', 'team',
  
  // Protected brand terms
  'official', 'verified', 'support', 'security', 'help', 'info', 'news',
  'announcement', 'service', 'bot', 'system',
  
  // Common impersonation attempts
  'admin-team', 'mod-team', 'support-team', 'help-desk', 'official-support',
  'verification', 'verify', 'authenticated',

  'tinypm', 'tiny_pm', 'tiny-pm', 'tiny', 'tiny_', 'pm_', '_pm', '_tiny'
]);

// Additional validation rules
const containsOffensiveContent = (username: string): boolean => {
  const normalized = username.toLowerCase();
  
  // Use bad-words filter
  if (filter.isProfane(normalized)) {
    return true;
  }
  
  // Check for common impersonation patterns
  if (normalized.match(/(official|real|true|actual)_.+/i) ||
      normalized.match(/.+_(official|support|team)/i)) {
    return true;
  }

  // Check for common admin/mod impersonation patterns
  if (normalized.match(/[0-9]+_(admin|mod|staff)/i)) {
    return true;
  }

  return false;
};

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'You must be logged in' }, { status: 401 });
    }

    const { username } = await req.json();

    // Basic validation
    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    // Username format validation - more restrictive regex
    const usernameRegex = /^[a-zA-Z0-9][a-zA-Z0-9_-]{1,18}[a-zA-Z0-9]$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        {
          error:
            'Username must be 3-20 characters long, start and end with a letter or number, and can only contain letters, numbers, underscores, and hyphens',
        },
        { status: 400 }
      );
    }

    // Check maximum consecutive special characters
    if (username.match(/[_-]{2,}/)) {
      return NextResponse.json(
        { error: 'Username cannot contain consecutive special characters' },
        { status: 400 }
      );
    }

    // Check reserved usernames
    if (reservedUsernames.has(username.toLowerCase())) {
      return NextResponse.json({ error: 'This username is reserved' }, { status: 400 });
    }

    // Check for offensive content
    if (containsOffensiveContent(username)) {
      return NextResponse.json(
        { error: 'This username contains inappropriate content' },
        { status: 400 }
      );
    }

    // Check if username exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Username is already taken' }, { status: 400 });
    }

    // Update the user with the new username
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: { username },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Username registration error:', error);
    return NextResponse.json({ error: 'Failed to register username' }, { status: 500 });
  }
}