import { NextApiRequest, NextApiResponse } from 'next';
import { prismaRemote } from '../../../lib/database/prismaClients';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get market overview statistics
    const marketStats = await prismaRemote.$queryRaw`
      SELECT 
        SUM(price * volume) as "marketCap",
        SUM(volume) as "tradingVolume",
        'Open' as "marketStatus",
        CASE 
          WHEN AVG(price - "previousPrice") > 0 
          THEN '+' || ROUND(AVG((price - "previousPrice") / "previousPrice" * 100), 2) || '%'
          ELSE ROUND(AVG((price - "previousPrice") / "previousPrice" * 100), 2) || '%'
        END as "percentChange"
      FROM "Stock"
      WHERE "isActive" = true
    `;
    
    // Get market indices
    const indices = await prismaRemote.$queryRaw`
      SELECT 
        name, 
        value, 
        "previousValue",
        ROUND(((value - "previousValue") / "previousValue" * 100), 2) as "percentChange",
        "updatedAt"
      FROM "MarketIndex"
      ORDER BY name
    `;
    
    // Get market sectors performance
    const sectorPerformance = await prismaRemote.$queryRaw`
      SELECT 
        sector, 
        COUNT(*) as "stockCount",
        ROUND(AVG((price - "previousPrice") / "previousPrice" * 100), 2) as "percentChange"
      FROM "Stock"
      WHERE sector IS NOT NULL AND "isActive" = true
      GROUP BY sector
      ORDER BY "percentChange" DESC
    `;
    
    // Get market news
    const marketNews = await prismaRemote.$queryRaw`
      SELECT 
        id, 
        title, 
        content, 
        source, 
        url, 
        "publishedAt", 
        "createdAt"
      FROM "News"
      ORDER BY "publishedAt" DESC
      LIMIT 5
    `;
    
    // Format the response
    const formattedStats = Array.isArray(marketStats) && marketStats.length > 0 ? {
      marketCap: `TZS ${formatNumber(Number(marketStats[0].marketCap || 0))}`,
      tradingVolume: `TZS ${formatNumber(Number(marketStats[0].tradingVolume || 0))}`,
      marketStatus: marketStats[0].marketStatus || 'Closed',
      percentChange: marketStats[0].percentChange || '0%'
    } : {
      marketCap: 'TZS 0',
      tradingVolume: 'TZS 0',
      marketStatus: 'Closed',
      percentChange: '0%'
    };
    
    return res.status(200).json({
      ...formattedStats,
      indices: Array.isArray(indices) ? indices : [],
      sectorPerformance: Array.isArray(sectorPerformance) ? sectorPerformance : [],
      marketNews: Array.isArray(marketNews) ? marketNews : []
    });
  } catch (error) {
    console.error('Error fetching market data:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch market data',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Helper function to format large numbers
function formatNumber(num: number): string {
  if (num >= 1_000_000_000_000) {
    return (num / 1_000_000_000_000).toFixed(1) + 'T';
  } else if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1) + 'B';
  } else if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + 'M';
  } else if (num >= 1_000) {
    return (num / 1_000).toFixed(1) + 'K';
  } else {
    return num.toString();
  }
}
