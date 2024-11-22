'use client';

// components/ProxiedImage.tsx
import Image from 'next/image';
import { User } from 'lucide-react';
import { useState } from 'react';
import { CSSProperties } from 'react';

interface ProxiedImageProps {
  src?: string | null;
  alt: string;
  width: number;
  height: number;
  className?: string;
  fallbackClassName?: string;
  style?: CSSProperties;
  fallbackImage?: string;
  useIconFallback?: boolean;
}

export function ProxiedImage({
  src,
  alt,
  width,
  height,
  className = '',
  fallbackClassName = '',
  style = {},
  fallbackImage = '/images/goose.svg',
  useIconFallback = false
}: ProxiedImageProps) {
  const [error, setError] = useState(false);

  const imageUrl = src?.startsWith('/') 
    ? src 
    : src 
      ? `/api/proxy-image?url=${encodeURIComponent(src)}` 
      : fallbackImage;

  if (!src || error) {
    if (useIconFallback) {
      return (
        <div 
          className={`flex items-center justify-center bg-gray-100 ${fallbackClassName}`}
          style={style}
        >
          <User className="h-1/2 w-1/2 text-gray-400" />
        </div>
      );
    }
    
    return (
      <Image
        src={fallbackImage}
        alt={alt}
        width={width}
        height={height}
        className={className || fallbackClassName}
        style={style}
      />
    );
  }

  return (
    <Image
      src={imageUrl}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={style}
      onError={() => setError(true)}
    />
  );
}