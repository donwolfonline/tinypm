// app/components/HomeNav.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export function HomeNav() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Optional: Force revalidation of session data
//   useEffect(() => {
//     const interval = setInterval(() => {
//       updateSession();
//     }, 5000); // Check every 5 seconds

//     return () => clearInterval(interval);
//   }, []);

  return (
    <nav className="fixed z-50 w-full border-b border-black bg-[#FFCC00]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8">
              <Image src="/images/goose.svg" alt="TinyPM Logo" width={0} height={0} sizes="100vw" style={{ width: '100%', height: 'auto' }}/>
            </div>
            <span className="text-xl font-bold text-black">tiny.pm</span>
          </div>
          <div className="flex items-center space-x-4">
            {session ? (
              <>
                <span key={session.user?.name} className="text-black animate-fade-in">
                  Hello, {session.user?.name}
                </span>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="rounded-lg bg-black px-4 py-2 text-[#FFCC00] transition-colors hover:bg-gray-900"
                >
                  Dashboard
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-lg bg-black px-4 py-2 text-[#FFCC00] transition-colors hover:bg-gray-900"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}