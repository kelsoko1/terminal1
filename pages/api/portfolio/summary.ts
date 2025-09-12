import { NextApiRequest, NextApiResponse } from 'next';
import { adminDb } from '@/lib/firebase/admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    // Get portfolio summary data from Firestore
    const portfolioRef = adminDb.collection('portfolios').doc(userId as string);
    const doc = await portfolioRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Portfolio not found' });
    }
    const summary = doc.data();

    // Fetch performance data from Firestore (assume a 'performance' subcollection)
    const performanceSnap = await portfolioRef.collection('performance').orderBy('month').get();
    const performanceData = performanceSnap.docs.map(doc => doc.data());

    return res.status(200).json({
      summary,
      performanceData: Array.isArray(performanceData) ? performanceData : []
    });
  } catch (error) {
    console.error('Error fetching portfolio summary:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch portfolio summary',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
