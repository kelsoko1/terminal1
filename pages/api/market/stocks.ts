import { NextApiRequest, NextApiResponse } from 'next';
import { adminDb, adminAuth } from '@/lib/firebase/admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Authenticate using Firebase ID token
  const authHeader = req.headers.authorization || '';
  const idToken = authHeader.startsWith('Bearer ')
    ? authHeader.replace('Bearer ', '')
    : null;
  if (!idToken) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }
  let decoded;
  try {
    decoded = await adminAuth.verifyIdToken(idToken);
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }

  try {
    // Fetch stocks from Firestore
    const stocksSnap = await adminDb.collection('stocks').orderBy('symbol', 'asc').get();
    const stocks = stocksSnap.docs.map((doc: FirebaseFirestore.QueryDocumentSnapshot) => ({ id: doc.id, ...doc.data() }));
    // TODO: Calculate marketCap and tradingVolume from actual data if needed
    return res.status(200).json({ 
      stocks,
      marketCap: "TZS 2.8T", // Placeholder, calculate from actual data if needed
      tradingVolume: "TZS 84.5B", // Placeholder, calculate from actual data if needed
      marketStatus: "Open", // Placeholder, determine from trading hours if needed
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching stocks:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch stocks',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
