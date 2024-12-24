'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get error from URL if present
    const errorMessage = searchParams.get('error');
    if (errorMessage) {
      setError(errorMessage);
    }

    if (session?.user) {
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
      const result = await signIn('google', {
        callbackUrl: '/dashboard',
        redirect: false,
      });
      
      if (result?.error) {
        setError(result.error);
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setError('An error occurred during sign in');
    }
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FFCC00]">
      <div className="w-full max-w-md rounded-lg border-2 border-black bg-white p-8 shadow-lg">
        {/* Logo */}
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

        {status === 'loading' ? (
          <div className="text-center">
            <div className="mb-4">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#FFCC00] border-t-transparent"></div>
            </div>
            <p>Loading...</p>
          </div>
        ) : session ? (
          <div className="space-y-4">
            <p className="text-center">Signed in as {session.user?.email}</p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => router.push('/register')}
                className="rounded-lg bg-[#FFCC00] px-4 py-2 font-medium text-black transition-colors hover:bg-[#FFD700]"
              >
                Complete Registration
              </button>
              <button
                onClick={handleSignOut}
                className="rounded-lg border-2 border-black px-4 py-2 font-medium text-black transition-colors hover:bg-gray-100"
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
              className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-black bg-white px-4 py-3 font-medium text-black transition-colors hover:bg-gray-50"
            >
              <Image
                src="/images/google.svg"
                alt="Google"
                width={20}
                height={20}
                className="h-5 w-5"
              />
              Sign in with Google
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
