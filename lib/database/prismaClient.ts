import { PrismaClient } from '@prisma/client'

// Add prisma to the NodeJS global type
declare global {
  var prisma: PrismaClient | undefined
}

// Create a singleton Prisma client instance
let prisma: PrismaClient

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient()
} else {
  // In development, use a global variable to prevent multiple instances during hot reloading
  if (!global.prisma) {
    global.prisma = new PrismaClient()
  }
  prisma = global.prisma as PrismaClient
}

export default prisma
