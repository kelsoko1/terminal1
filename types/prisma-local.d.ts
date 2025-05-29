// Type declarations for local Prisma client
import { PrismaClient as OriginalPrismaClient } from '@prisma/client';

// Re-export the SyncDirection enum
export enum SyncDirection {
  TO_SERVER = 'TO_SERVER',
  FROM_SERVER = 'FROM_SERVER',
  BIDIRECTIONAL = 'BIDIRECTIONAL'
}

// Re-export the SyncStatus enum
export enum SyncStatus {
  PENDING = 'PENDING',
  SYNCED = 'SYNCED',
  CONFLICT = 'CONFLICT',
  FAILED = 'FAILED'
}

// Define the local PrismaClient type
export declare class PrismaClient extends OriginalPrismaClient {
  $connect(): Promise<void>;
  syncLog: any;
}

// Declare the module to make it importable
declare module '@prisma/client/local' {
  export { PrismaClient, SyncDirection, SyncStatus };
}
