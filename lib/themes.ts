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
    text: 'text-navy-dark',
    subtext: 'text-navy-dark/80',
    buttonBg: 'bg-white',
    buttonText: 'text-blue-600',
    buttonHover: 'hover:bg-blue-50',
    buttonBorder: 'border-navy-dark',
  },
  GREEN: {
    name: 'Forest',
    from: '#34D399',
    to: '#059669',
    text: 'text-tree-brown', // Darker nav brown
    subtext: 'text-white/80',
    buttonBg: 'bg-white',
    buttonText: 'text-green-600',
    buttonHover: 'hover:bg-green-50',
    buttonBorder: 'border-forest-brown', // Darker border brown
  },
  PURPLE: {
    name: 'Twilight',
    from: '#A855F7',
    to: '#6D28D9',
    text: 'text-black',
    subtext: 'text-black/80',
    buttonBg: 'bg-white',
    buttonText: 'text-purple-600',
    buttonHover: 'hover:bg-purple-50',
    buttonBorder: 'border-black',
  },
  DARK: {
    name: 'Midnight',
    from: '#011502',
    to: '#01200F',
    text: 'text-white',
    subtext: 'text-white/90',
    buttonBg: 'bg-gray-100',
    buttonText: 'text-gray-900',
    buttonHover: 'hover:bg-white',
    buttonBorder: 'border-midnight-teal',
  },
  DAISY: {
    name: 'Daisy Garden',
    from: '#EDEDE9',
    to: '#D6CCC2',
    text: 'text-gray-900',
    subtext: 'text-gray-800',
    buttonBg: 'bg-daisy-yellow', // Changed from amber to daisy yellow
    buttonText: 'text-black',
    buttonHover: 'hover:bg-yellow-300',
    buttonBorder: 'border-daisy-yellow',
  },
  ROSE: {
    name: 'Foundation',
    from: '#B5838D',
    to: '#6D6875',
    text: 'text-purple-700', // Matching the purple text
    subtext: 'text-purple-700/90',
    buttonBg: 'bg-white',
    buttonText: 'text-purple-700',
    buttonHover: 'hover:bg-purple-50',
    buttonBorder: 'border-black',
  },
  SLATE: {
    name: 'Slate',
    from: '#5E5B52',
    to: '#3F3D39',
    text: 'text-black', // Changed to black
    subtext: 'text-gray-200',
    buttonBg: 'bg-gray-200',
    buttonText: 'text-gray-900',
    buttonHover: 'hover:bg-white',
    buttonBorder: 'border-black', // Changed to black
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