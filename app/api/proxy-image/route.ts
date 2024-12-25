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
    // More flexible domain matching
    return ALLOWED_DOMAINS.some(domain => 
      url.hostname === domain || url.hostname.endsWith('.' + domain)
    ) && (url.protocol === 'http:' || url.protocol === 'https:');
  } catch {
    return false;
  }
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return new NextResponse(JSON.stringify({ 
        error: 'Missing URL parameter',
        details: 'No URL was provided in the request' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Decode the URL to handle encoded characters
    const decodedUrl = decodeURIComponent(imageUrl);

    if (!isValidUrl(decodedUrl)) {
      return new NextResponse(JSON.stringify({ 
        error: 'Invalid or disallowed URL',
        details: `URL ${decodedUrl} is not allowed`,
        allowedDomains: ALLOWED_DOMAINS
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const imageResponse = await fetch(decodedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TinyPM/1.0)',
        'Accept': 'image/*',
      },
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(5000)
    });

    if (!imageResponse.ok) {
      return new NextResponse(JSON.stringify({ 
        error: 'Failed to fetch image',
        details: `HTTP ${imageResponse.status}: ${imageResponse.statusText}` 
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const contentType = imageResponse.headers.get('content-type');
    if (!contentType?.startsWith('image/')) {
      return new NextResponse(JSON.stringify({ 
        error: 'Invalid content type',
        details: `Received content type: ${contentType}` 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const imageBuffer = await imageResponse.arrayBuffer();

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('Proxy image error:', error);
    
    // More detailed error logging
    if (error instanceof Error) {
      return new NextResponse(JSON.stringify({ 
        error: 'Failed to proxy image',
        details: error.message,
        name: error.name
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new NextResponse(JSON.stringify({ 
      error: 'Unexpected error occurred',
      details: 'An unknown error prevented image proxying'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
