'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Image from 'next/image';

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push('/dashboard');
    }
  }, [session, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FFCC00]">
      <div className="w-full max-w-md rounded-lg border-2 border-black bg-white p-8 shadow-lg">
        {/* Logo */}
        <div className="mx-auto mb-6 h-16 w-16">
        <Image src="/images/goose.svg" alt="TinyPM Logo" width={0} height={0} sizes="100vw" style={{ width: '100%', height: 'auto' }}/>
        </div>

        <h2 className="mb-6 text-center text-2xl font-bold">Welcome to tiny.pm</h2>

        {status === 'loading' ? (
          <div className="text-center">Loading...</div>
        ) : session ? (
          <div className="space-y-4">
            <p className="text-center">Signed in as {session.user?.email}</p>
            <button
              onClick={() => signOut()}
              className="w-full rounded-lg bg-black px-4 py-2 text-[#FFCC00] transition-colors hover:bg-gray-900"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <button
            onClick={() => signIn('google')}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-black px-4 py-3 text-[#FFCC00] transition-colors hover:bg-gray-900"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign in with Google
          </button>
        )}
      </div>
    </div>
  );
}
