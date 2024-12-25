import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as { prisma?: PrismaClient };

// Configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
const SLOW_QUERY_THRESHOLD = 1000; // 1 second
const CONNECTION_TIMEOUT = 5000; // 5 seconds

// Helper functions
async function waitFor(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testConnection(client: PrismaClient): Promise<boolean> {
  try {
    // Set a timeout for the connection test
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Connection test timed out')), CONNECTION_TIMEOUT);
    });

    // Test connection with timeout
    const connectionPromise = client.$queryRaw`SELECT 1`;
    await Promise.race([connectionPromise, timeoutPromise]);
    
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

      // Add middleware for query timing
      client.$use(async (params, next) => {
        const start = Date.now();
        const result = await next(params);
        const duration = Date.now() - start;
        
        if (duration > SLOW_QUERY_THRESHOLD) {
          console.warn('Slow query detected:', {
            model: params.model,
            action: params.action,
            duration: `${duration}ms`,
          });
        }
        
        return result;
      });

      // Test the connection
      const isConnected = await testConnection(client);
      if (!isConnected) {
        throw new Error('Connection test failed');
      }

      console.log('Prisma client initialized successfully');
      return client;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error during initialization');
      console.error(`Failed to initialize Prisma client (attempt ${retries + 1}/${MAX_RETRIES}):`, {
        error: lastError.message,
        stack: process.env.NODE_ENV === 'development' ? lastError.stack : undefined,
      });
      
      retries++;
      if (retries < MAX_RETRIES) {
        console.log(`Retrying in ${RETRY_DELAY}ms...`);
        await waitFor(RETRY_DELAY);
      }
    }
  }

  throw lastError || new Error('Failed to initialize Prisma client after multiple attempts');
}

// Initialize Prisma client with retries
let prismaPromise: Promise<PrismaClient>;

// Check if we're in edge runtime
const isEdgeRuntime = process.env.NEXT_RUNTIME === 'edge';

if (isEdgeRuntime) {
  // For edge runtime, create a new client each time
  prismaPromise = createPrismaClient();
} else {
  // For Node.js runtime, use global singleton
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = await createPrismaClient();
  }
  prismaPromise = Promise.resolve(globalForPrisma.prisma);
}

// Export a function to get the initialized client
export async function getPrismaClient(): Promise<PrismaClient> {
  try {
    return await prismaPromise;
  } catch (error) {
    console.error('Error getting Prisma client:', error);
    // Create a new client if the existing one failed
    prismaPromise = createPrismaClient();
    return prismaPromise;
  }
}

// For backward compatibility
export const prisma = await prismaPromise;
export default prisma;