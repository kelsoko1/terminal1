import { NextApiRequest, NextApiResponse } from 'next';
import { prismaRemote } from '../../../lib/database/prismaClients';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Fetch stocks from the database
    // In a real implementation, you would have a stocks table in your database
    // For now, we'll fetch from a hypothetical stocks table
    // You'll need to create this table in your Prisma schema
    
    // Example query using Prisma
    const stocks = await prismaRemote.$queryRaw`
      SELECT 
        s.symbol, 
        s.name, 
        s.price, 
        s.previous_price as "previousPrice", 
        s.percentage_change as "percentageChange",
        s.volume
      FROM stocks s
      ORDER BY s.symbol ASC
    `;

    // Return the stocks data
    return res.status(200).json({ 
      stocks,
      marketCap: "TZS 2.8T", // You would calculate this from actual data
      tradingVolume: "TZS 84.5B", // You would calculate this from actual data
      marketStatus: "Open", // You would determine this based on trading hours
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching stocks:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch stocks',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
