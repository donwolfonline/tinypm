// app/api/health/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET() {
  try {
    console.log('Health check started');
    
    // Log database URL pattern (without credentials)
    const dbUrl = process.env.DATABASE_URL || '';
    console.log('Database URL pattern:', dbUrl.replace(/\/\/[^@]*@/, '//<credentials>@'));

    // Quick DB check
    console.log('Testing database connection...');
    const startTime = Date.now();
    const result = await prisma.$queryRaw`SELECT current_timestamp, current_database(), version()`;
    const duration = Date.now() - startTime;

    console.log('Database connection successful:', {
      duration: `${duration}ms`,
      result,
    });
    
    // Check if we can query the User table
    console.log('Testing User table access...');
    const userCount = await prisma.user.count();
    console.log('User table accessible, count:', userCount);
    
    return NextResponse.json({
      status: 'healthy',
      time: new Date().toISOString(),
      env: process.env.NODE_ENV,
      database: {
        connected: true,
        responseTime: duration,
        prismaVersion: Prisma.prismaVersion.client,
        nodeVersion: process.version,
        tables: {
          user: {
            accessible: true,
            count: userCount,
          },
        },
      },
      features: {
        customDomains: true,
        auth: true,
        subscription: true,
      },
    });
  } catch (error) {
    console.error('Health check failed:', {
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      } : 'Unknown error',
      prismaVersion: Prisma.prismaVersion.client,
      nodeVersion: process.version,
    });

    // Check if it's a connection error
    const isConnectionError = error instanceof Error && 
      (error.message.includes('connect ECONNREFUSED') || 
       error.message.includes('failed to connect'));

    return NextResponse.json({
      status: 'unhealthy',
      time: new Date().toISOString(),
      env: process.env.NODE_ENV,
      database: {
        connected: false,
        error: isConnectionError ? 'Connection failed' : 'Query failed',
        details: process.env.NODE_ENV === 'development' ? 
          error instanceof Error ? error.message : 'Unknown error' : 
          'Internal error',
      },
      features: {
        customDomains: true,
        auth: true,
        subscription: true,
      },
    }, { status: 503 });
  }
}