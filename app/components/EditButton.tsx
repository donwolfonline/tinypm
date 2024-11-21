'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Edit } from 'lucide-react';
import { themes } from '@/lib/themes';
import type { Theme } from '@/types';

type Props = {
  username: string;
  theme?: Theme;
};

export default function EditButton({ username, theme = 'YELLOW' }: Props) {
  const { data: session } = useSession();

  if (!session || session.user?.username !== username) return null;

  const themeConfig = themes[theme];

  return (
    <Link
      href="/dashboard"
      className={`fixed bottom-4 right-4 flex items-center gap-2 rounded-lg px-4 py-2 shadow-lg transition-all hover:scale-105 ${themeConfig.buttonBg} ${themeConfig.buttonText} ${themeConfig.buttonHover}`}
    >
      <Edit className="h-4 w-4" />
      Edit Your Links
    </Link>
  );
}
