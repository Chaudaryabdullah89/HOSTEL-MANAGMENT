import { prisma } from './prisma.js';

// Utility function to execute database operations with automatic reconnection
export const withRetry = async (operation, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      // Check if it's a connection error
      if (error.message.includes('Engine is not yet connected') || 
          error.message.includes('Connection') ||
          error.message.includes('timeout')) {
        
        console.error(`Database operation failed (attempt ${i + 1}/${maxRetries}):`, error.message);
        
        if (i === maxRetries - 1) {
          throw error;
        }
        
        // Try to reconnect
        try {
          await prisma.$disconnect();
          await prisma.$connect();
          console.log('Database reconnected successfully');
        } catch (reconnectError) {
          console.error('Failed to reconnect to database:', reconnectError.message);
        }
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      } else {
        // If it's not a connection error, throw immediately
        throw error;
      }
    }
  }
};

// Health check function
export const checkDatabaseHealth = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { healthy: true, message: 'Database connection is healthy' };
  } catch (error) {
    return { 
      healthy: false, 
      message: `Database connection failed: ${error.message}` 
    };
  }
};

// Graceful shutdown function
export const gracefulShutdown = async () => {
  try {
    await prisma.$disconnect();
    console.log('Database connection closed gracefully');
  } catch (error) {
    console.error('Error during database shutdown:', error);
  }
};
