import React, { useState } from 'react';
import { GripVertical, X } from 'lucide-react';
import type { Link } from '@/types';
import {
  DraggableProvidedDragHandleProps,
  DraggableProvidedDraggableProps,
} from '@hello-pangea/dnd';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/popover';

interface LinkItemProps {
  link: Link;
  dragHandleProps: DraggableProvidedDragHandleProps | null | undefined;
  draggableProps?: DraggableProvidedDraggableProps;
  isDragging: boolean;
  onUpdate: (id: string, field: keyof Link, value: string | boolean) => void;
  onDelete: (id: string) => void;
  forwardedRef: React.Ref<HTMLDivElement>;
}

// Mapping of domains to Simple Icons slugs

//NOTE I NEED TO MAKE THESE WILDCARDS
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
  'amzn.com': 'amazon',
  'amazon.com': 'amazon',
};

const POPULAR_EMOJIS = [
  '🌟',
  '❤️',
  '🎮',
  '📚',
  '🎵',
  '🎨',
  '📷',
  '💼',
  '🎯',
  '✨',
  '📱',
  '💡',
  '🔥',
  '🎬',
  '🌈',
  '💫',
  '📝',
  '🎤',
  '🚀',
  '💻',
];

export function LinkItem({
  link,
  dragHandleProps,
  draggableProps,
  isDragging,
  onUpdate,
  onDelete,
  forwardedRef,
}: LinkItemProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Get social media icon if URL matches
  const getSocialIcon = (url: string) => {
    try {
      const hostname = new URL(url).hostname.replace('www.', '');
      const iconSlug = SOCIAL_ICON_MAPPING[hostname];
      return iconSlug ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/api/proxy-image?url=${encodeURIComponent(
            `https://cdn.simpleicons.org/${iconSlug}`
          )}`}
          alt={hostname}
          className="h-6 w-6"
          // Disable lazy loading since these icons are above the fold
          loading="eager"
        />
      ) : null;
    } catch {
      return null;
    }
  };

  const socialIcon = link.url ? getSocialIcon(link.url) : null;
  const emoji = link.emoji || '🔗'; // Default emoji if none is set

  const handleEmojiSelect = (selectedEmoji: string) => {
    onUpdate(link.id, 'emoji', selectedEmoji);
    setShowEmojiPicker(false);
  };

  return (
    <div
      ref={forwardedRef}
      {...draggableProps}
      className={`flex items-center gap-3 rounded-lg border border-black/10 bg-white p-4 shadow-sm ${
        isDragging ? 'ring-2 ring-black ring-offset-2' : ''
      }`}
    >
      <div {...dragHandleProps} className="cursor-grab">
        <GripVertical className="h-5 w-5 text-gray-400" />
      </div>

      {/* Icon/Emoji Section */}
      <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
        <PopoverTrigger asChild>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-gray-100"
            onClick={() => !socialIcon && setShowEmojiPicker(true)}
          >
            {socialIcon || <span className="text-lg">{emoji}</span>}
          </button>
        </PopoverTrigger>
        {!socialIcon && (
          <PopoverContent className="w-64 p-2">
            <div className="grid grid-cols-5 gap-2">
              {POPULAR_EMOJIS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => handleEmojiSelect(emoji)}
                  className="flex h-8 w-8 items-center justify-center rounded hover:bg-gray-100"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </PopoverContent>
        )}
      </Popover>

      <div className="flex flex-1 flex-col gap-2">
        <input
          type="text"
          value={link.title}
          onChange={e => onUpdate(link.id, 'title', e.target.value)}
          className="w-full rounded border-none bg-transparent px-2 py-1 text-sm focus:ring-2 focus:ring-black"
          placeholder="Link Title"
        />
        <input
          type="url"
          value={link.url}
          onChange={e => onUpdate(link.id, 'url', e.target.value)}
          className="w-full rounded border-none bg-transparent px-2 py-1 text-sm text-gray-500 focus:ring-2 focus:ring-black"
          placeholder="https://"
        />
      </div>

      <button
        onClick={() => onDelete(link.id)}
        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
      >
        <X className="h-4 w-4" />
      </button>

      <label className="relative inline-flex cursor-pointer items-center">
        <input
          type="checkbox"
          checked={link.enabled}
          className="peer sr-only"
          onChange={() => onUpdate(link.id, 'enabled', !link.enabled)}
        />
        <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-black peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
      </label>
    </div>
  );
}

export default LinkItem;
