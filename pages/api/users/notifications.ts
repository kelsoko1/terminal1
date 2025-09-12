import { NextApiRequest, NextApiResponse } from 'next';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
const db = getFirestore();
const collectionName = 'notifications';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET' && req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  // GET: Fetch user notifications
  if (req.method === 'GET') {
    try {
      // Fetch notifications from Firestore
      const snapshot = await db.collection(collectionName)
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(20)
        .get();
      const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return res.status(200).json({ notifications });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch notifications',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  // PATCH: Mark notifications as read
  if (req.method === 'PATCH') {
    try {
      const { notificationIds } = req.body;
      
      if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
        return res.status(400).json({ error: 'Notification IDs are required' });
      }
      
      // Batch update notifications in Firestore
      const batch = db.batch();
      notificationIds.forEach((id: string) => {
        const docRef = db.collection(collectionName).doc(id);
        batch.update(docRef, { isRead: true });
      });
      await batch.commit();
      return res.status(200).json({ 
        success: true,
        message: 'Notifications marked as read'
      });
    } catch (error) {
      console.error('Error updating notifications:', error);
      return res.status(500).json({ 
        error: 'Failed to update notifications',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
