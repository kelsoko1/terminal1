import { PrismaClient as PrismaClientRemote } from '@prisma/client';
// We'll use a type assertion instead of direct import since the module might not exist yet
// until the setup script is run

// Define the extended PrismaClient type with custom properties
type ExtendedPrismaClient = PrismaClientRemote & {
  syncLog: any;
  $queryRaw: any;
};

// Prevent multiple instances of Prisma Client in development
declare global {
  var prismaRemote: ExtendedPrismaClient | undefined;
  var prismaLocal: ExtendedPrismaClient | undefined;
}

// Initialize remote Prisma client (PostgreSQL)
export const prismaRemote = 
  global.prismaRemote || 
  new PrismaClientRemote({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  }) as ExtendedPrismaClient;

// Initialize local Prisma client (SQLite)
// We'll use the same PrismaClient type but configure it differently
// In a real implementation, this would be a separate client generated from the local schema
export const prismaLocal = 
  global.prismaLocal || 
  new PrismaClientRemote({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    // This would normally point to a different datasource
    // In production, this would be properly configured with the local schema
  }) as ExtendedPrismaClient;

// Save references to the global object in development to prevent multiple instances
if (process.env.NODE_ENV !== 'production') {
  global.prismaRemote = prismaRemote;
  global.prismaLocal = prismaLocal;
}

// Re-export SyncDirection and SyncStatus enums for use in the application
export enum SyncDirection {
  TO_SERVER = 'TO_SERVER',
  FROM_SERVER = 'FROM_SERVER',
  BIDIRECTIONAL = 'BIDIRECTIONAL'
}

export enum SyncStatus {
  PENDING = 'PENDING',
  SYNCED = 'SYNCED',
  CONFLICT = 'CONFLICT',
  FAILED = 'FAILED'
}
