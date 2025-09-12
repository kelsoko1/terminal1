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

  if (req.method === 'GET') {
    try {
      // Get all messages for the current user (sent or received)
      const snapshot = await adminDb.collection(collectionName)
        .where('participants', 'array-contains', userId)
        .orderBy('createdAt', 'asc')
        .get();
      const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return res.status(200).json(messages);
    } catch (error) {
      console.error('Error fetching messages:', error)
      return res.status(500).json({ error: 'Failed to fetch messages' })
    }
  } else if (req.method === 'POST') {
    try {
      const { receiverId, content } = req.body

      if (!receiverId || !content) {
        return res.status(400).json({ error: 'Missing required fields' })
      }

      // Create a new message
      const createdAt = new Date();
      const docRef = await adminDb.collection(collectionName).add({
        senderId: userId,
        receiverId,
        content,
        read: false,
        createdAt,
        participants: [userId, receiverId]
      });
      const doc = await docRef.get();
      return res.status(201).json({ id: doc.id, ...doc.data() });
    } catch (error) {
      console.error('Error sending message:', error)
      return res.status(500).json({ error: 'Failed to send message' })
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' })
  }
}
