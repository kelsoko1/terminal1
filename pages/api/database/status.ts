import { NextApiRequest, NextApiResponse } from 'next';

// Use Firestore/Firebase logic for database status instead of localDatabase.
// Use Firestore/Firebase logic for sync status instead of syncAllModels.
// Removed // SyncDirection no longer used; Firestore/Firebase handles sync logic. import. Use Firestore/Firebase logic instead.

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET and POST methods
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // GET: Return Firestore connectivity status
    if (req.method === 'GET') {
      // Try a simple Firestore ping (e.g., fetch a known collection)
      let firestoreOnline = false;
      try {
        // Use adminDb from your Firestore admin setup
        const { adminDb } = await import('@/lib/firebase/admin');
        await adminDb.collection('statusTest').limit(1).get();
        firestoreOnline = true;
      } catch (e) {
        firestoreOnline = false;
      }
      return res.status(200).json({
        firestoreOnline,
        timestamp: new Date().toISOString()
      });
    }
    // POST: No sync needed with Firestore
    if (req.method === 'POST') {
      return res.status(200).json({
        message: 'Firestore is cloud-native and does not require manual sync.',
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
