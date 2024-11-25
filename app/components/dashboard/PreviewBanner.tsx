// components/dashboard/PreviewBanner.tsx
import Link from 'next/link';
import { ExternalLink, QrCode, Copy } from 'lucide-react';
import { Theme } from '@/types';
import { themes } from '@/lib/themes';
import { useState } from 'react';

interface PreviewBannerProps {
  username?: string;
  theme: Theme;
}

export function PreviewBanner({ username, theme }: PreviewBannerProps) {
  const [showCopied, setShowCopied] = useState(false);
  const themeConfig = themes[theme];
  const fullUrl = `tiny.pm/${username}`;

  const handleCopy = async () => {
    try {
      // First try the modern clipboard API
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(fullUrl);
      } else {
        // Fallback to the older execCommand method
        const textArea = document.createElement('textarea');
        textArea.value = fullUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          document.execCommand('copy');
        } catch (err) {
          console.error('Failed to copy text:', err);
        }
        
        document.body.removeChild(textArea);
      }

      // Show the copied message
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };


  return (
    <div 
      className={`mb-8 rounded-lg bg-white/80 p-4 backdrop-blur-sm shadow-sm ${themeConfig.buttonBorder}`}
    >
      <div className="flex flex-col gap-4">
        {/* URL Display and Copy Button */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="text-sm font-medium whitespace-nowrap flex items-center gap-1">
            🔥 <span className="hidden sm:inline">Your page is live at:</span>
          </span>
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <code className="flex-1 min-w-0 truncate rounded bg-black/5 px-2 py-1 text-sm font-mono">
              {fullUrl}
            </code>
            <button
              onClick={handleCopy}
              className="shrink-0 rounded-md p-1 hover:bg-black/5 transition-colors relative group"
              aria-label="Copy URL"
            >
              <Copy className="h-4 w-4 text-gray-500" />
              {/* Tooltip */}
              <span className={`absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-black text-white text-xs whitespace-nowrap transition-opacity ${
                showCopied ? 'opacity-100' : 'opacity-0'
              }`}>
                Copied!
              </span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <Link
            href={`/${username}`}
            className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
              themeConfig.buttonBg
            } ${themeConfig.buttonText} ${themeConfig.buttonHover} hover:scale-[1.02]`}
          >
            <ExternalLink className="h-4 w-4" />
            View Page
          </Link>
          
          <Link
            href={`/${username}/qr`}
            className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 border-2 ${
              themeConfig.buttonBorder
            } hover:bg-black/5 hover:scale-[1.02]`}
          >
            <QrCode className="h-4 w-4" />
            QR Code
          </Link>
        </div>
      </div>
    </div>
  );
}