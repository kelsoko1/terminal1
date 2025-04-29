// Database module
import { Database } from './types';
import mockDb from './mock';
import postgresDb from './postgres';

// Determine which database implementation to use
// In production, you would use environment variables to control this
const USE_MOCK_DB = process.env.USE_MOCK_DB === 'true' || true;

// Export the appropriate database implementation
export const db: Database = USE_MOCK_DB ? mockDb : postgresDb;

// Log which database implementation is being used
console.log(`Using ${USE_MOCK_DB ? 'mock' : 'PostgreSQL'} database implementation`);

export default db;
