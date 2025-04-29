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

  try {
    switch (req.method) {
      case 'POST':
        // Place new order
        const orderResponse = await tradingService.placeOrder(req.body);
        return res.status(200).json(orderResponse);

      case 'GET':
        // Get orders based on query parameter
        const { type } = req.query;
        if (type === 'active') {
          const activeOrders = await tradingService.getActiveOrders();
          return res.status(200).json(activeOrders);
        } else if (type === 'history') {
          const orderHistory = await tradingService.getOrderHistory();
          return res.status(200).json(orderHistory);
        }
        return res.status(400).json({ error: 'Invalid query parameter' });

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error: any) {
    console.error('Trading API Error:', error);
    return res.status(500).json({ error: error.message });
  }
} 