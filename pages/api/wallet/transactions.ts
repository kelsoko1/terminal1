import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/authOptions';
import { getDatabase } from '@/lib/database/localDatabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get user from session for authentication
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Use userId from query or from session
  const userId = (req.query.userId as string) || session.user.id;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  // GET: Fetch wallet transactions and summary
  if (req.method === 'GET') {
    try {
      const db = await getDatabase();
      
      // Get all transactions for the user using Prisma client
      const transactions = await db.transaction.findMany({
        where: {
          userId: userId
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 20
      });
      
      // Calculate wallet summary from transactions
      const completedTransactions = transactions.filter((t: any) => t.status === 'COMPLETED');
      
      // Calculate total deposits and withdrawals
      const totalDeposits = completedTransactions
        .filter((t: any) => t.type === 'DEPOSIT')
        .reduce((sum: number, t: any) => sum + Number(t.amount), 0);
        
      const totalWithdrawals = completedTransactions
        .filter((t: any) => t.type === 'WITHDRAWAL')
        .reduce((sum: number, t: any) => sum + Number(t.amount), 0);
        
      // Calculate current balance
      const balance = totalDeposits - totalWithdrawals;
      
      return res.status(200).json({
        transactions,
        summary: {
          balance,
          totalDeposits,
          totalWithdrawals
        }
      });
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return res.status(500).json({ error: 'Failed to fetch transactions' });
    }
  }
  
  // POST: Create a new transaction
  if (req.method === 'POST') {
    try {
      const { amount, type, description } = req.body;
      
      if (!amount || !type) {
        return res.status(400).json({ error: 'Amount and type are required' });
      }
      
      const db = await getDatabase();
      
      // Validate amount based on transaction type
      const transactionAmount = type.toLowerCase() === 'deposit' 
        ? Math.abs(Number(amount)) 
        : -Math.abs(Number(amount));
      
      // Insert new transaction using Prisma client
      const transaction = await db.transaction.create({
        data: {
          userId,
          amount: transactionAmount,
          type: type.toUpperCase(),
          description: description || (type === 'deposit' ? 'Deposit' : 'Withdrawal'),
          status: 'COMPLETED'
        }
      });
      
      // Get all completed transactions to calculate balance
      const completedTransactions = await db.transaction.findMany({
        where: {
          userId,
          status: 'COMPLETED'
        }
      });
      
      // Calculate current balance
      const balance = completedTransactions.reduce((sum: number, t: any) => sum + Number(t.amount), 0);
      
      return res.status(201).json({
        transaction,
        balance
      });
    } catch (error) {
      console.error('Error creating transaction:', error);
      return res.status(500).json({ error: 'Failed to create transaction' });
    }
  }
}
