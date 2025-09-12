import { NextApiRequest, NextApiResponse } from 'next';
import { PortfolioPerformance } from '@/lib/types';
import { tradingService } from '@/lib/firebase/services/tradingService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PortfolioPerformance | { error: string; details?: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    // Get user's portfolio from trading service
    const portfolio = await tradingService.getPortfolio(userId as string);
    res.status(200).json(portfolio);
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    res.status(500).json({ 
      error: 'Failed to fetch portfolio data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
