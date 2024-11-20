'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Edit } from 'lucide-react';

export default function EditButton({ username }: { username: string }) {
  const { data: session } = useSession();
  const router = useRouter();

  if (!session || session.user?.username !== username) return null;

  return (
    <button
      onClick={() => router.push('/dashboard')}
      className="fixed bottom-4 right-4 flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-[#FFCC00] shadow-lg transition-colors hover:bg-gray-900"
    >
      <Edit className="h-4 w-4" />
      Edit Your Links
    </button>
  );
}
