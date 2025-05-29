import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  initDatabases, 
  checkNetworkStatus, 
  getDatabase, 
  syncModel,
  markForSync
} from './localDatabase';
import { SyncDirection } from './prismaClients';

interface DatabaseContextType {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  syncError: string | null;
  checkConnection: () => Promise<boolean>;
  syncAllModels: () => Promise<void>;
  syncSpecificModel: (model: string, direction?: SyncDirection) => Promise<any>;
  useLocalDatabase: boolean;
  setUseLocalDatabase: (value: boolean) => void;
  markRecordForSync: (model: string, id: string) => Promise<void>;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const DatabaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [useLocalDatabase, setUseLocalDatabase] = useState<boolean>(false);

  // Models that need to be synced
  const models = [
    'User',
    'Organization',
    'Subscription',
    'SubscriptionPlan',
    'Payment',
    'Post',
    'Comment',
    'Attachment'
  ];

  // Initialize databases on component mount
  useEffect(() => {
    const init = async () => {
      try {
        await initDatabases();
        const online = await checkConnection();
        setIsOnline(online);
        
        // If we're offline, force use of local database
        if (!online) {
          setUseLocalDatabase(true);
        }
      } catch (error) {
        console.error('Failed to initialize databases:', error);
        setUseLocalDatabase(true);
      }
    };

    init();

    // Set up periodic connection checks
    const connectionCheckInterval = setInterval(async () => {
      const online = await checkConnection();
      
      // If we just came back online and we were using local DB, trigger a sync
      if (online && !isOnline && useLocalDatabase) {
        syncAllModels();
      }
      
      setIsOnline(online);
    }, 30000); // Check every 30 seconds

    return () => {
      clearInterval(connectionCheckInterval);
    };
  }, [isOnline, useLocalDatabase]);

  const checkConnection = async (): Promise<boolean> => {
    const online = await checkNetworkStatus();
    setIsOnline(online);
    return online;
  };

  const syncAllModels = async (): Promise<void> => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    setSyncError(null);
    
    try {
      // First check if we're online
      const online = await checkConnection();
      if (!online) {
        setSyncError('Cannot sync while offline');
        setIsSyncing(false);
        return;
      }
      
      // Sync all models
      for (const model of models) {
        await syncSpecificModel(model, SyncDirection.BIDIRECTIONAL);
      }
      
      setLastSyncTime(new Date());
    } catch (error) {
      console.error('Error during sync:', error);
      setSyncError(error instanceof Error ? error.message : 'Unknown sync error');
    } finally {
      setIsSyncing(false);
    }
  };

  const syncSpecificModel = async (model: string, direction: SyncDirection = SyncDirection.BIDIRECTIONAL) => {
    if (!isOnline && (direction === SyncDirection.TO_SERVER || direction === SyncDirection.BIDIRECTIONAL)) {
      return { success: false, error: 'Cannot sync to server while offline' };
    }
    
    try {
      const result = await syncModel(model, direction);
      return result;
    } catch (error) {
      console.error(`Error syncing model ${model}:`, error);
      throw error;
    }
  };

  const markRecordForSync = async (model: string, id: string): Promise<void> => {
    try {
      await markForSync(model, id);
    } catch (error) {
      console.error(`Error marking ${model}:${id} for sync:`, error);
      throw error;
    }
  };

  return (
    <DatabaseContext.Provider
      value={{
        isOnline,
        isSyncing,
        lastSyncTime,
        syncError,
        checkConnection,
        syncAllModels,
        syncSpecificModel,
        useLocalDatabase,
        setUseLocalDatabase,
        markRecordForSync
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = (): DatabaseContextType => {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};

// Custom hook for database operations with automatic fallback
export const useDatabaseOperation = () => {
  const { isOnline, useLocalDatabase, markRecordForSync } = useDatabase();
  
  const executeOperation = async <T,>(
    operation: () => Promise<T>,
    model?: string,
    id?: string
  ): Promise<T> => {
    try {
      // Execute the database operation
      const result = await operation();
      
      // If we're using local database and we have model and id info,
      // mark the record for future sync
      if (useLocalDatabase && model && id) {
        await markRecordForSync(model, id);
      }
      
      return result;
    } catch (error) {
      console.error('Database operation failed:', error);
      throw error;
    }
  };
  
  return {
    executeOperation,
    isOnline,
    useLocalDatabase
  };
};
