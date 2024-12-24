import { NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';
import { Filter } from 'bad-words';
import { Prisma } from '@prisma/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Initialize the filter with custom options
const filter = new Filter();

// Add custom words to the filter's blacklist
filter.addWords('scam', 'phishing', 'warez', 'crack', 'hack', 'leaked', 'dump');

// Common offensive terms and protected keywords
const reservedUsernames = new Set([
  'admin', 'administrator', 'settings', 'login', 'logout', 'signup',
  'signin', 'register', 'api', 'dashboard', 'profile', 'account',
  'help', 'support', 'billing', 'payment', 'subscribe', 'mod',
  'moderator', 'staff', 'team', 'official', 'verified', 'support',
  'security', 'help', 'info', 'news', 'announcement', 'service',
  'bot', 'system'
]);

// Username validation function
function validateUsername(username: string): { isValid: boolean; error?: string } {
  // Check length
  if (!username || typeof username !== 'string') {
    return { isValid: false, error: 'Username is required' };
  }
  
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
    return filter.isProfane(username);
  } catch (error) {
    console.error('Error checking offensive content:', error);
    return false;
  }
}

export async function POST(req: Request) {
  try {
    // Get session
    const session = await getAuthSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
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

    // Validate username
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

    // Update user with new username
    const prisma = await getPrismaClient();
    
    // First check if username is taken
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

    // Update the user
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: { username },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        image: true,
        theme: true,
        pageTitle: true,
        pageDesc: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error('Error in username registration:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'Username is already taken' },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to register username' },
      { status: 500 }
    );
  }
}