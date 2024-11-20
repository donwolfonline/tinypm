// app/register/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Register() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Check username availability
  const checkUsername = async (username: string) => {
    if (username.length < 3) return;
    setIsChecking(true);
    setError('');
    
    try {
      const res = await fetch('/api/username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      
      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
        setIsAvailable(false);
      } else {
        setIsAvailable(true);
      }
    } catch (err) {
      setError('Error checking username availability');
      setIsAvailable(false);
    } finally {
      setIsChecking(false);
    }
  };

  // Save username
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAvailable || isChecking) return;

    try {
      const res = await fetch('/api/username/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        // Redirect to their new profile page
        router.push(`/${username}`);
      }
    } catch (err) {
      setError('Error saving username');
    }
  };

  // Debounced username check
  useEffect(() => {
    const timer = setTimeout(() => {
      if (username.length >= 3) {
        checkUsername(username);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFCC00]">
        <div className="w-full max-w-md rounded-lg border-2 border-black bg-white p-8 shadow-lg">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FFCC00]">
      <div className="w-full max-w-md rounded-lg border-2 border-black bg-white p-8 shadow-lg">
        {/* Logo */}
        <div className="mx-auto mb-6 h-16 w-16">
          <svg viewBox="0 0 100 100" className="h-full w-full">
            <path
              d="M35.5 70.5c-3-15-2-27.5 4.5-34.5 6-6.5 14-8.5 19-8.5 8.5 0 15 3.5 18.5 7.5 4 4.5 5.5 10 5.5 14 0 6.5-3 11.5-6.5 15-4 4-9 6.5-13 7.5-2.5.5-5.5 1-9 1-7 0-13.5-1-19-2z"
              fill="black"
            />
          </svg>
        </div>

        <h2 className="mb-6 text-center text-2xl font-bold">Choose your username</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value.toLowerCase());
                  setIsAvailable(false);
                }}
                className="w-full rounded-lg border-2 border-black p-3 focus:outline-none focus:ring-2 focus:ring-[#FFCC00]"
                placeholder="Enter username"
                pattern="^[a-zA-Z0-9_-]{3,20}$"
                required
                minLength={3}
                maxLength={20}
              />
              <div className="absolute right-3 top-3">
                {isChecking ? (
                  <span className="text-gray-400">Checking...</span>
                ) : username.length >= 3 && (
                  isAvailable ? (
                    <span className="text-green-600">✓ Available</span>
                  ) : (
                    error && <span className="text-red-600">✗</span>
                  )
                )}
              </div>
            </div>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            <p className="mt-2 text-sm text-gray-600">
              Username must be 3-20 characters long and can only contain letters, numbers, underscores, and hyphens.
            </p>
          </div>

          <button
            type="submit"
            disabled={!isAvailable || isChecking}
            className="w-full rounded-lg bg-black px-4 py-3 text-[#FFCC00] transition-colors hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Complete Setup
          </button>
        </form>
      </div>
    </div>
  );
}