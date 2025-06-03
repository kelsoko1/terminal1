import { PrismaClient } from '@prisma/client'

/**
 * Extension for Prisma client to add types for margin trading models
 * This is a temporary solution until the Prisma schema is fully migrated
 */

// Extend PrismaClient with margin trading models
export interface PrismaClientExtension extends PrismaClient {
  marginPosition: {
    findUnique: (args: any) => Promise<any>;
    findMany: (args: any) => Promise<any[]>;
    create: (args: any) => Promise<any>;
    update: (args: any) => Promise<any>;
    delete: (args: any) => Promise<any>;
  };
  marginTrade: {
    findMany: (args: any) => Promise<any[]>;
    create: (args: any) => Promise<any>;
  };
  stockPrice: {
    findFirst: (args: any) => Promise<any | null>;
    findMany: (args: any) => Promise<any[]>;
    create: (args: any) => Promise<any>;
  };
  transaction: {
    create: (args: any) => Promise<any>;
  };
}

/**
 * Create an extended Prisma client with margin trading models
 */
export function createExtendedPrismaClient(): PrismaClientExtension {
  const prisma = new PrismaClient() as PrismaClientExtension;
  
  // Add margin position model
  prisma.marginPosition = {
    findUnique: async (args) => {
      // Implementation will use real Prisma client after migration
      // For now, we'll use a mock implementation
      return null;
    },
    findMany: async (args) => {
      // Implementation will use real Prisma client after migration
      return [];
    },
    create: async (args) => {
      // Implementation will use real Prisma client after migration
      return { id: `mock-${Date.now()}`, ...args.data };
    },
    update: async (args) => {
      // Implementation will use real Prisma client after migration
      return { id: args.where.id, ...args.data };
    },
    delete: async (args) => {
      // Implementation will use real Prisma client after migration
      return { id: args.where.id };
    }
  };
  
  // Add margin trade model
  prisma.marginTrade = {
    findMany: async (args) => {
      // Implementation will use real Prisma client after migration
      return [];
    },
    create: async (args) => {
      // Implementation will use real Prisma client after migration
      return { id: `mock-${Date.now()}`, ...args.data };
    }
  };
  
  // Add stock price model
  prisma.stockPrice = {
    findFirst: async (args) => {
      // Implementation will use real Prisma client after migration
      return null;
    },
    findMany: async (args) => {
      // Implementation will use real Prisma client after migration
      return [];
    },
    create: async (args) => {
      // Implementation will use real Prisma client after migration
      return { id: `mock-${Date.now()}`, ...args.data };
    }
  };
  
  // Add transaction model
  prisma.transaction = {
    create: async (args) => {
      // Implementation will use real Prisma client after migration
      return { id: `mock-${Date.now()}`, ...args.data };
    }
  };
  
  return prisma;
}
