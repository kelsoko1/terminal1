import { NextApiRequest, NextApiResponse } from 'next';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
const db = getFirestore();
const collectionName = 'challenges';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return getChallenges(req, res);
    case 'POST':
      return createChallenge(req, res);
    case 'PUT':
      return updateChallenge(req, res);
    case 'DELETE':
      return deleteChallenge(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function getChallenges(req: NextApiRequest, res: NextApiResponse) {
  try {
    const snapshot = await db.collection(collectionName).get();
    const challenges = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(challenges);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch challenges' });
  }
}

async function createChallenge(req: NextApiRequest, res: NextApiResponse) {
  const { title, description, reward, difficulty, category, createdById } = req.body;
  try {
    const docRef = await db.collection(collectionName).add({ title, description, reward, difficulty, category, createdById, createdAt: Timestamp.now() });
    const doc = await docRef.get();
    res.status(201).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create challenge' });
  }
}

async function updateChallenge(req: NextApiRequest, res: NextApiResponse) {
  const { id, ...updates } = req.body;
  try {
    const docRef = db.collection(collectionName).doc(id);
    await docRef.update(updates);
    const doc = await docRef.get();
    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update challenge' });
  }
}

async function deleteChallenge(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  try {
    await db.collection(collectionName).doc(String(id)).delete();
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete challenge' });
  }
}
