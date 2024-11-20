import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { username } = await req.json();
    
    // Basic validation
    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    // Username format validation
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        { 
          error: 'Username must be 3-20 characters long and can only contain letters, numbers, underscores, and hyphens' 
        },
        { status: 400 }
      );
    }

    // Check reserved usernames
    const reservedUsernames = ['admin', 'settings', 'login', 'signup', 'api', 'dashboard'];
    if (reservedUsernames.includes(username.toLowerCase())) {
      return NextResponse.json(
        { error: 'This username is reserved' },
        { status: 400 }
      );
    }

    // Check if username exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username is already taken' },
        { status: 400 }
      );
    }

    return NextResponse.json({ available: true });
  } catch (error) {
    console.error('Username check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}