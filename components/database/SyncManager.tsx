import React, { useState, useEffect } from 'react';
import { useDatabase } from '../../lib/database/DatabaseContext';
import { SyncDirection } from '../../lib/database/prismaClients';

const SyncManager: React.FC = () => {
  const { 
    isOnline, 
    isSyncing, 
    lastSyncTime, 
    syncError, 
    checkConnection, 
    syncAllModels,
    syncSpecificModel,
    useLocalDatabase,
    setUseLocalDatabase
  } = useDatabase();

  const [syncStats, setSyncStats] = useState<{
    [key: string]: {
      pending: number;
      synced: number;
      failed: number;
    }
  }>({});

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

  // Fetch sync stats periodically
  useEffect(() => {
    const fetchSyncStats = async () => {
      const stats: any = {};
      
      for (const model of models) {
        try {
          const result = await syncSpecificModel(model, SyncDirection.BIDIRECTIONAL);
          stats[model] = {
            pending: result.recordsProcessed - result.recordsSucceeded - result.recordsFailed,
            synced: result.recordsSucceeded,
            failed: result.recordsFailed
          };
        } catch (error) {
          console.error(`Error fetching sync stats for ${model}:`, error);
          stats[model] = { pending: 0, synced: 0, failed: 0 };
        }
      }
      
      setSyncStats(stats);
    };

    if (isOnline && !isSyncing) {
      fetchSyncStats();
    }

    const interval = setInterval(() => {
      if (isOnline && !isSyncing) {
        fetchSyncStats();
      }
    }, 60000); // Update stats every minute

    return () => clearInterval(interval);
  }, [isOnline, isSyncing]);

  const handleSyncAll = async () => {
    await syncAllModels();
  };

  const handleToggleLocalDb = () => {
    setUseLocalDatabase(!useLocalDatabase);
  };

  const handleCheckConnection = async () => {
    await checkConnection();
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-3xl mx-auto my-8">
      <h2 className="text-2xl font-bold mb-4">Database Sync Manager</h2>
      
      <div className="flex items-center mb-6">
        <div className="mr-4">
          <span className="font-semibold mr-2">Connection Status:</span>
          {isOnline ? (
            <span className="text-green-600 font-medium">Online</span>
          ) : (
            <span className="text-red-600 font-medium">Offline</span>
          )}
        </div>
        <button 
          onClick={handleCheckConnection}
          className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
        >
          Check Connection
        </button>
      </div>
      
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <span className="font-semibold mr-2">Database Mode:</span>
          <span className={`font-medium ${useLocalDatabase ? 'text-orange-600' : 'text-green-600'}`}>
            {useLocalDatabase ? 'Local Database (Offline Mode)' : 'Remote Database (Online Mode)'}
          </span>
        </div>
        <button 
          onClick={handleToggleLocalDb}
          disabled={!isOnline && !useLocalDatabase}
          className={`px-4 py-2 rounded text-white ${
            !isOnline && !useLocalDatabase 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {useLocalDatabase ? 'Switch to Remote Database' : 'Switch to Local Database'}
        </button>
        {!isOnline && !useLocalDatabase && (
          <p className="text-sm text-red-600 mt-1">
            Cannot switch to remote database while offline
          </p>
        )}
      </div>
      
      {lastSyncTime && (
        <div className="mb-6">
          <span className="font-semibold">Last Sync:</span>{' '}
          {new Date(lastSyncTime).toLocaleString()}
        </div>
      )}
      
      {syncError && (
        <div className="mb-6 p-3 bg-red-100 border border-red-300 rounded text-red-800">
          <span className="font-semibold">Sync Error:</span> {syncError}
        </div>
      )}
      
      <div className="mb-6">
        <button 
          onClick={handleSyncAll}
          disabled={!isOnline || isSyncing}
          className={`px-4 py-2 rounded text-white ${
            !isOnline || isSyncing 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {isSyncing ? 'Syncing...' : 'Sync All Data'}
        </button>
      </div>
      
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Sync Status by Model</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b text-left">Model</th>
                <th className="py-2 px-4 border-b text-center">Pending</th>
                <th className="py-2 px-4 border-b text-center">Synced</th>
                <th className="py-2 px-4 border-b text-center">Failed</th>
                <th className="py-2 px-4 border-b text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {models.map((model) => (
                <tr key={model} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{model}</td>
                  <td className="py-2 px-4 border-b text-center">
                    {syncStats[model]?.pending || 0}
                  </td>
                  <td className="py-2 px-4 border-b text-center">
                    {syncStats[model]?.synced || 0}
                  </td>
                  <td className="py-2 px-4 border-b text-center">
                    {syncStats[model]?.failed || 0}
                  </td>
                  <td className="py-2 px-4 border-b text-center">
                    <button
                      onClick={() => syncSpecificModel(model, SyncDirection.BIDIRECTIONAL)}
                      disabled={!isOnline || isSyncing}
                      className={`px-3 py-1 rounded text-xs ${
                        !isOnline || isSyncing
                          ? 'bg-gray-300 cursor-not-allowed'
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                    >
                      Sync
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SyncManager;
