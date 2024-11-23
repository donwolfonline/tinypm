// components/ContentItems/TitleItem.tsx
import React from 'react';
import { GripVertical, X } from 'lucide-react';
import { DraggableProvidedDragHandleProps, DraggableProvidedDraggableProps } from '@hello-pangea/dnd';
import type { TitleContent } from '@/types';
import { EmojiPicker } from '../EmojiPicker';

interface TitleItemProps {
  content: TitleContent;
  dragHandleProps: DraggableProvidedDragHandleProps | null | undefined;
  draggableProps: DraggableProvidedDraggableProps;
  isDragging: boolean;
  onUpdate: (id: string, field: keyof TitleContent, value: string | boolean) => void;
  onDelete: (id: string) => void;
  forwardedRef: React.Ref<HTMLDivElement>;
}

export function TitleItem({
  content,
  dragHandleProps,
  draggableProps,
  isDragging,
  onUpdate,
  onDelete,
  forwardedRef,
}: TitleItemProps) {
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
        currentEmoji={content.emoji}
        onSelect={(emoji) => onUpdate(content.id, 'emoji', emoji)}
      />

      <input
        type="text"
        value={content.title}
        onChange={(e) => onUpdate(content.id, 'title', e.target.value)}
        className="w-full rounded border-none bg-transparent px-2 py-1 text-lg font-semibold focus:ring-2 focus:ring-black"
        placeholder="Section Title"
      />

      <button
        onClick={() => onDelete(content.id)}
        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
      >
        <X className="h-4 w-4" />
      </button>

      <label className="relative inline-flex cursor-pointer items-center">
        <input
          type="checkbox"
          checked={content.enabled}
          className="peer sr-only"
          onChange={() => onUpdate(content.id, 'enabled', !content.enabled)}
        />
        <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-black peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
      </label>
    </div>
  );
}