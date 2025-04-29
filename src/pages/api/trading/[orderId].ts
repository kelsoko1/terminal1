import { NextApiRequest, NextApiResponse } from 'next';
import { tradingService } from '@/services/TradingService';
import { authService } from '@/services/AuthService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Check authentication
  if (!authService.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { orderId } = req.query;

  if (!orderId || typeof orderId !== 'string') {
    return res.status(400).json({ error: 'Invalid order ID' });
  }

  try {
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