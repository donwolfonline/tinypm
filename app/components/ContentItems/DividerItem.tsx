// components/ContentItems/DividerItem.tsx
import React from 'react';
import { GripVertical, X } from 'lucide-react';
import type { DividerContent } from '@/types';
import { DraggableProvidedDragHandleProps, DraggableProvidedDraggableProps } from '@hello-pangea/dnd';

interface DividerItemProps {
  content: DividerContent;
  onDelete: (id: string) => void;
  onUpdate: (id: string, field: keyof DividerContent, value: string | boolean) => void;
  dragHandleProps: DraggableProvidedDragHandleProps | null | undefined;
  draggableProps: DraggableProvidedDraggableProps;
  isDragging: boolean;
  forwardedRef: React.Ref<HTMLDivElement>;
}

export function DividerItem({ 
  content, 
  onUpdate, 
  onDelete, 
  dragHandleProps, 
  draggableProps,
  isDragging,
  forwardedRef 
}: DividerItemProps) {
  return (
    <div
      ref={forwardedRef}
      {...draggableProps}
      className={`flex items-center gap-3 rounded-lg border border-black/10 bg-white p-4 shadow-sm ${
        isDragging ? 'ring-2 ring-black ring-offset-2' : ''
      }`}
    >
      <div {...dragHandleProps}>
        <GripVertical className="h-5 w-5 text-gray-400 cursor-grab" />
      </div>

      <div className="flex-1 border-t-2 border-dashed border-gray-200" />

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