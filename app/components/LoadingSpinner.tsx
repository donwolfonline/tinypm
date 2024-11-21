// app/components/LoadingSpinner.tsx
'use client';

import Image from 'next/image';
import { themes, getThemeStyles } from '@/lib/themes';
import type { Theme } from '@/types';
import { useEffect, useState } from 'react';

type LoadingSpinnerProps = {
  theme: Theme;
};

export default function LoadingSpinner({ theme }: LoadingSpinnerProps) {
  const [isTransitionReady, setIsTransitionReady] = useState(false);
  const themeConfig = themes[theme];

  useEffect(() => {
    // Tiny delay to ensure the initial black background is rendered
    // before starting the transition
    const timer = setTimeout(() => {
      setIsTransitionReady(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const initialStyles = {
    background: 'black', // Start with black
    transition: 'background 0.2s ease-in-out',
  };

  const finalStyles = {
    ...getThemeStyles(theme),
    transition: 'background 0.2s ease-in-out',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={isTransitionReady ? finalStyles : initialStyles}
    >
      <div
        className={`mb-8 transition-opacity duration-500 ${isTransitionReady ? 'opacity-100' : 'opacity-0'}`}
      >
        <Image
          src="/images/goose.svg"
          alt="TinyPM Logo"
          width={96}
          height={96}
          className={themeConfig.text}
        />
      </div>
      <div className="relative h-12 w-12">
        <div
          className={`absolute h-full w-full rounded-full border-4 transition-colors duration-500 ${
            isTransitionReady ? `${themeConfig.buttonBg} opacity-30` : 'border-white/30'
          }`}
        ></div>
        <div
          className={`absolute h-full w-full animate-spin rounded-full border-4 border-t-transparent transition-colors duration-500 ${
            isTransitionReady ? themeConfig.buttonBorder : 'border-white'
          }`}
        ></div>
      </div>
    </div>
  );
}
