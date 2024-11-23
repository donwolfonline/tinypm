import { useState, useEffect } from 'react';
import Image from 'next/image';
import { themes, getThemeStyles } from '@/lib/themes';
import type { Theme } from '@/types';

const GOOSE_MESSAGES = [
  "Honk if you're loading...",
  "Gathering the geese...",
  "Flocking fantastic!",
  "Getting our ducks... err, geese in a row",
  "Honking intensifies",
  "Migration in progress...",
  "Goose.exe is loading",
  "Peace was never an option",
  "waddle waddle waddle...",
  "HÖŃK HÖŃK",
  "Deploying tactical honks...",
  "Charging goose batteries...",
  "Ruffling feathers...",
  "Calculating optimal honk...",
  "Loading bread crumbs...",
  "Syncing honk database...",
  "Initiating chase sequence...",
  "Activating goose mode...",
  "Preparing for takeoff...",
  "Untying shoelaces...",
  "Stealing picnic baskets...",
  "*happy goose noises*",
  "Goose loading goose...",
  "Honk in progress...",
  "Loading pond simulator...",
  "Engaging stealth waddle...",
  "Running goose.js...",
  "Causing mild chaos...",
  "Finding golden eggs...",
  "Honk around and find out..."
];

type LoadingSpinnerProps = {
  theme: Theme;
};

export default function LoadingSpinner({ theme }: LoadingSpinnerProps) {
  const [isTransitionReady, setIsTransitionReady] = useState(false);
  const [message, setMessage] = useState('');
  const themeConfig = themes[theme];

  useEffect(() => {
    // Set random message on mount
    const randomIndex = Math.floor(Math.random() * GOOSE_MESSAGES.length);
    setMessage(GOOSE_MESSAGES[randomIndex]);

    const timer = setTimeout(() => {
      setIsTransitionReady(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const initialStyles = {
    background: 'black',
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
      {/* Custom Loading Animation */}
      <div className="relative h-24 w-24">
        <div className="absolute inset-0 flex items-center justify-center">
          <Image
            src="/images/loading_goose.gif"
            alt="Loading..."
            width={128}
            height={128}
            className={`transition-opacity duration-500 ${
              isTransitionReady ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </div>
      </div>

      {/* Loading Message */}
      <div 
        className={`mt-8 text-center transition-all duration-500 ${
          isTransitionReady ? 'opacity-100 transform-none' : 'opacity-0 translate-y-4'
        }`}
      >
        <h1 className={`text-2xl font-bold ${themeConfig.text} mb-2`}>
          {message}
        </h1>
      </div>
    </div>
  );
}