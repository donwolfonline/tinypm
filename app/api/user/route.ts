// app/api/user/route.ts
import { NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';
import { Prisma, Theme } from '@prisma/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prisma = await getPrismaClient();
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
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

    if (!user) {
      // Create new user if not found
      const newUser = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name || '',
          image: session.user.image || '',
          theme: Theme.YELLOW,
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
      return NextResponse.json({ user: newUser });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error in user API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate fields
    const allowedFields = ['name', 'pageTitle', 'pageDesc', 'theme'];
    const updates = Object.keys(body)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        if (key === 'theme' && !Object.values(Theme).includes(body[key])) {
          throw new Error(`Invalid theme value: ${body[key]}`);
        }
        obj[key] = body[key];
        return obj;
      }, {} as Record<string, any>);

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

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

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error in user API PATCH:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
