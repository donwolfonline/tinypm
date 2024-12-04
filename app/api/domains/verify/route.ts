// app/api/domains/verify/route.ts
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const host = request.headers.get('host');
        if (!host) {
            return new Response(null, { status: 400 });
        }

        // Always allow development domains
        if (process.env.NODE_ENV === 'development' && 
            (host.includes('localhost') || 
             host.includes('127.0.0.1') || 
             host.endsWith('.tiny.pm:3131'))) {
            return new Response(null, { status: 200 });
        }

        // Strip port number if present (common in development)
        const cleanHost = host.split(':')[0];

        // Allow the main domain and its subdomains
        if (cleanHost === 'tiny.pm' || cleanHost.endsWith('.tiny.pm')) {
            return new Response(null, { status: 200 });
        }

        // Check custom domains
        const domain = await prisma.customDomain.findFirst({
            where: {
                domain: cleanHost,
                status: 'ACTIVE',
            },
        });

        // Log verification attempts in development
        if (process.env.NODE_ENV === 'development') {
            console.log(`Domain verification attempt for ${cleanHost}: ${domain ? 'Found' : 'Not Found'}`);
        }

        return new Response(null, { 
            status: domain ? 200 : 404 
        });
    } catch (error) {
        console.error('Domain verification error:', error);
        return new Response(null, { status: 500 });
    }
}