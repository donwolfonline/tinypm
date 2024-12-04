// app/api/health/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Quick DB check
    await prisma.$queryRaw`SELECT 1`;
    
    return NextResponse.json({
      status: 'healthy',
      time: new Date().toISOString(),
      env: process.env.NODE_ENV,
      // Don't expose sensitive info in prod
      features: {
        customDomains: true,
        // Add other feature flags
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      error: process.env.NODE_ENV === 'development' ? error : 'Internal error'
    }, { status: 500 });
  }
}