import { NextApiRequest, NextApiResponse } from 'next';
import { adminDb, adminAuth } from '@/lib/firebase/admin';

const collectionName = 'stocks';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Authenticate user
  const authHeader = req.headers.authorization || '';
  const idToken = authHeader.startsWith('Bearer ')
    ? authHeader.replace('Bearer ', '')
    : null;

  if (!idToken) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  try {
    await adminAuth.verifyIdToken(idToken);
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }

  const { method } = req;
  const { id } = req.query;

  switch (method) {
    case 'GET':
      try {
        const snapshot = await adminDb.collection(collectionName).get();
        const stocks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(stocks);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stocks' });
      }
      break;

    case 'POST':
      try {
        const { symbol, name, marketCap, volume, price } = req.body;
        const docRef = await adminDb.collection(collectionName).add({ symbol, name, marketCap, volume, price });
        const newDoc = await docRef.get();
        res.status(201).json({ id: newDoc.id, ...newDoc.data() });
      } catch (error) {
        res.status(500).json({ error: 'Failed to create stock' });
      }
      break;

    case 'PUT':
      try {
        if (!id) return res.status(400).json({ error: 'Stock ID is required' });
        const { symbol, name, marketCap, volume, price } = req.body;
        const docRef = adminDb.collection(collectionName).doc(String(id));
        await docRef.update({ symbol, name, marketCap, volume, price });
        const updatedDoc = await docRef.get();
        res.status(200).json({ id: updatedDoc.id, ...updatedDoc.data() });
      } catch (error) {
        res.status(500).json({ error: 'Failed to update stock' });
      }
      break;

    case 'DELETE':
      try {
        if (!id) return res.status(400).json({ error: 'Stock ID is required' });
        await adminDb.collection(collectionName).doc(String(id)).delete();
        res.status(204).end();
      } catch (error) {
        res.status(500).json({ error: 'Failed to delete stock' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
