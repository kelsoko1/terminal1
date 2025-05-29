import { NextApiRequest, NextApiResponse } from 'next';
import { checkNetworkStatus, initDatabases } from '../../../lib/database/localDatabase';
import { syncAllModels } from '../../../lib/database/syncAllModels';
import { SyncDirection } from '../../../lib/database/prismaClients';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET and POST methods
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Initialize databases
    const { localDb, remoteDb, isOnline } = await initDatabases();
    
    // GET: Return database status
    if (req.method === 'GET') {
      return res.status(200).json({
        isOnline,
        localDbConnected: !!localDb,
        remoteDbConnected: !!remoteDb,
        timestamp: new Date().toISOString()
      });
    }
    
    // POST: Trigger synchronization
    if (req.method === 'POST') {
      const { direction = 'BIDIRECTIONAL' } = req.body;
      
      // Validate direction
      if (!['TO_SERVER', 'FROM_SERVER', 'BIDIRECTIONAL'].includes(direction)) {
        return res.status(400).json({ error: 'Invalid sync direction' });
      }
      
      // Check if we're online for TO_SERVER and BIDIRECTIONAL
      if ((direction === 'TO_SERVER' || direction === 'BIDIRECTIONAL') && !isOnline) {
        return res.status(503).json({ 
          error: 'Cannot sync to server while offline',
          isOnline
        });
      }
      
      // Trigger synchronization
      const syncResult = await syncAllModels(SyncDirection[direction as keyof typeof SyncDirection]);
      
      return res.status(syncResult.success ? 200 : 500).json({
        success: syncResult.success,
        results: syncResult.results,
        errors: syncResult.errors,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Database status API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
