// Database module
import { Database } from './types';
import postgresDb from './postgres';

// In production, always use the real PostgreSQL database
const USE_MOCK_DB = process.env.USE_MOCK_DB === 'true' || false;

// Export the PostgreSQL database implementation
export const db: Database = postgresDb;

// Log database implementation
console.log('Using PostgreSQL database implementation');

export default db;
