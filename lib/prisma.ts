import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as { prisma?: PrismaClient };

// Configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
const SLOW_QUERY_THRESHOLD = 1000; // 1 second

// Helper functions
async function waitFor(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testConnection(client: PrismaClient): Promise<boolean> {
  try {
    // Log database URL pattern (without credentials)
    const dbUrl = process.env.DATABASE_URL || '';
    console.log('Database URL pattern:', dbUrl.replace(/\/\/[^@]*@/, '//<credentials>@'));
    
    // Test connection
    await client.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection test failed:', {
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      } : 'Unknown error',
    });
    return false;
  }
}

async function createPrismaClient(): Promise<PrismaClient> {
  let retries = 0;
  let lastError: Error | null = null;
  
  while (retries < MAX_RETRIES) {
    try {
      console.log(`Initializing Prisma client (attempt ${retries + 1}/${MAX_RETRIES})...`);
      
      // Create client with logging
      const client = new PrismaClient({
        log: process.env.NODE_ENV === 'development' 
          ? ['query', 'error', 'warn'] 
          : ['error'],
        errorFormat: 'pretty',
      });

      // Add middleware for error handling and logging
      client.$use(async (params, next) => {
        const startTime = Date.now();
        try {
          const result = await next(params);
          const duration = Date.now() - startTime;
          
          // Log slow queries
          if (duration > SLOW_QUERY_THRESHOLD) {
            console.warn('Slow query detected:', {
              model: params.model,
              action: params.action,
              duration: `${duration}ms`,
            });
          }
          
          return result;
        } catch (error) {
          // Log query errors
          console.error('Prisma query error:', {
            model: params.model,
            action: params.action,
            args: params.args,
            duration: `${Date.now() - startTime}ms`,
            error: error instanceof Error ? {
              name: error.name,
              message: error.message,
              stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            } : 'Unknown error',
          });
          throw error;
        }
      });

      // Test database connection
      console.log('Testing database connection...');
      const isConnected = await testConnection(client);
      if (!isConnected) {
        throw new Error('Database connection test failed');
      }

      console.log('Successfully connected to the database');
      return client;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error during Prisma initialization');
      retries++;
      
      console.error(`Failed to initialize Prisma client (attempt ${retries}/${MAX_RETRIES}):`, {
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        } : 'Unknown error',
      });
      
      if (retries === MAX_RETRIES) {
        console.error('Maximum retries reached. Could not establish database connection.');
        throw lastError;
      }
      
      // Wait before retrying with exponential backoff
      const delay = RETRY_DELAY * Math.pow(2, retries - 1);
      console.log(`Waiting ${delay}ms before retry...`);
      await waitFor(delay);
    }
  }
  
  throw lastError || new Error('Could not establish database connection');
}

// Initialize Prisma client with retries
let prismaPromise: Promise<PrismaClient>;

// Check if we're in edge runtime
const isEdgeRuntime = process.env.NEXT_RUNTIME === 'edge';

if (isEdgeRuntime) {
  // In edge runtime, create a new client for each request
  prismaPromise = createPrismaClient();
} else if (process.env.NODE_ENV === 'production') {
  // In production Node.js runtime, create a new client with retries
  prismaPromise = createPrismaClient();
} else {
  // In development Node.js runtime, use global client for hot reloading
  if (!globalForPrisma.prisma) {
    prismaPromise = createPrismaClient().then(client => {
      globalForPrisma.prisma = client;
      return client;
    });
  } else {
    prismaPromise = Promise.resolve(globalForPrisma.prisma);
  }
}

// Export a function to get the initialized client
export async function getPrismaClient(): Promise<PrismaClient> {
  return prismaPromise;
}

// For backward compatibility
export const prisma = await prismaPromise;
export default prisma;