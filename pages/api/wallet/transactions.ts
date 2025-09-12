import { NextApiRequest, NextApiResponse } from 'next';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
const db = getFirestore();
const collectionName = 'transactions';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  // GET: Fetch wallet transactions and summary
  if (req.method === 'GET') {
    try {
      // Fetch all transactions for the user
      const snapshot = await db.collection(collectionName)
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(100)
        .get();
      const transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Calculate wallet summary
      let availableBalance = 0, pendingDeposits = 0, pendingWithdrawals = 0;
      transactions.forEach((t: any) => {
        if (t.status === 'COMPLETED') availableBalance += Number(t.amount);
        if (t.status === 'PENDING' && t.amount > 0) pendingDeposits += Number(t.amount);
        if (t.status === 'PENDING' && t.amount < 0) pendingWithdrawals += Math.abs(Number(t.amount));
      });
      const walletSummary = { availableBalance, pendingDeposits, pendingWithdrawals };
      const deposits = transactions.filter((t: any) => t.amount > 0 && t.type !== 'FEE');
      const withdrawals = transactions.filter((t: any) => t.amount < 0 && t.type !== 'FEE');
      return res.status(200).json({
        summary: walletSummary,
        transactions,
        deposits,
        withdrawals
      });
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch wallet data',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  // POST: Add a new transaction (deposit or withdrawal)
  if (req.method === 'POST') {
    try {
      const { amount, type, description } = req.body;
      if (!amount || !type) {
        return res.status(400).json({ error: 'Amount and type are required' });
      }
      const transactionAmount = type.toLowerCase() === 'deposit' 
        ? Math.abs(Number(amount)) 
        : -Math.abs(Number(amount));
      // Create transaction record in Firestore
      await db.collection(collectionName).add({
        userId,
        amount: transactionAmount,
        type: type.toUpperCase(),
        description: description || (type === 'deposit' ? 'Deposit' : 'Withdrawal'),
        status: 'COMPLETED',
        createdAt: Timestamp.now()
      });
      // Get updated wallet balance
      const snapshot = await db.collection(collectionName)
        .where('userId', '==', userId)
        .where('status', '==', 'COMPLETED')
        .get();
      let balance = 0;
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        balance += Number(data.amount);
      });
      return res.status(201).json({
        success: true,
        message: `${type} processed successfully`,
        balance
      });
    } catch (error) {
      console.error('Error processing transaction:', error);
      return res.status(500).json({ 
        error: 'Failed to process transaction',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
