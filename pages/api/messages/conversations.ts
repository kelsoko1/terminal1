import { NextApiRequest, NextApiResponse } from 'next';
import { adminDb, adminAuth } from '../../../lib/firebase/admin';

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
      // Define message and user types
      interface MessageDoc {
        id: string;
        senderId: string;
        receiverId: string;
        content: string;
        createdAt: string;
        participants: string[];
      }
      interface UserDoc {
        id: string;
        name: string;
        image?: string;
        email?: string;
      }

      // Fetch all messages where the user is sender or receiver
      const messagesSnap = await adminDb.collection('messages')
        .where('participants', 'array-contains', userId)
        .orderBy('createdAt', 'desc')
        .get();
      const messages: MessageDoc[] = messagesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as MessageDoc));

      // Collect all unique participant IDs (other than the current user)
      const participantIds = Array.from(new Set(messages.map(m => m.senderId === userId ? m.receiverId : m.senderId)));

      // Fetch user info for all participants
      const userDocs = await Promise.all(
        participantIds.map(async pid => {
          const userSnap = await adminDb.collection('users').doc(pid).get();
          return userSnap.exists ? { id: userSnap.id, ...userSnap.data() } as UserDoc : null;
        })
      );
      const userMap = new Map<string, UserDoc>();
      userDocs.forEach(u => { if (u) userMap.set(u.id, u); });

      // Build conversation map
      const conversationMap = new Map<string, { user: UserDoc, lastMessage: any }>();
      for (const message of messages) {
        const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;
        if (!conversationMap.has(otherUserId)) {
          const user = userMap.get(otherUserId) || { id: otherUserId, name: 'Unknown User' };
          conversationMap.set(otherUserId, {
            user,
            lastMessage: {
              id: message.id,
              content: message.content,
              timestamp: message.createdAt,
              senderId: message.senderId,
              receiverId: message.receiverId
            }
          });
        }
      }
      const conversations = Array.from(conversationMap.values());
      // Sort conversations by last message timestamp (newest first)
      conversations.sort((a, b) => new Date(a.lastMessage.timestamp).getTime() < new Date(b.lastMessage.timestamp).getTime() ? 1 : -1);
      return res.status(200).json(conversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return res.status(500).json({ error: 'Failed to fetch conversations' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
