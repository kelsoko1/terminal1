import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { schema } from './schema';
import migrations from './migrations';
import {
  User,
  Portfolio,
  Holding,
  Security,
  Order,
  Transaction,
  Watchlist,
  WatchlistItem,
  MarketData,
  News
} from './models';

// Initialize database with the schema
const adapter = new SQLiteAdapter({
  schema,
  migrations,
  // Optional database name
  dbName: 'webtraderDB',
  // Optional synchronization queue size
  jsi: true, // Enable JSI for better performance
  onSetUpError: error => {
    console.error('Database setup error:', error);
  }
});

export const database = new Database({
  adapter,
  modelClasses: [
    User,
    Portfolio,
    Holding,
    Security,
    Order,
    Transaction,
    Watchlist,
    WatchlistItem,
    MarketData,
    News
  ]
});

// Database synchronization configuration
export const syncConfig = {
  // Base URL for the DSE Avvento API
  apiUrl: 'https://api.dse.com.bd',
  // Sync interval in milliseconds (e.g., every 5 minutes)
  syncInterval: 5 * 60 * 1000,
  // Maximum number of retry attempts for failed sync
  maxRetries: 3,
  // Retry delay in milliseconds
  retryDelay: 5000,
  // Sync batch size
  batchSize: 100
}; 