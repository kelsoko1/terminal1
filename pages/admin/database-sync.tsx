import React from 'react';
import { DatabaseProvider } from '../../lib/database/DatabaseContext';
import SyncManager from '../../components/database/SyncManager';
import Head from 'next/head';

const DatabaseSyncPage: React.FC = () => {
  return (
    <DatabaseProvider>
      <Head>
        <title>Database Sync Manager | Kelsoko</title>
      </Head>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Database Synchronization</h1>
        <SyncManager />
      </div>
    </DatabaseProvider>
  );
};

export default DatabaseSyncPage;
