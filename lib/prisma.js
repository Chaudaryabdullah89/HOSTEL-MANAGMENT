import { PrismaClient } from "@prisma/client";

// Ensure environment variables are loaded
if (!process.env.DATABASE_URL) {
  require('dotenv').config();
}

const globalForPrisma = globalThis;

// Create Prisma client with proper configuration
const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
};

// Initialize Prisma client with proper singleton pattern
let prisma = globalForPrisma.prisma;

if (!prisma) {
  prisma = createPrismaClient();

  // Connect immediately in development
  if (process.env.NODE_ENV === 'development') {
    prisma.$connect().catch((error) => {
      console.error('Failed to connect to database:', error);
    });
  }

  globalForPrisma.prisma = prisma;
}

// Ensure connection before queries
const ensureConnection = async () => {
  if (!prisma) {
    throw new Error('Prisma client not initialized');
  }

  try {
    // Check if already connected by running a simple query
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    // If not connected, try to connect
    if (error.message.includes('not yet connected') || error.message.includes('Engine is not yet connected')) {
      try {
        await prisma.$connect();
      } catch (connectError) {
        // If already connected, ignore the error
        if (!connectError.message.includes('already connected')) {
          throw connectError;
        }
      }
    } else {
      throw error;
    }
  }
};

// Handle process termination
process.on('beforeExit', async () => {
  if (prisma) {
    await prisma.$disconnect();
  }
});

process.on('SIGINT', async () => {
  if (prisma) {
    await prisma.$disconnect();
    process.exit(0);
  }
});

process.on('SIGTERM', async () => {
  if (prisma) {
    await prisma.$disconnect();
    process.exit(0);
  }
});

export { prisma, ensureConnection };
