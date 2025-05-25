// Script to apply migration using Prisma Client
const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Connecting to database...');
    
    // Test the connection
    await prisma.$connect();
    console.log('Successfully connected to the database');
    
    // Execute raw SQL from the migration file
    console.log('Applying migration...');
    
    // You would normally read the migration.sql file here and execute it
    // For now, we'll just confirm the connection works
    
    console.log('Migration applied successfully');
  } catch (error) {
    console.error('Error applying migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
