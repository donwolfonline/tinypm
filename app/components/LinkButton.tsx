'use client';

import { useState } from 'react';
import { themes } from '@/lib/themes';
import type { Theme } from '@/types';

// Mapping of domains to Simple Icons slugs
const SOCIAL_ICON_MAPPING: { [key: string]: string } = {
  'github.com': 'github',
  'twitter.com': 'x',
  'x.com': 'x',
  'instagram.com': 'instagram',
  'facebook.com': 'facebook',
  'linkedin.com': 'linkedin',
  'youtube.com': 'youtube',
  'twitch.tv': 'twitch',
  'tiktok.com': 'tiktok',
  'discord.com': 'discord',
  'discord.gg': 'discord',
  'spotify.com': 'spotify',
  'medium.com': 'medium',
  'dev.to': 'devdotto',
  'producthunt.com': 'producthunt',
  'dribbble.com': 'dribbble',
  'behance.net': 'behance',
  'steamcommunity.com': 'steam',
  'bsky.app': 'bluesky',
  'bsky.social': 'bluesky',
};

type Props = {
  id: string;
  href: string;
  title: string;
  theme: Theme;
  emoji?: string | null;
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

  const getSocialIcon = (url: string) => {
    try {
      const hostname = new URL(url).hostname.replace('www.', '');
      const iconSlug = SOCIAL_ICON_MAPPING[hostname];
      return iconSlug ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/api/proxy-image?url=${encodeURIComponent(
            `https://cdn.simpleicons.org/${iconSlug}/${
              themeConfig.buttonBg.includes('bg-black') ? 'ffffff' : '000000'
            }`
          )}`}
          alt={hostname}
          className="h-5 w-5"
          loading="eager"
        />
      ) : null;
    } catch {
      return null;
    }
  };

  const socialIcon = getSocialIcon(href);

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
        {socialIcon || (emoji && <span className="text-lg leading-none">{emoji}</span>)}
      </div>

      {/* Title */}
      <span className="flex-1 text-center">{title}</span>

      {/* Empty div to balance the icon space */}
      <div className="h-5 w-5" />
    </a>
  );
}
