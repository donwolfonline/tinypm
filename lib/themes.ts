// lib/themes.ts
import type { Theme } from '@/types';

export const themes = {
  YELLOW: {
    name: 'Sunny',
    from: '#FFCC00',
    to: '#FFA500',
    text: 'text-black',
    subtext: 'text-black/80',
    buttonBg: 'bg-black',
    buttonText: 'text-[#FFCC00]',
    buttonHover: 'hover:bg-gray-900',
    buttonBorder: 'border-black',
  },
  BLUE: {
    name: 'Ocean',
    from: '#60A5FA',
    to: '#2563EB',
    text: 'text-white',
    subtext: 'text-white/80',
    buttonBg: 'bg-white',
    buttonText: 'text-blue-600',
    buttonHover: 'hover:bg-blue-50',
    buttonBorder: 'border-white',
  },
  GREEN: {
    name: 'Forest',
    from: '#34D399',
    to: '#059669',
    text: 'text-white',
    subtext: 'text-white/80',
    buttonBg: 'bg-white',
    buttonText: 'text-green-600',
    buttonHover: 'hover:bg-green-50',
    buttonBorder: 'border-white',
  },
  PURPLE: {
    name: 'Twilight',
    from: '#A855F7',
    to: '#6D28D9',
    text: 'text-white',
    subtext: 'text-white/80',
    buttonBg: 'bg-white',
    buttonText: 'text-purple-600',
    buttonHover: 'hover:bg-purple-50',
    buttonBorder: 'border-white',
  },
} as const;

export type ThemeConfig = (typeof themes)[Theme];

export function getThemeStyles(theme: Theme, variant: 'gradient' | 'solid' = 'gradient') {
  const config = themes[theme];
  return {
    background:
      variant === 'gradient'
        ? `linear-gradient(to bottom, ${config.from}, ${config.to})`
        : config.from,
  };
}
