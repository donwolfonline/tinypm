// components/ContentItems/LinkItem.tsx
import React, { useState } from 'react';
import { GripVertical, X } from 'lucide-react';
import {
  DraggableProvidedDragHandleProps,
  DraggableProvidedDraggableProps,
} from '@hello-pangea/dnd';
import type { Link } from '@/types';
import { EmojiPicker } from '../EmojiPicker';
import { normalizeUrl } from '@/lib/url-utils';

interface LinkItemProps {
  link: Link;
  dragHandleProps: DraggableProvidedDragHandleProps | null | undefined;
  draggableProps: DraggableProvidedDraggableProps;
  isDragging: boolean;
  onUpdate: (id: string, field: keyof Link, value: string | boolean) => void;
  onDelete: (id: string) => void;
  forwardedRef: React.Ref<HTMLDivElement>;
}

// Helper function to get favicon URL
const getFaviconUrl = (url: string) => {
  try {
    const hostname = new URL(url).hostname.replace('www.', '');
    return `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${hostname}&size=32`;
  } catch {
    return null;
  }
};

const FaviconWithFallback = ({ url }: { url: string }) => {
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
        className="h-6 w-6 text-gray-400"
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
      className="h-6 w-6"
      loading="eager"
      onError={() => setError(true)}
    />
  );
};

export function LinkItem({
  link,
  dragHandleProps,
  isDragging,
  draggableProps,
  onUpdate,
  onDelete,
  forwardedRef,
}: LinkItemProps) {
  const handleUrlChange = (newUrl: string) => {
    onUpdate(link.id, 'url', normalizeUrl(newUrl));
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

      <EmojiPicker
        currentEmoji={link.emoji}
        onSelect={emoji => onUpdate(link.id, 'emoji', emoji)}
        disabled={!!link.url}
        icon={link.url ? <FaviconWithFallback url={link.url} /> : null}
      />

      <div className="flex flex-1 flex-col gap-2">
        <input
          type="text"
          value={link.title}
          onChange={e => onUpdate(link.id, 'title', e.target.value)}
          className="w-full rounded border-none bg-transparent px-2 py-1 text-sm focus:ring-2 focus:ring-black"
          placeholder="Link Title"
          style={{ 
            fontSize: '16px',  // Base size to prevent zoom
            transform: 'scale(0.875)',  // Scale down visually
            transformOrigin: 'left center' 
          }}
        />
        <input
          type="url"
          value={link.url}
          onChange={e => handleUrlChange(e.target.value)}
          onBlur={e => handleUrlChange(e.target.value)}
          className="w-full rounded border-none bg-transparent px-2 py-1 text-sm text-gray-500 focus:ring-2 focus:ring-black"
          placeholder="https://"
          style={{ 
            fontSize: '16px',  // Base size to prevent zoom
            transform: 'scale(0.875)',  // Scale down visually
            transformOrigin: 'left center' 
          }}
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