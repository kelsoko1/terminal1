import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

// Create a PostgreSQL connection pool
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize Prisma client
const prisma = new PrismaClient();

// Helper for executing database queries
export const db = {
  /**
   * Execute a SQL query with optional parameters
   * @param text SQL query text
   * @param params Query parameters
   * @returns Query result
   */
  async query(text: string, params?: any[]) {
    console.log('Executing query:', { text, params: params?.map(p => typeof p === 'object' ? '[Object]' : p) });
    try {
      const result = await pool.query(text, params);
      return result;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  },

  /**
   * Execute a transaction with multiple queries
   * @param callback Function that receives a client and executes queries
   * @returns Result of the callback function
   */
  async transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Transaction error:', error);
      throw error;
    } finally {
      client.release();
    }
  },
  
  // Prisma client instance for ORM operations
  prisma
};

// Export the Prisma client directly for easier access
export default db;
