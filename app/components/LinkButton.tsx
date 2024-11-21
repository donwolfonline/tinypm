// components/LinkButton.tsx
'use client';

import { useState } from 'react';
import { themes } from '@/lib/themes';
import type { Theme } from '@/types';

type Props = {
  id: string;
  href: string;
  title: string;
  theme: Theme;
};

export default function LinkButton({ id, href, title, theme }: Props) {
  const [isHovered, setIsHovered] = useState(false);
  const themeConfig = themes[theme];

  const handleClick = async () => {
    try {
      await fetch(`/api/links/${id}/click`, { method: 'POST' });
    } catch (error) {
      console.error('Error tracking click:', error);
    }
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`block w-full rounded-lg border-2 ${themeConfig.buttonBorder} ${themeConfig.buttonBg} p-4 text-center font-medium ${themeConfig.buttonText} transition-transform ${themeConfig.buttonHover} ${
        isHovered ? 'scale-[1.02]' : ''
      }`}
    >
      {title}
    </a>
  );
}
