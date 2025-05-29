import { NextApiRequest, NextApiResponse } from 'next';
import { prismaRemote } from '../../../lib/database/prismaClients';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    // Get portfolio summary data
    const portfolioSummary = await prismaRemote.$queryRaw`
      WITH user_trades AS (
        SELECT 
          symbol, 
          SUM(CASE WHEN type = 'BUY' THEN quantity ELSE -quantity END) as total_quantity,
          SUM(CASE WHEN type = 'BUY' THEN price * quantity ELSE 0 END) as total_buy_cost,
          SUM(CASE WHEN type = 'BUY' THEN quantity ELSE 0 END) as total_buy_quantity
        FROM "Trade"
        WHERE "userId" = ${userId as string} AND status = 'COMPLETED'
        GROUP BY symbol
        HAVING SUM(CASE WHEN type = 'BUY' THEN quantity ELSE -quantity END) > 0
      ),
      user_wallet AS (
        SELECT SUM(amount) as cash_balance
        FROM "Transaction"
        WHERE "userId" = ${userId as string}
      )
      SELECT 
        (SELECT cash_balance FROM user_wallet) as cash_balance,
        (SELECT SUM(s.price * ut.total_quantity) FROM user_trades ut JOIN "Stock" s ON ut.symbol = s.symbol) as total_assets,
        (SELECT SUM(s.price * ut.total_quantity - ut.total_buy_cost) FROM user_trades ut JOIN "Stock" s ON ut.symbol = s.symbol) as gross_pl,
        (SELECT SUM(s.price * ut.total_quantity - ut.total_buy_cost) - 
          (SELECT COALESCE(SUM(ABS(amount)), 0) FROM "Transaction" WHERE "userId" = ${userId as string} AND type = 'FEE')) as net_pl,
        (SELECT COALESCE(SUM(ABS(amount)), 0) FROM "Transaction" WHERE "userId" = ${userId as string} AND type = 'FEE') as total_costs,
        (SELECT 
          CASE 
            WHEN SUM(ut.total_buy_cost) > 0 
            THEN (SUM(s.price * ut.total_quantity) - SUM(ut.total_buy_cost)) / SUM(ut.total_buy_cost) * 100 
            ELSE 0 
          END 
         FROM user_trades ut JOIN "Stock" s ON ut.symbol = s.symbol) as roi_percentage
    `;

    // Format the summary data
    const summary = Array.isArray(portfolioSummary) && portfolioSummary.length > 0 ? {
      cashBalance: Number(portfolioSummary[0].cash_balance || 0),
      totalAssets: Number(portfolioSummary[0].total_assets || 0),
      grossPL: Number(portfolioSummary[0].gross_pl || 0),
      netPL: Number(portfolioSummary[0].net_pl || 0),
      totalCosts: Number(portfolioSummary[0].total_costs || 0),
      roiPercentage: Number(portfolioSummary[0].roi_percentage || 0)
    } : {
      cashBalance: 0,
      totalAssets: 0,
      grossPL: 0,
      netPL: 0,
      totalCosts: 0,
      roiPercentage: 0
    };

    // Get performance breakdown data (monthly performance)
    const performanceData = await prismaRemote.$queryRaw`
      WITH monthly_performance AS (
        SELECT 
          DATE_TRUNC('month', t."createdAt") as month,
          SUM(CASE 
            WHEN t.type = 'BUY' THEN -t.price * t.quantity 
            WHEN t.type = 'SELL' THEN t.price * t.quantity
            ELSE 0
          END) as monthly_pl
        FROM "Trade" t
        WHERE t."userId" = ${userId as string} AND t.status = 'COMPLETED'
        GROUP BY DATE_TRUNC('month', t."createdAt")
        ORDER BY month
      )
      SELECT 
        TO_CHAR(month, 'YYYY-MM') as month,
        monthly_pl,
        SUM(monthly_pl) OVER (ORDER BY month) as cumulative_pl
      FROM monthly_performance
      ORDER BY month
    `;

    return res.status(200).json({
      summary,
      performanceData: Array.isArray(performanceData) ? performanceData : []
    });
  } catch (error) {
    console.error('Error fetching portfolio summary:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch portfolio summary',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
