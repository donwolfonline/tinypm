// components/ContentItems/index.tsx
import { DraggableProvidedDragHandleProps, DraggableProvidedDraggableProps } from '@hello-pangea/dnd';
import { Content, Link, TitleContent, TextContent, DividerContent } from '@/types';
import { LinkItem } from './LinkItem';
import { TitleItem } from './TitleItem';
import { TextItem } from './TextItem';
import { DividerItem } from './DividerItem';

interface ContentItemProps {
  content: Content;
  dragHandleProps: DraggableProvidedDragHandleProps | null | undefined;
  draggableProps: DraggableProvidedDraggableProps;
  isDragging: boolean;
  onUpdate: (id: string, field: keyof Content, value: string | boolean | number) => void;
  onDelete: (id: string) => void;
  forwardedRef: React.Ref<HTMLDivElement>;
}

export function ContentItem(props: ContentItemProps) {
  const { content, dragHandleProps, draggableProps, isDragging, onUpdate, onDelete, forwardedRef } = props;

  switch (content.type) {
    case 'LINK':
      return (
        <LinkItem
          link={content as Link}
          dragHandleProps={dragHandleProps}
          draggableProps={draggableProps}
          isDragging={isDragging}
          onUpdate={onUpdate as (id: string, field: keyof Link, value: string | boolean) => void}
          onDelete={onDelete}
          forwardedRef={forwardedRef}
        />
      );
    case 'TITLE':
      return (
        <TitleItem
          content={content as TitleContent}
          dragHandleProps={dragHandleProps}
          draggableProps={draggableProps}
          isDragging={isDragging}
          onUpdate={onUpdate as (id: string, field: keyof TitleContent, value: string | boolean) => void}
          onDelete={onDelete}
          forwardedRef={forwardedRef}
        />
      );
    case 'TEXT':
      return (
        <TextItem
          content={content as TextContent}
          dragHandleProps={dragHandleProps}
          draggableProps={draggableProps}
          isDragging={isDragging}
          onUpdate={onUpdate as (id: string, field: keyof TextContent, value: string | boolean) => void}
          onDelete={onDelete}
          forwardedRef={forwardedRef}
        />
      );
    case 'DIVIDER':
      return (
        <DividerItem
          content={content as DividerContent}
          dragHandleProps={dragHandleProps}
          draggableProps={draggableProps}
          isDragging={isDragging}
          onUpdate={onUpdate as (id: string, field: keyof DividerContent, value: string | boolean) => void}
          onDelete={onDelete}
          forwardedRef={forwardedRef}
        />
      );
    default:
      return null;
  }
}