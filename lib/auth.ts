// lib/auth.ts
import { AuthOptions } from 'next-auth';
import { getServerSession } from 'next-auth/next';
import Google from 'next-auth/providers/google';
import prisma from '@/lib/prisma';

// Check required environment variables
const requiredEnvVars = {
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
};

Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

export const authOptions: AuthOptions = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('SignIn callback - user:', { email: user.email, name: user.name });
      console.log('SignIn callback - account:', { provider: account?.provider, type: account?.type });
      console.log('SignIn callback - profile:', profile);

      if (!user.email) {
        console.error('No email provided in sign in callback');
        return false;
      }

      try {
        // Check if user exists
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (!existingUser) {
          // Create new user
          const newUser = await prisma.user.create({
            data: {
              email: user.email,
              name: user.name || '',
              image: user.image || '',
            },
          });
          console.log('Created new user:', { email: newUser.email, id: newUser.id });
        } else {
          console.log('Existing user found:', { email: existingUser.email, id: existingUser.id });
        }

        return true;
      } catch (error) {
        console.error('Error in signIn callback:', error);
        return false;
      }
    },
    async session({ session, token }) {
      console.log('Session callback - session:', session);
      console.log('Session callback - token:', token);

      if (session.user?.email) {
        try {
          const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: {
              id: true,
              email: true,
              name: true,
              image: true,
              username: true,
              createdAt: true,
            },
          });

          if (user) {
            session.user = {
              ...session.user,
              id: user.id,
              username: user.username,
              createdAt: user.createdAt,
            };
            console.log('Updated session with user data:', session.user);
          } else {
            console.error('User not found in database:', session.user.email);
          }
        } catch (error) {
          console.error('Error in session callback:', error);
        }
      }
      return session;
    },
    async jwt({ token, user, account }) {
      console.log('JWT callback - token:', token);
      console.log('JWT callback - user:', user);
      console.log('JWT callback - account:', account);

      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',  // Redirect to login page with error
    signOut: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
};

export async function getAuthSession() {
  return await getServerSession(authOptions);
}
