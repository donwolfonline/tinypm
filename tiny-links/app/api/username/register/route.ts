// app/api/username/register/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'You must be logged in' }, { status: 401 });
    }

    const { username } = await req.json();

    // Basic validation
    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    // Username format validation
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        {
          error:
            'Username must be 3-20 characters long and can only contain letters, numbers, underscores, and hyphens',
        },
        { status: 400 }
      );
    }

    // Check reserved usernames
    const reservedUsernames = ['admin', 'settings', 'login', 'signup', 'api', 'dashboard'];
    if (reservedUsernames.includes(username.toLowerCase())) {
      return NextResponse.json({ error: 'This username is reserved' }, { status: 400 });
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
