import { NextApiRequest, NextApiResponse } from 'next';
import { adminDb, adminAuth } from '@/lib/firebase/admin';
const collectionName = 'dseBrokers';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
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
    if (req.method === 'GET') {
      // Get all DSE brokers
      const snapshot = await adminDb.collection(collectionName).orderBy('name', 'asc').get();
      const brokers = snapshot.docs.map((doc: FirebaseFirestore.QueryDocumentSnapshot) => ({ id: doc.id, ...doc.data() }));
      return res.status(200).json(brokers);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('DSE brokers API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
