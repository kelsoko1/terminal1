import { prismaRemote, prismaLocal, SyncDirection, SyncStatus } from './prismaClients';
import type { PrismaClient } from '@prisma/client';

// Network status tracking
let isOnline = true;

/**
 * Initialize database connections
 */
export async function initDatabases() {
  try {
    // Initialize local database
    console.log('Local database initialized');

    // Try to initialize remote database if online
    if (isOnline) {
      try {
        // Test connection to remote database
        await prismaRemote.$queryRaw`SELECT 1`;
        console.log('Remote database initialized');
      } catch (error) {
        console.error('Failed to connect to remote database:', error);
        isOnline = false;
      }
    }

    return { localDb: prismaLocal, remoteDb: isOnline ? prismaRemote : null, isOnline };
  } catch (error) {
    console.error('Error initializing databases:', error);
    throw error;
  }
}

/**
 * Get the appropriate database client based on network status
 */
export async function getDatabase() {
  const { localDb, remoteDb, isOnline } = await initDatabases();
  
  // If online and remote DB is available, use remote DB
  // Otherwise, fall back to local DB
  return isOnline && remoteDb ? remoteDb : localDb;
}

/**
 * Check network status and update the isOnline flag
 */
export async function checkNetworkStatus(): Promise<boolean> {
  try {
    // Simple network check by trying to fetch a small resource
    const response = await fetch(process.env.NEXT_PUBLIC_APP_URL + '/api/health', {
      method: 'HEAD',
      cache: 'no-cache',
    });
    
    isOnline = response.ok;
    return isOnline;
  } catch (error) {
    isOnline = false;
    return false;
  }
}

/**
 * Mark a record for synchronization
 */
export async function markForSync(model: string, id: string) {
  try {
    // @ts-ignore - Dynamic access to Prisma models
    const modelClient = prismaLocal[model];
    if (!modelClient) throw new Error(`Model ${model} not found`);

    await modelClient.update({
      where: { id },
      data: {
        syncStatus: SyncStatus.PENDING,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error(`Failed to mark ${model}:${id} for sync:`, error);
  }
}

/**
 * Get records that need to be synchronized
 */
export async function getPendingSyncRecords(model: string) {
  try {
    // @ts-ignore - Dynamic access to Prisma models
    const modelClient = prismaLocal[model];
    if (!modelClient) throw new Error(`Model ${model} not found`);

    return await modelClient.findMany({
      where: {
        syncStatus: SyncStatus.PENDING,
      },
    });
  } catch (error) {
    console.error(`Failed to get pending sync records for ${model}:`, error);
    return [];
  }
}

/**
 * Synchronize a specific model between local and remote databases
 */
export async function syncModel(model: string, direction: SyncDirection = SyncDirection.TO_SERVER) {
  // Check if we're online before attempting to sync to server
  if (direction === SyncDirection.TO_SERVER || direction === SyncDirection.BIDIRECTIONAL) {
    const online = await checkNetworkStatus();
    if (!online) {
      console.log('Cannot sync to server: offline');
      return { success: false, error: 'Offline' };
    }
  }

  // Create sync log entry
  const syncLog = await prismaLocal.syncLog.create({
    data: {
      direction,
      status: 'STARTED',
    },
  });

  try {
    let recordsProcessed = 0;
    let recordsSucceeded = 0;
    let recordsFailed = 0;

    // @ts-ignore - Dynamic access to Prisma models
    const localModelClient = prismaLocal[model];
    // @ts-ignore - Dynamic access to Prisma models
    const remoteModelClient = prismaRemote[model];

    if (!localModelClient || !remoteModelClient) {
      throw new Error(`Model ${model} not found`);
    }

    // TO_SERVER: Push local changes to server
    if (direction === SyncDirection.TO_SERVER || direction === SyncDirection.BIDIRECTIONAL) {
      const pendingRecords = await getPendingSyncRecords(model);
      
      for (const record of pendingRecords) {
        recordsProcessed++;
        
        try {
          // Remove sync-specific fields before sending to server
          const { syncedAt, syncStatus, localId, ...recordData } = record;
          
          // Check if record exists on server
          const existingRecord = await remoteModelClient.findUnique({
            where: { id: record.id },
          });

          if (existingRecord) {
            // Update existing record
            await remoteModelClient.update({
              where: { id: record.id },
              data: recordData,
            });
          } else {
            // Create new record
            await remoteModelClient.create({
              data: recordData,
            });
          }

          // Mark as synced in local DB
          await localModelClient.update({
            where: { id: record.id },
            data: {
              syncStatus: SyncStatus.SYNCED,
              syncedAt: new Date(),
            },
          });

          recordsSucceeded++;
        } catch (error) {
          console.error(`Failed to sync ${model}:${record.id} to server:`, error);
          
          // Mark as failed in local DB
          await localModelClient.update({
            where: { id: record.id },
            data: {
              syncStatus: SyncStatus.FAILED,
            },
          });
          
          recordsFailed++;
        }
      }
    }

    // FROM_SERVER: Pull remote changes to local
    if (direction === SyncDirection.FROM_SERVER || direction === SyncDirection.BIDIRECTIONAL) {
      // Get last sync time
      const lastSync = await prismaLocal.syncLog.findFirst({
        where: {
          direction: SyncDirection.FROM_SERVER,
          status: 'COMPLETED',
        },
        orderBy: {
          completedAt: 'desc',
        },
      });

      // Get records updated since last sync
      const remoteRecords = await remoteModelClient.findMany({
        where: lastSync?.completedAt ? {
          updatedAt: {
            gt: lastSync.completedAt,
          },
        } : {},
      });

      for (const record of remoteRecords) {
        recordsProcessed++;
        
        try {
          // Check if record exists locally
          const existingRecord = await localModelClient.findUnique({
            where: { id: record.id },
          });

          if (existingRecord) {
            // Update local record
            await localModelClient.update({
              where: { id: record.id },
              data: {
                ...record,
                syncStatus: SyncStatus.SYNCED,
                syncedAt: new Date(),
              },
            });
          } else {
            // Create new local record
            await localModelClient.create({
              data: {
                ...record,
                syncStatus: SyncStatus.SYNCED,
                syncedAt: new Date(),
              },
            });
          }

          recordsSucceeded++;
        } catch (error) {
          console.error(`Failed to sync ${model}:${record.id} from server:`, error);
          recordsFailed++;
        }
      }
    }

    // Update sync log
    await prismaLocal.syncLog.update({
      where: { id: syncLog.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        recordsProcessed,
        recordsSucceeded,
        recordsFailed,
      },
    });

    return {
      success: true,
      recordsProcessed,
      recordsSucceeded,
      recordsFailed,
    };
  } catch (error) {
    console.error(`Error syncing ${model}:`, error);
    
    // Update sync log with error
    await prismaLocal.syncLog.update({
      where: { id: syncLog.id },
      data: {
        status: 'FAILED',
        completedAt: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
