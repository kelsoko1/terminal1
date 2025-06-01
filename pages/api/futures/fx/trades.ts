import { NextApiRequest, NextApiResponse } from 'next';
import { prismaRemote } from '../../../../lib/database/prismaClients';
import { getSession } from 'next-auth/react';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check authentication
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = session.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'User ID not found in session' });
  }

  // GET: Fetch trades
  if (req.method === 'GET') {
    try {
      const { expiryDateId, fxFutureId, limit = 20, page = 1 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      
      // Build filter conditions for orders to find trades where user is buyer or seller
      const userOrders = await prismaRemote.fxFutureOrder.findMany({
        where: { userId },
        select: { id: true }
      });
      
      const orderIds = userOrders.map(order => order.id);
      
      // Build filter conditions
      const where: any = {
        OR: [
          { buyerOrderId: { in: orderIds } },
          { sellerOrderId: { in: orderIds } }
        ]
      };
      
      if (expiryDateId) {
        where.expiryDateId = expiryDateId;
      } else if (fxFutureId) {
        // If fxFutureId is provided, we need to find all expiry dates for this future
        const expiryDates = await prismaRemote.fxExpiryDate.findMany({
          where: { fxFutureId: fxFutureId as string },
          select: { id: true }
        });
        
        where.expiryDateId = { in: expiryDates.map(ed => ed.id) };
      }
      
      // Fetch trades with pagination
      const [trades, count] = await Promise.all([
        prismaRemote.fxFutureTrade.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { timestamp: 'desc' },
          include: {
            expiryDate: {
              include: {
                fxFuture: true,
              },
            },
            buyerOrder: true,
            sellerOrder: true,
          },
        }),
        prismaRemote.fxFutureTrade.count({ where }),
      ]);
      
      return res.status(200).json({
        trades,
        pagination: {
          total: count,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(count / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching FX trades:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch FX trades',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // For admin users: GET all trades
  if (req.method === 'GET' && req.query.admin === 'true') {
    // Check if user has admin role
    const user = await prismaRemote.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });
    
    if (user?.role !== 'ADMIN' && user?.role !== 'BROKER') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    
    try {
      const { expiryDateId, fxFutureId, limit = 20, page = 1 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      
      // Build filter conditions
      const where: any = {};
      
      if (expiryDateId) {
        where.expiryDateId = expiryDateId;
      } else if (fxFutureId) {
        // If fxFutureId is provided, we need to find all expiry dates for this future
        const expiryDates = await prismaRemote.fxExpiryDate.findMany({
          where: { fxFutureId: fxFutureId as string },
          select: { id: true }
        });
        
        where.expiryDateId = { in: expiryDates.map(ed => ed.id) };
      }
      
      // Fetch all trades with pagination
      const [trades, count] = await Promise.all([
        prismaRemote.fxFutureTrade.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { timestamp: 'desc' },
          include: {
            expiryDate: {
              include: {
                fxFuture: true,
              },
            },
            buyerOrder: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true
                  }
                }
              }
            },
            sellerOrder: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true
                  }
                }
              }
            },
          },
        }),
        prismaRemote.fxFutureTrade.count({ where }),
      ]);
      
      return res.status(200).json({
        trades,
        pagination: {
          total: count,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(count / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching admin FX trades:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch FX trades',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Method not allowed
  return res.status(405).json({ error: 'Method not allowed' });
}
