// components/EmojiPicker.tsx
import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/popover';

const POPULAR_EMOJIS = [
  '🌟', '❤️', '🎮', '📚', '🎵', '🎨', '📷', '💼', '🎯', '✨',
  '📱', '💡', '🔥', '🎬', '🌈', '💫', '📝', '🎤', '🚀', '💻',
];

interface EmojiPickerProps {
  currentEmoji: string | null | undefined;
  onSelect: (emoji: string) => void;
  disabled?: boolean;
  icon?: React.ReactNode | null;
}

export function EmojiPicker({ currentEmoji, onSelect, disabled = false, icon = null }: EmojiPickerProps) {
  if (disabled && icon) {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-md">
        {icon}
      </div>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button 
          className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-gray-100"
          disabled={disabled}
        >
          <span className="text-lg">{currentEmoji || '🔗'}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2">
        <div className="grid grid-cols-5 gap-2">
          {POPULAR_EMOJIS.map(emoji => (
            <button
              key={emoji}
              onClick={() => onSelect(emoji)}
              className="flex h-8 w-8 items-center justify-center rounded hover:bg-gray-100"
            >
              {emoji}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}