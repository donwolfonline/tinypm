// app/api/proxy-image/route.ts
import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const ALLOWED_DOMAINS = [
  'gstatic.com',
  't2.gstatic.com',
  't3.gstatic.com',
  'www.google.com',
  'google.com',
  'githubusercontent.com',
  'github.com',
  'avatars.githubusercontent.com',
];

const isValidUrl = (urlString: string): boolean => {
  try {
    const url = new URL(urlString);
    return ALLOWED_DOMAINS.some(domain => url.hostname.endsWith(domain));
  } catch {
    return false;
  }
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return new NextResponse('Missing URL parameter', { status: 400 });
    }

    if (!isValidUrl(imageUrl)) {
      return new NextResponse('Invalid or disallowed URL', { status: 400 });
    }

    const imageResponse = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TinyPM/1.0)',
      },
    });

    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
    }

    const contentType = imageResponse.headers.get('content-type');
    if (!contentType?.startsWith('image/')) {
      return new NextResponse('Invalid content type', { status: 400 });
    }

    const imageBuffer = await imageResponse.arrayBuffer();

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Proxy image error:', error);
    return new NextResponse(
      'Failed to proxy image',
      { status: 500 }
    );
  }
}
