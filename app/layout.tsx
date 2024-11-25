// app/layout.tsx
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { Providers } from './providers';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});

const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: {
    default: 'TinyPM',
    template: '%s | TinyPM',
  },
  description: 'One link to share all your socials.',
  metadataBase: new URL('https://tiny.pm'),
  openGraph: {
    title: 'TinyPM',
    description: 'One link to share all your socials.',
    url: 'https://tiny.pm',
    siteName: 'TinyPM',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://tiny.pm/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'TinyPM Open Graph Image',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TinyPM',
    description: 'One link to share all your socials.',
    images: ['https://tiny.pm/images/twitter-image.jpg'],
  },
  icons: {
    icon: '/images/favicon.ico',
    shortcut: '/images/favicon-16x16.png',
    apple: '/images/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        {/* Additional iOS-specific meta tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-touch-fullscreen" content="yes" />
        <link rel="icon" href="/images/favicon.ico" sizes="any" />
        <link rel="icon" href="/images/goose.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/images/apple-touch-icon.png" />
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#FFCC00" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#000000" />
      </head>
      <body 
        className={`${geistSans.variable} ${geistMono.variable} min-h-full touch-pan-x touch-pan-y`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}