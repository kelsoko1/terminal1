/**
 * Database query result interface
 */
export interface QueryResult {
  rows: any[];
  rowCount: number;
}

/**
 * Database client interface
 */
export interface DbClient {
  query: (text: string, params?: any[]) => Promise<QueryResult>;
}

/**
 * Database interface
 */
export interface Database {
  query: (text: string, params?: any[]) => Promise<QueryResult>;
  transaction: <T>(callback: (client: DbClient) => Promise<T>) => Promise<T>;
  initializeTestData?: () => void;
}
