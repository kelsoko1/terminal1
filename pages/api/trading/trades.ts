import { NextApiRequest, NextApiResponse } from 'next';
import { prismaRemote } from '../../../lib/database/prismaClients';

// Mock data for trades until we can run the Prisma migration
const mockTrades = [
  {
    id: '1',
    userId: 'user1',
    symbol: 'CRDB',
    quantity: 1000,
    price: 400,
    type: 'BUY',
    status: 'COMPLETED',
    createdAt: new Date('2024-03-15T10:30:00'),
    updatedAt: new Date('2024-03-15T10:30:00')
  },
  {
    id: '2',
    userId: 'user1',
    symbol: 'NMB',
    quantity: 500,
    price: 3900,
    type: 'BUY',
    status: 'COMPLETED',
    createdAt: new Date('2024-03-15T11:15:00'),
    updatedAt: new Date('2024-03-15T11:15:00')
  },
  {
    id: '3',
    userId: 'user2',
    symbol: 'TBL',
    quantity: 200,
    price: 10900,
    type: 'SELL',
    status: 'COMPLETED',
    createdAt: new Date('2024-03-15T13:45:00'),
    updatedAt: new Date('2024-03-15T13:45:00')
  }
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // GET: Fetch trades
  if (req.method === 'GET') {
    try {
      const { userId, limit = 20, page = 1 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      
      // Filter mock trades by userId if provided
      let filteredTrades = mockTrades;
      if (userId) {
        filteredTrades = mockTrades.filter(trade => trade.userId === userId);
      }
      
      // Apply pagination
      const paginatedTrades = filteredTrades.slice(skip, skip + Number(limit));
      
      return res.status(200).json({
        trades: paginatedTrades,
        pagination: {
          total: filteredTrades.length,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(filteredTrades.length / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching trades:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch trades',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  // POST: Create a new trade
  if (req.method === 'POST') {
    try {
      const { userId, symbol, quantity, price, type } = req.body;
      
      // Validate required fields
      if (!userId || !symbol || !quantity || !price || !type) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      // Create a new mock trade (in production this would use Prisma)
      const newTrade = {
        id: String(mockTrades.length + 1),
        userId,
        symbol,
        quantity: Number(quantity),
        price: Number(price),
        type,
        status: 'COMPLETED',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // In a real implementation, we would save this to the database
      // For now, we'll just return the mock trade
      
      return res.status(201).json({ trade: newTrade });
    } catch (error) {
      console.error('Error creating trade:', error);
      return res.status(500).json({ 
        error: 'Failed to create trade',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
