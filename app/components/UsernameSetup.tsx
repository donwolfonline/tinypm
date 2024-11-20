'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UsernameSetup() {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const router = useRouter();

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChecking(true);
    setError('');

    try {
      // Check username availability
      const checkResponse = await fetch('/api/username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });

      const checkData = await checkResponse.json();

      if (!checkResponse.ok) {
        setError(checkData.error);
        return;
      }

      // Set username
      const updateResponse = await fetch('/api/user/username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });

      if (!updateResponse.ok) {
        const data = await updateResponse.json();
        setError(data.error);
        return;
      }

      router.push('/dashboard');
    } catch (error) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFCC00] p-8">
      <div className="mx-auto max-w-md rounded-xl border-2 border-black bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-bold">Choose your username</h1>

        <form onSubmit={handleUsernameSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Your tiny.pm URL</label>
            <div className="flex items-center rounded-lg border border-gray-200">
              <span className="px-3 text-gray-500">tiny.pm/</span>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value.toLowerCase())}
                className="flex-1 rounded-r-lg border-0 py-2 focus:ring-2 focus:ring-black"
                placeholder="username"
                required
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={isChecking}
            className="w-full rounded-lg bg-black px-4 py-2 text-[#FFCC00] hover:bg-gray-900 disabled:opacity-50"
          >
            {isChecking ? 'Checking...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
