import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Check if user has broker role
  if (!session.user.roles?.includes('BROKER') && !session.user.roles?.includes('ADMIN')) {
    return res.status(403).json({ error: 'Forbidden: Broker access required' });
  }

  try {
    if (req.method === 'GET') {
      // Get broker wallet balance and transactions
      const brokerWalletData = await prisma.$queryRaw`
        SELECT 
          SUM(CASE WHEN type = 'DEPOSIT' AND status = 'COMPLETED' THEN amount ELSE 0 END) as total_deposits,
          SUM(CASE WHEN type = 'DISBURSEMENT' AND status = 'COMPLETED' THEN amount ELSE 0 END) as total_disbursements,
          (SUM(CASE WHEN type = 'DEPOSIT' AND status = 'COMPLETED' THEN amount ELSE 0 END) - 
           SUM(CASE WHEN type = 'DISBURSEMENT' AND status = 'COMPLETED' THEN amount ELSE 0 END)) as balance
        FROM "BrokerTransaction"
      `;

      // Format wallet data
      const walletSummary = Array.isArray(brokerWalletData) && brokerWalletData.length > 0 ? {
        balance: Number(brokerWalletData[0].balance || 0),
        totalDeposits: Number(brokerWalletData[0].total_deposits || 0),
        totalDisbursements: Number(brokerWalletData[0].total_disbursements || 0)
      } : {
        balance: 0,
        totalDeposits: 0,
        totalDisbursements: 0
      };

      // Get deposits
      const deposits = await prisma.brokerTransaction.findMany({
        where: {
          type: 'DEPOSIT'
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      // Get disbursements
      const disbursements = await prisma.brokerTransaction.findMany({
        where: {
          type: 'DISBURSEMENT'
        },
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          user: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      // Get last deposit date
      const lastDeposit = deposits.length > 0 ? deposits[0].createdAt.toISOString() : null;
      
      // Get last disbursement date
      const lastDisbursement = disbursements.length > 0 ? disbursements[0].createdAt.toISOString() : null;

      return res.status(200).json({
        ...walletSummary,
        deposits,
        disbursements,
        lastDepositDate: lastDeposit,
        lastDisbursementDate: lastDisbursement
      });
    } else if (req.method === 'POST') {
      const { type, amount, method, reference, userId, userName, notes } = req.body;

      if (!type || !amount) {
        return res.status(400).json({ error: 'Type and amount are required' });
      }

      if (type === 'DEPOSIT') {
        if (!method || !reference) {
          return res.status(400).json({ error: 'Method and reference are required for deposits' });
        }

        // Create deposit transaction
        const deposit = await prisma.brokerTransaction.create({
          data: {
            type: 'DEPOSIT',
            amount: parseFloat(amount),
            method,
            reference,
            status: 'COMPLETED',
            notes
          }
        });

        return res.status(201).json({
          success: true,
          message: 'Deposit added successfully',
          deposit
        });
      } else if (type === 'DISBURSEMENT') {
        if (!userId) {
          return res.status(400).json({ error: 'User ID is required for disbursements' });
        }

        // Check if broker has sufficient funds
        const brokerBalance = await prisma.$queryRaw`
          SELECT 
            (SUM(CASE WHEN type = 'DEPOSIT' AND status = 'COMPLETED' THEN amount ELSE 0 END) - 
             SUM(CASE WHEN type = 'DISBURSEMENT' AND status = 'COMPLETED' THEN amount ELSE 0 END)) as balance
          FROM "BrokerTransaction"
        `;

        const balance = Array.isArray(brokerBalance) && brokerBalance.length > 0
          ? Number(brokerBalance[0].balance || 0)
          : 0;

        if (balance < parseFloat(amount)) {
          return res.status(400).json({
            success: false,
            message: 'Insufficient funds in broker wallet'
          });
        }

        // Create disbursement transaction
        const disbursement = await prisma.brokerTransaction.create({
          data: {
            type: 'DISBURSEMENT',
            amount: parseFloat(amount),
            status: 'PENDING',
            notes,
            userId
          }
        });

        // Add funds to user's wallet
        await prisma.transaction.create({
          data: {
            userId,
            amount: parseFloat(amount),
            type: 'DEPOSIT',
            status: 'COMPLETED',
            description: 'Funds disbursement from broker'
          }
        });

        // Update disbursement status to completed
        const updatedDisbursement = await prisma.brokerTransaction.update({
          where: {
            id: disbursement.id
          },
          data: {
            status: 'COMPLETED'
          }
        });

        return res.status(201).json({
          success: true,
          message: 'Disbursement processed successfully',
          disbursement: updatedDisbursement
        });
      }

      return res.status(400).json({ error: 'Invalid transaction type' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Broker wallet API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
