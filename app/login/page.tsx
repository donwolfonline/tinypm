'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Image from 'next/image';

// Error messages mapping
const errorMessages: { [key: string]: string } = {
  AccessDenied: 'Access was denied. Please make sure you select a Google account and grant the required permissions.',
  Configuration: 'There is a problem with the server configuration.',
  Verification: 'The verification failed. Please try again.',
  Default: 'An error occurred during sign in. Please try again.',
};

function LoginContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log('Current session status:', status);
    console.log('Current session:', session);
    
    // Get error from URL if present
    const errorCode = searchParams.get('error');
    if (errorCode) {
      console.error('Auth error from URL:', errorCode);
      setError(errorMessages[errorCode] || errorMessages.Default);
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
        setError(errorMessages[result.error] || errorMessages.Default);
      } else {
        console.log('Sign in successful:', result);
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setError('An unexpected error occurred. Please try again.');
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
                <p className="font-medium">Error</p>
                <p className="text-sm">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="mt-2 text-sm text-red-800 underline hover:no-underline"
                >
                  Dismiss
                </button>
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
