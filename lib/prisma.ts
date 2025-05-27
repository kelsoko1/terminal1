import { PrismaClient } from '@prisma/client';

// This approach avoids TypeScript errors without requiring @types/node

// Define a safe global object that works in all environments
// Using this approach to avoid TypeScript errors with global
const globalAny: any = typeof window === 'undefined' 
  ? (typeof globalThis !== 'undefined' ? globalThis : {}) 
  : window;

// Create a single PrismaClient instance for the entire app
// This prevents exhausting database connections during development
let prismaInstance: PrismaClient;

if (!globalAny.prisma) {
  globalAny.prisma = new PrismaClient();
}

prismaInstance = globalAny.prisma;

export const prisma = prismaInstance;
export default prisma;