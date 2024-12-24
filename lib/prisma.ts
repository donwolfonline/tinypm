import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as { prisma?: PrismaClient };

function createPrismaClient() {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

  // Add middleware for error handling and logging
  client.$use(async (params, next) => {
    try {
      const result = await next(params);
      return result;
    } catch (error) {
      console.error('Prisma Client Error:', {
        model: params.model,
        action: params.action,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  });

  // Test database connection
  client.$connect()
    .then(() => {
      console.log('Successfully connected to the database');
    })
    .catch((error) => {
      console.error('Failed to connect to the database:', error);
    });

  return client;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;