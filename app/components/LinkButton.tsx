'use client';

import { useState } from 'react';
import { themes } from '@/lib/themes';
import type { Theme } from '@/types';

type Props = {
  id: string;
  href: string;
  title: string;
  theme: Theme;
  emoji?: string | null;
};

// Helper function to get favicon URL
const getFaviconUrl = (url: string) => {
  try {
    const hostname = new URL(url).hostname.replace('www.', '');
    return `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${hostname}&size=32`;
  } catch {
    return null;
  }
};

const FaviconWithFallback = ({ url }: { url: string; theme: Theme }) => {
  const [error, setError] = useState(false);
  const faviconUrl = getFaviconUrl(url);

  if (error || !faviconUrl) {
    return (
      <svg 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className="h-5 w-5"
      >
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/api/proxy-image?url=${encodeURIComponent(faviconUrl)}`}
      alt="Website icon"
      className="h-5 w-5"
      loading="eager"
      onError={() => setError(true)}
    />
  );
};

export default function LinkButton({ id, href, title, theme, emoji }: Props) {
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
      className={`flex w-full items-center gap-3 rounded-lg border-2 ${
        themeConfig.buttonBorder
      } ${themeConfig.buttonBg} px-4 py-3 font-medium ${
        themeConfig.buttonText
      } transition-transform ${themeConfig.buttonHover} ${isHovered ? 'scale-[1.02]' : ''}`}
    >
      {/* Icon or Emoji */}
      <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center">
        {href ? (
          <FaviconWithFallback url={href} theme={theme} />
        ) : (
          emoji && <span className="text-lg leading-none">{emoji}</span>
        )}
      </div>

      {/* Title */}
      <span className="flex-1 text-center">{title}</span>

      {/* Empty div to balance the icon space */}
      <div className="h-5 w-5" />
    </a>
  );
}