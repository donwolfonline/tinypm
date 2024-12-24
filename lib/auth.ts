// lib/auth.ts
import { AuthOptions } from 'next-auth';
import { getServerSession } from 'next-auth/next';
import Google from 'next-auth/providers/google';
import prisma from '@/lib/prisma';

// Function to validate environment variables
function validateEnv() {
  // Only validate on server side
  if (typeof window !== 'undefined') {
    return true;
  }

  const requiredEnvVars = {
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  };

  const missingVars = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    console.error('Missing environment variables:', missingVars);
    return false;
  }

  return true;
}

// Validate environment variables
const isValid = validateEnv();

if (!isValid) {
  console.error('Authentication is not properly configured. Check environment variables.');
}

export const authOptions: AuthOptions = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline", // Changed to offline to get refresh token
          response_type: "code",
          scope: "email profile"
        }
      }
    }),
  ],
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account, profile, email }) {
      try {
        if (!user?.email) {
          console.error('No email provided by Google');
          return false;
        }

        console.log('Sign in attempt for:', user.email);

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: { id: true },
        });

        if (!existingUser) {
          console.log('Creating new user:', user.email);
          // Create new user
          await prisma.user.create({
            data: {
              email: user.email,
              name: user.name || '',
              image: user.image || null,
            },
          });
        } else {
          console.log('Existing user found:', user.email);
        }

        return true;
      } catch (error) {
        console.error('Error in signIn callback:', error);
        // Don't block sign in on database errors, but log them
        return true;
      }
    },
    async session({ session, token }) {
      try {
        console.log('Session callback started');

        if (!session?.user?.email) {
          console.error('No user email in session');
          return session;
        }

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
          console.log('Session updated with user data');
        } else {
          console.error('User not found in database:', session.user.email);
          // Return session without extra data rather than failing
        }

        return session;
      } catch (error) {
        console.error('Error in session callback:', error);
        // Return original session on error rather than failing
        return session;
      }
    },
    async jwt({ token, user, account }) {
      try {
        console.log('JWT callback started');

        if (user) {
          token.id = user.id;
          token.email = user.email;
        }

        return token;
      } catch (error) {
        console.error('Error in JWT callback:', error);
        // Return original token on error
        return token;
      }
    },
  },
  events: {
    async signIn(message) {
      console.log('Sign in successful:', message);
    },
    async signOut(message) {
      console.log('Sign out successful:', message);
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',  // Redirect to login page with error
    signOut: '/login',
  },
};

export async function getAuthSession() {
  try {
    return await getServerSession(authOptions);
  } catch (error) {
    console.error('Error getting auth session:', error);
    return null;
  }
}
