import { NextApiRequest, NextApiResponse } from 'next';
import { tradingService } from '@/services/TradingService';
import { getAuth } from 'firebase-admin/auth';
import { app } from '@/lib/firebase-admin';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Check authentication using Firebase Admin
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing authorization header' });
    }

    const token = authHeader.split('Bearer ')[1];
    try {
      await getAuth(app).verifyIdToken(token);
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { orderId } = req.query;

    if (!orderId || typeof orderId !== 'string') {
      return res.status(400).json({ error: 'Invalid order ID' });
    }

    switch (req.method) {
      case 'GET':
        // Get order status
        const orderStatus = await tradingService.getOrderStatus(orderId);
        return res.status(200).json(orderStatus);

      case 'DELETE':
        // Cancel order
        const cancelResponse = await tradingService.cancelOrder(orderId);
        return res.status(200).json(cancelResponse);

      default:
        res.setHeader('Allow', ['GET', 'DELETE']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error: any) {
    console.error('Trading API Error:', error);
    return res.status(500).json({ error: error.message });
  }
} 