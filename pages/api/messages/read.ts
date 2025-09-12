import { NextApiRequest, NextApiResponse } from 'next';
import { adminDb, adminAuth } from '@/lib/firebase/admin';
const collectionName = 'messages';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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
  const userId = decoded.uid;

  if (req.method === 'POST') {
    try {
      const { messageId } = req.body

      if (!messageId) {
        return res.status(400).json({ error: 'Missing messageId' })
      }

      // Verify the message exists and belongs to the user
      const doc = await adminDb.collection(collectionName).doc(messageId).get();
      const message = doc.data();
      if (!message) {
        return res.status(404).json({ error: 'Message not found' });
      }
      // Only the receiver can mark a message as read
      if (message.receiverId !== userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      // Mark the message as read
      await adminDb.collection(collectionName).doc(messageId).update({ read: true });
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error marking message as read:', error)
      return res.status(500).json({ error: 'Failed to mark message as read' })
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' })
  }
}
