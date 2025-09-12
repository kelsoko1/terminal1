import { NextApiRequest, NextApiResponse } from 'next';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
const db = getFirestore();
const collectionName = 'streams';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case 'GET':
      // Fetch all streams
      try {
        const snapshot = await db.collection(collectionName).get();
        const streams = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return res.status(200).json(streams);
      } catch (error) {
        console.error('Error fetching streams:', error);
        return res.status(500).json({ error: 'Failed to fetch streams' });
      }

    case 'POST':
      // Create a new stream
      try {
        const { userId, title, mediaType, mediaUrl } = req.body;
        const docRef = await db.collection(collectionName).add({
          userId,
          title,
          mediaType,
          mediaUrl,
          createdAt: Timestamp.now()
        });
        const doc = await docRef.get();
        return res.status(201).json({ id: doc.id, ...doc.data() });
      } catch (error) {
        console.error('Error creating stream:', error);
        return res.status(500).json({ error: 'Failed to create stream' });
      }

    case 'PUT':
      // Update a stream
      try {
        const { id, title, mediaType, mediaUrl } = req.body;
        const docRef = db.collection(collectionName).doc(id);
        await docRef.update({ title, mediaType, mediaUrl });
        const doc = await docRef.get();
        return res.status(200).json({ id: doc.id, ...doc.data() });
      } catch (error) {
        console.error('Error updating stream:', error);
        return res.status(500).json({ error: 'Failed to update stream' });
      }

    case 'DELETE':
      // Delete a stream
      try {
        const { id } = req.body;
        await db.collection(collectionName).doc(id).delete();
        return res.status(204).end();
      } catch (error) {
        console.error('Error deleting stream:', error);
        return res.status(500).json({ error: 'Failed to delete stream' });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
