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

  // GET: Fetch wallet transactions and summary
  if (req.method === 'GET') {
    try {
      // Get wallet balance
      const walletData = await prismaRemote.$queryRaw`
        SELECT 
          SUM(CASE WHEN status = 'COMPLETED' THEN amount ELSE 0 END) as available_balance,
          SUM(CASE WHEN status = 'PENDING' AND amount > 0 THEN amount ELSE 0 END) as pending_deposits,
          SUM(CASE WHEN status = 'PENDING' AND amount < 0 THEN ABS(amount) ELSE 0 END) as pending_withdrawals
        FROM "Transaction" 
        WHERE "userId" = ${userId as string}
      `;
      
      // Format wallet data
      const walletSummary = Array.isArray(walletData) && walletData.length > 0 ? {
        availableBalance: Number(walletData[0].available_balance || 0),
        pendingDeposits: Number(walletData[0].pending_deposits || 0),
        pendingWithdrawals: Number(walletData[0].pending_withdrawals || 0)
      } : {
        availableBalance: 0,
        pendingDeposits: 0,
        pendingWithdrawals: 0
      };
      
      // Get transaction history
      const transactions = await prismaRemote.$queryRaw`
        SELECT 
          id,
          type,
          amount,
          status,
          description,
          "createdAt"
        FROM "Transaction"
        WHERE "userId" = ${userId as string}
        ORDER BY "createdAt" DESC
        LIMIT 20
      `;
      
      // Group transactions by type for filtering
      const deposits = Array.isArray(transactions) 
        ? transactions.filter((t: any) => t.amount > 0 && t.type !== 'FEE')
        : [];
        
      const withdrawals = Array.isArray(transactions)
        ? transactions.filter((t: any) => t.amount < 0 && t.type !== 'FEE')
        : [];
      
      return res.status(200).json({
        summary: walletSummary,
        transactions: Array.isArray(transactions) ? transactions : [],
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
      
      // Validate amount based on transaction type
      const transactionAmount = type.toLowerCase() === 'deposit' 
        ? Math.abs(Number(amount)) 
        : -Math.abs(Number(amount));
      
      // Create transaction record
      await prismaRemote.$queryRaw`
        INSERT INTO "Transaction" (
          id, 
          "userId", 
          amount, 
          type, 
          description, 
          status, 
          "createdAt"
        )
        VALUES (
          gen_random_uuid(), 
          ${userId as string}, 
          ${transactionAmount}, 
          ${type.toUpperCase()}, 
          ${description || (type === 'deposit' ? 'Deposit' : 'Withdrawal')}, 
          'COMPLETED', 
          ${new Date()}
        )
      `;
      
      // Get updated wallet balance
      const updatedWallet = await prismaRemote.$queryRaw`
        SELECT SUM(amount) as balance
        FROM "Transaction"
        WHERE "userId" = ${userId as string} AND status = 'COMPLETED'
      `;
      
      const balance = Array.isArray(updatedWallet) && updatedWallet.length > 0
        ? Number(updatedWallet[0].balance || 0)
        : 0;
      
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
