// app/components/LinkButton.tsx
'use client';

import { useState } from 'react';

interface LinkButtonProps {
  href: string;
  title: string;
  id: string;
}

export default function LinkButton({ href, title, id }: LinkButtonProps) {
  // const [isClicked, setIsClicked] = useState(false);

  // const handleClick = async () => {
  //   try {
  //     setIsClicked(true);
  //     await fetch(`/api/links/${id}/click`, { method: 'POST' });
  //   } catch (error) {
  //     console.error('Error updating click count:', error);
  //   }
  // };

  const handleClick = async () => {
    try {
      await fetch(`/api/links/${id}/click`, { method: 'POST' });
    } catch (error) {
      console.error('Error updating click count:', error);
    }
  };

  // Add URL processing
  const processUrl = (url: string) => {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    return url;
  };

  return (
    <a
      href={processUrl(href)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="block rounded-lg border-2 border-black bg-white p-4 text-center text-lg font-medium shadow-md transition-transform hover:-translate-y-0.5 hover:shadow-lg"
    >
      {title}
    </a>
  );
}
