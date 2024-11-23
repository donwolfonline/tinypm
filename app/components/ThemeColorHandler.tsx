import { useEffect } from 'react';
import { themes } from '@/lib/themes';
import type { Theme } from '@/types';

export function ThemeColorHandler({ theme }: { theme: Theme }) {
  useEffect(() => {
    // Get the theme configuration
    const themeConfig = themes[theme];
    
    // Find existing theme-color meta tags
    const existingThemeColorTags = document.querySelectorAll('meta[name="theme-color"]');
    existingThemeColorTags.forEach(tag => tag.remove());
    
    // Create and insert new meta tags
    const metaTag = document.createElement('meta');
    metaTag.name = 'theme-color';
    metaTag.content = themeConfig.themeColor || '#FFCC00'; // Use theme color or fallback
    document.head.appendChild(metaTag);
    
    return () => {
      // Cleanup when component unmounts
      metaTag.remove();
    };
  }, [theme]);

  return null;
}