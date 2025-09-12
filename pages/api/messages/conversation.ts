import { NextApiRequest, NextApiResponse } from 'next';
import { adminDb, adminAuth } from '@/lib/firebase/admin';

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
  const { otherUserId } = req.query;
  if (!otherUserId || typeof otherUserId !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid otherUserId parameter' });
  }

  if (req.method === 'GET') {
    try {
      // Get all messages between the current user and the other user
      const messagesSnap = await adminDb.collection('messages')
        .where('participants', 'array-contains', userId)
        .orderBy('createdAt', 'asc')
        .get();
      // Filter messages between userId and otherUserId
      interface MessageDoc {
        id: string;
        senderId: string;
        receiverId: string;
        content: string;
        createdAt: string;
        participants: string[];
        read: boolean;
      }
      const messages: MessageDoc[] = messagesSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as MessageDoc))
        .filter(msg => (
          (msg.senderId === userId && msg.receiverId === otherUserId) ||
          (msg.senderId === otherUserId && msg.receiverId === userId)
        ));
      // Mark unread messages as read
      const batch = adminDb.batch();
      messages.forEach(msg => {
        if (msg.senderId === otherUserId && msg.receiverId === userId && msg.read === false) {
          const msgRef = adminDb.collection('messages').doc(msg.id);
          batch.update(msgRef, { read: true });
        }
      });
      await batch.commit();
      // Optionally, fetch sender info from users collection
      // (not implemented here for brevity)
      return res.status(200).json(messages);
    } catch (error) {
      console.error('Error fetching conversation messages:', error);
      return res.status(500).json({ error: 'Failed to fetch conversation messages' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
