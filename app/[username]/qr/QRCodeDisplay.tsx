// app/[username]/qr/QRCodeDisplay.tsx
'use client';

import { QRCodeSVG } from 'qrcode.react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Share2 } from 'lucide-react';
import { ProxiedImage } from '@/app/components/ProxiedImage';
import { themes } from '@/lib/themes';

interface QRCodeDisplayProps {
  user: {
    name: string | null;
    image: string | null;
    username: string;
    theme?: keyof typeof themes;
  };
}

export function QRCodeDisplay({ user }: QRCodeDisplayProps) {
  const userTheme = user.theme || 'YELLOW';
  const themeConfig = themes[userTheme];
  const profileUrl = `https://tiny.pm/${user.username}`;

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href={`/${user.username}`}
        className={`mb-8 inline-flex items-center gap-2 text-sm ${themeConfig.subtext} hover:${themeConfig.text}`}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Profile
      </Link>

      <div className={`rounded-lg border-2 ${themeConfig.buttonBorder} bg-white p-8`}>
        {/* Profile Info */}
        <div className="mb-8 text-center">
          {user.image ? (
            <ProxiedImage
              src={user.image}
              alt={user.name || ''}
              width={80}
              height={80}
              className="mx-auto mb-4 rounded-full border-2 shadow-lg"
              style={{ borderColor: themeConfig.buttonBg === 'bg-white' ? 'white' : 'black' }}
            />
          ) : (
            <div
              className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border-2 text-2xl font-bold shadow-lg ${themeConfig.buttonBg} ${themeConfig.buttonText} ${themeConfig.buttonBorder}`}
            >
              {user.name?.[0]?.toUpperCase() || '?'}
            </div>
          )}
          <h1 className={`mb-2 text-2xl font-bold ${themeConfig.text}`}>{user.name}</h1>
          <p className={`text-sm ${themeConfig.subtext}`}>{profileUrl}</p>
        </div>

        {/* QR Code */}
        <div className="mb-8 flex justify-center">
          <div className={`rounded-lg border-2 ${themeConfig.buttonBorder} p-4`}>
            <QRCodeSVG
              value={profileUrl}
              size={200}
              level="H"
              bgColor="transparent"
              fgColor={themeConfig.buttonBg === 'bg-white' ? 'white' : 'black'}
            />
          </div>
        </div>

        {/* Share Button */}
        <div className="text-center">
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: `${user.name}'s Profile QR Code`,
                  text: `Scan to view ${user.name}'s profile on tiny.pm`,
                  url: window.location.href,
                });
              }
            }}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 ${themeConfig.buttonBg} ${themeConfig.buttonText} ${themeConfig.buttonBorder}`}
          >
            <Share2 className="h-4 w-4" />
            Share QR Code
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center">
        <Link
          href="/"
          className={`inline-flex items-center gap-2 text-sm ${themeConfig.subtext} hover:${themeConfig.text}`}
        >
          <Image
            src="/images/goose.svg"
            alt="TinyPM"
            width={16}
            height={16}
            className="opacity-60"
          />
          tiny.pm
        </Link>
      </div>
    </div>
  );
}