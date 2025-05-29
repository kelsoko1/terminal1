import { NextApiRequest, NextApiResponse } from 'next';
import { prismaRemote } from '../../../lib/database/prismaClients';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  // GET: Fetch wallet data and transactions
  if (req.method === 'GET') {
    try {
      // Get wallet balance
      const walletData = await prismaRemote.$queryRaw`
        SELECT SUM(amount) as balance 
        FROM "Transaction" 
        WHERE "userId" = ${userId}
      `;
      
      const balance = walletData[0]?.balance || 0;
      
      // Get recent transactions using raw query since we don't have proper model access
      const transactions = await prismaRemote.$queryRaw`
        SELECT * FROM "Transaction" 
        WHERE "userId" = ${userId as string}
        ORDER BY "createdAt" DESC
        LIMIT 10
      `;
      
      return res.status(200).json({
        wallet: {
          balance,
          transactions
        }
      });
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch wallet data',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  // POST: Add funds to wallet
  if (req.method === 'POST') {
    try {
      const { amount, description, type } = req.body;
      
      if (!amount || !type) {
        return res.status(400).json({ error: 'Amount and type are required' });
      }
      
      // Create a transaction record in our database
      // Since we don't have direct access to the Transaction model through Prisma,
      // we'll use a raw query to insert the data
      await prismaRemote.$queryRaw`
        INSERT INTO "Transaction" ("id", "userId", "amount", "description", "type", "status", "createdAt")
        VALUES (gen_random_uuid(), ${userId as string}, ${Number(amount)}, ${description || (type === 'deposit' ? 'Deposit' : 'Withdrawal')}, ${type}, 'COMPLETED', ${new Date()})
      `;
      
      // Get the newly created transaction
      const newTransactions = await prismaRemote.$queryRaw`
        SELECT * FROM "Transaction"
        WHERE "userId" = ${userId as string}
        ORDER BY "createdAt" DESC
        LIMIT 1
      `;
      
      const newTransaction = Array.isArray(newTransactions) && newTransactions.length > 0 ? newTransactions[0] : null;
      
      // Get updated balance
      const walletData = await prismaRemote.$queryRaw`
        SELECT SUM(amount) as balance 
        FROM "Transaction" 
        WHERE "userId" = ${userId}
      `;
      
      const balance = walletData[0]?.balance || 0;
      
      return res.status(201).json({
        transaction: newTransaction,
        balance
      });
    } catch (error) {
      console.error('Error processing wallet transaction:', error);
      return res.status(500).json({ 
        error: 'Failed to process wallet transaction',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
