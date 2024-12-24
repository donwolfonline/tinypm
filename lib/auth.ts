// lib/auth.ts
import { AuthOptions } from 'next-auth';
import { getServerSession } from 'next-auth/next';
import Google from 'next-auth/providers/google';
import prisma from '@/lib/prisma';

// Function to validate environment variables
function validateEnv() {
  const requiredEnvVars = {
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  };

  const missingVars = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }

  // Set NEXTAUTH_URL if not set
  if (!process.env.NEXTAUTH_URL) {
    if (process.env.VERCEL_URL) {
      process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL}`;
      console.log('Setting NEXTAUTH_URL from VERCEL_URL:', process.env.NEXTAUTH_URL);
    } else if (process.env.NODE_ENV === 'development') {
      process.env.NEXTAUTH_URL = 'http://localhost:3000';
      console.log('Setting NEXTAUTH_URL for development:', process.env.NEXTAUTH_URL);
    }
  }

  return true;
}

// Validate environment variables
validateEnv();

export const authOptions: AuthOptions = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile"
        }
      }
    }),
  ],
  debug: true, // Enable debug logs
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account, profile, email }) {
      console.log('SignIn callback started');
      console.log('User:', { email: user.email, name: user.name });
      console.log('Account:', { provider: account?.provider, type: account?.type });
      console.log('Profile:', profile);

      try {
        if (!user.email) {
          console.error('No email provided by Google');
          return false;
        }

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
      console.log('Session callback started');
      console.log('Session:', session);
      console.log('Token:', token);

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
      console.log('JWT callback started');
      console.log('Token:', token);
      console.log('User:', user);
      console.log('Account:', account);

      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  events: {
    async signIn(message) {
      console.log('SignIn event:', message);
    },
    async signOut(message) {
      console.log('SignOut event:', message);
    },
    async error(message) {
      console.error('Auth error event:', message);
    }
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
