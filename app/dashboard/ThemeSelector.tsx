'use client';

import { useState } from 'react';
import { themes } from '@/lib/themes';
import { Check } from 'lucide-react';
import type { Theme } from '@/types';

type Props = {
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => Promise<void>;
};

export default function ThemeSelector({ currentTheme, onThemeChange }: Props) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleThemeChange = async (theme: Theme) => {
    if (isUpdating) return;

    setIsUpdating(true);
    try {
      await onThemeChange(theme);
    } catch (error) {
      console.error('Error updating theme:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="w-full">
      <h3 className="mb-3 font-medium text-gray-900">Theme</h3>
      <div className="grid grid-cols-2 gap-3 px-1">
        {(Object.entries(themes) as [Theme, (typeof themes)[Theme]][]).map(([key, theme]) => (
          <button
            key={key}
            onClick={() => handleThemeChange(key)}
            disabled={isUpdating}
            className={`group relative flex h-12 w-full items-center justify-center rounded-lg transition-transform ${isUpdating ? 'opacity-50' : ''} `}
            style={{
              background: `linear-gradient(to bottom, ${theme.from}, ${theme.to})`,
            }}
          >
            <div className="flex items-center gap-1.5">
              {currentTheme === key && <Check className={`h-3.5 w-3.5 ${theme.text}`} />}
              <span className={`text-sm font-medium ${theme.text} relative`}>
                {theme.name}
                <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-current opacity-70 transition-all duration-200 group-hover:w-full" />
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
