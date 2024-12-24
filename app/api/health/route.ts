// app/api/health/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

async function checkDatabase() {
  try {
    const startTime = Date.now();
    const result = await prisma.$queryRaw`SELECT 1 as connected`;
    const duration = Date.now() - startTime;
    
    return {
      connected: true,
      responseTime: duration,
      error: null
    };
  } catch (error) {
    console.error('Database check failed:', error);
    return {
      connected: false,
      responseTime: null,
      error: error instanceof Error ? error.message : 'Unknown database error'
    };
  }
}

async function checkUserTable() {
  try {
    const count = await prisma.user.count();
    return {
      accessible: true,
      count,
      error: null
    };
  } catch (error) {
    console.error('User table check failed:', error);
    return {
      accessible: false,
      count: null,
      error: error instanceof Error ? error.message : 'Unknown table error'
    };
  }
}

export async function GET() {
  console.log('Health check started');

  // Check database connection
  const dbStatus = await checkDatabase();
  console.log('Database status:', dbStatus);

  // Check User table only if database is connected
  const userTableStatus = dbStatus.connected ? await checkUserTable() : null;
  console.log('User table status:', userTableStatus);

  // Basic system info that's always available
  const systemInfo = {
    time: new Date().toISOString(),
    env: process.env.NODE_ENV,
    prismaVersion: Prisma.prismaVersion.client,
    nodeVersion: process.version
  };

  // Construct response
  const response = {
    status: dbStatus.connected ? 'healthy' : 'degraded',
    ...systemInfo,
    database: {
      ...dbStatus,
      tables: userTableStatus ? {
        user: userTableStatus
      } : null
    },
    features: {
      customDomains: true,
      auth: true,
      subscription: true
    }
  };

  // Log full response in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Health check response:', JSON.stringify(response, null, 2));
  }

  return NextResponse.json(response, {
    status: dbStatus.connected ? 200 : 503
  });
}