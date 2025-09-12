// DEPRECATED: This file is obsolete. All database logic has migrated to Firestore/Firebase.
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'terminaldb',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Event handler for connection errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Real PostgreSQL implementation
export const db: Database = {
  async query(text: string, params?: any[]): Promise<QueryResult> {
    const client = await pool.connect();
    try {
      const result = await client.query(text, params);
      return {
        rows: result.rows,
        rowCount: result.rowCount || 0
      };
    } finally {
      client.release();
    }
  },
  
  async transaction<T>(callback: (client: DbClient) => Promise<T>): Promise<T> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Create a client wrapper that implements the DbClient interface
      const dbClient: DbClient = {
        query: async (text: string, params?: any[]) => {
          const result = await client.query(text, params);
          return {
            rows: result.rows,
            rowCount: result.rowCount || 0
          };
        }
      };
      
      const result = await callback(dbClient);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Transaction error:', error);
      throw error;
    } finally {
      client.release();
    }
  }
};

export default db;
