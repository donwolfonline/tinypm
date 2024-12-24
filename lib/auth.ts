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

export const authOptions: AuthOptions = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "online",
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
      console.log('SignIn callback started', {
        user: {
          email: user?.email,
          name: user?.name,
          image: user?.image
        },
        account: {
          provider: account?.provider,
          type: account?.type,
          scope: account?.scope
        },
        profile
      });

      try {
        // Always allow sign in - remove blocking conditions
        if (user?.email) {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          if (!existingUser) {
            await prisma.user.create({
              data: {
                email: user.email,
                name: user.name || '',
                image: user.image || '',
              },
            });
            console.log('Created new user with email:', user.email);
          } else {
            console.log('Existing user found with email:', user.email);
          }
        }
        
        return true; // Always allow sign in
      } catch (error) {
        console.error('Error in signIn callback:', error);
        // Don't block sign in on database errors
        return true;
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
