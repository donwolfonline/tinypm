'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Image from 'next/image';

function LoginContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log('Session status:', status);
    console.log('Session data:', session);
    
    // Get error from URL if present
    const errorMessage = searchParams.get('error');
    if (errorMessage) {
      setError(errorMessage);
      console.error('Auth error from URL:', errorMessage);
    }

    if (session?.user) {
      console.log('User is authenticated, redirecting...');
      if (session.user.username) {
        router.push('/dashboard');
      } else {
        router.push('/register');
      }
    }
  }, [session, router, searchParams]);

  const handleSignIn = async () => {
    try {
      setError(null);
      setIsLoading(true);
      console.log('Initiating Google sign in...');
      
      const result = await signIn('google', {
        callbackUrl: '/dashboard',
        redirect: false,
      });
      
      if (result?.error) {
        console.error('Sign in error:', result.error);
        setError(result.error);
      } else {
        console.log('Sign in successful:', result);
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setError('An error occurred during sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      console.log('Signing out...');
      await signOut({ callbackUrl: '/login' });
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Show loading state only when session status is loading
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFCC00]">
        <div className="w-full max-w-md rounded-lg border-2 border-black bg-white p-8 shadow-lg">
          <div className="mx-auto mb-6 h-16 w-16">
            <Image
              src="/images/goose.svg"
              alt="TinyPM Logo"
              width={64}
              height={64}
              priority
            />
          </div>
          <h2 className="mb-6 text-center text-2xl font-bold">Welcome to tiny.pm</h2>
          <div className="text-center">
            <div className="mb-4">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#FFCC00] border-t-transparent"></div>
            </div>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FFCC00]">
      <div className="w-full max-w-md rounded-lg border-2 border-black bg-white p-8 shadow-lg">
        <div className="mx-auto mb-6 h-16 w-16">
          <Image
            src="/images/goose.svg"
            alt="TinyPM Logo"
            width={64}
            height={64}
            priority
          />
        </div>

        <h2 className="mb-6 text-center text-2xl font-bold">Welcome to tiny.pm</h2>

        {session ? (
          <div className="space-y-4">
            <p className="text-center">Signed in as {session.user?.email}</p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => router.push('/register')}
                className="rounded-lg bg-[#FFCC00] px-4 py-2 font-medium text-black transition-colors hover:bg-[#FFD700]"
                disabled={isLoading}
              >
                Complete Registration
              </button>
              <button
                onClick={handleSignOut}
                className="rounded-lg border-2 border-black px-4 py-2 font-medium text-black transition-colors hover:bg-gray-100"
                disabled={isLoading}
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {error && (
              <div className="mb-4 rounded-lg bg-red-100 p-4 text-center text-red-600">
                {error}
              </div>
            )}
            <button
              onClick={handleSignIn}
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-black bg-white px-4 py-3 font-medium text-black transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent"></div>
              ) : (
                <Image
                  src="/images/google.svg"
                  alt="Google"
                  width={20}
                  height={20}
                  className="h-5 w-5"
                />
              )}
              {isLoading ? 'Signing in...' : 'Sign in with Google'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#FFCC00]">
        <div className="w-full max-w-md rounded-lg border-2 border-black bg-white p-8 shadow-lg">
          <div className="mx-auto mb-6 h-16 w-16">
            <Image
              src="/images/goose.svg"
              alt="TinyPM Logo"
              width={64}
              height={64}
              priority
            />
          </div>
          <h2 className="mb-6 text-center text-2xl font-bold">Welcome to tiny.pm</h2>
          <div className="text-center">
            <div className="mb-4">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#FFCC00] border-t-transparent"></div>
            </div>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
