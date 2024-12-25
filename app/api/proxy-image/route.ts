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

const DEBUG_MODE = true;

const debugLog = (...args: any[]) => {
  if (DEBUG_MODE) {
    console.log('[PROXY-IMAGE DEBUG]', ...args);
  }
};

const isValidUrl = (urlString: string): boolean => {
  try {
    const url = new URL(urlString);
    debugLog('URL Validation:', {
      hostname: url.hostname,
      protocol: url.protocol,
      fullUrl: urlString
    });

    const isValid = ALLOWED_DOMAINS.some(domain => 
      url.hostname === domain || 
      url.hostname.endsWith('.' + domain) ||
      url.hostname.includes(domain)
    ) && (url.protocol === 'http:' || url.protocol === 'https:');

    debugLog('URL Validation Result:', isValid);
    return isValid;
  } catch (error) {
    debugLog('URL Validation Error:', error);
    return false;
  }
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    debugLog('Received Image URL:', imageUrl);

    if (!imageUrl) {
      debugLog('Missing URL parameter');
      return new NextResponse(JSON.stringify({ 
        error: 'Missing URL parameter',
        details: 'No URL was provided in the request' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Special handling for Google favicon URLs
    const decodedUrl = decodeURIComponent(imageUrl);
    debugLog('Decoded URL:', decodedUrl);

    // Extract the actual URL from Google's favicon service
    const googleFaviconMatch = decodedUrl.match(/url=([^&]+)/);
    const extractedUrl = googleFaviconMatch 
      ? decodeURIComponent(googleFaviconMatch[1]) 
      : decodedUrl;

    debugLog('Extracted URL:', extractedUrl);

    if (!isValidUrl(extractedUrl)) {
      debugLog('Invalid URL', extractedUrl);
      return new NextResponse(JSON.stringify({ 
        error: 'Invalid or disallowed URL',
        details: `URL ${extractedUrl} is not allowed`,
        allowedDomains: ALLOWED_DOMAINS
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const imageResponse = await fetch(extractedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TinyPM/1.0)',
        'Accept': 'image/*',
      },
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(5000)
    });

    debugLog('Fetch Response:', {
      status: imageResponse.status,
      statusText: imageResponse.statusText,
      headers: Object.fromEntries(imageResponse.headers)
    });

    if (!imageResponse.ok) {
      debugLog('Fetch Failed', {
        status: imageResponse.status,
        statusText: imageResponse.statusText
      });
      return new NextResponse(JSON.stringify({ 
        error: 'Failed to fetch image',
        details: `HTTP ${imageResponse.status}: ${imageResponse.statusText}` 
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const contentType = imageResponse.headers.get('content-type');
    debugLog('Content Type:', contentType);

    if (!contentType?.startsWith('image/')) {
      debugLog('Invalid Content Type', contentType);
      return new NextResponse(JSON.stringify({ 
        error: 'Invalid content type',
        details: `Received content type: ${contentType}` 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    debugLog('Image Buffer Length:', imageBuffer.byteLength);

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
        'X-Debug-URL': extractedUrl  // Add debug header
      },
    });
  } catch (error) {
    debugLog('Catch Block Error:', error);
    
    if (error instanceof Error) {
      return new NextResponse(JSON.stringify({ 
        error: 'Failed to proxy image',
        details: error.message,
        name: error.name,
        stack: error.stack
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
