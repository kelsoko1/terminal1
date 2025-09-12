import { NextApiRequest, NextApiResponse } from 'next';
import { getFirestore } from 'firebase-admin/firestore';
// import { UserPortfolio } from '@/lib/types'; // Remove duplicate import
const db = getFirestore();

// Define UserPortfolio type inline to avoid import issues
type UserPortfolio = {
  [symbol: string]: {
    quantity: number;
    averagePrice: number;
  };
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    console.log('Fetching trades for user:', userId);
    // Fetch user's trades to calculate portfolio
    const tradesSnapshot = await db.collection('trades')
      .where('userId', '==', userId)
      .where('status', '==', 'COMPLETED')
      .orderBy('createdAt', 'desc')
      .get();
    const trades = tradesSnapshot.docs.map(doc => doc.data());
    console.log('Fetched trades:', trades);
    
    // Calculate portfolio positions
    const portfolio: UserPortfolio = {};
    
    // Process trades to build portfolio
    if (Array.isArray(trades) && trades.length > 0) {
      trades.forEach((trade: any) => {
        // Ensure we have the required properties
        const symbol = trade.symbol as string;
        const quantity = Number(trade.quantity);
        const price = Number(trade.price);
        const type = trade.type as string;
        
        if (!symbol || isNaN(quantity) || isNaN(price)) {
          return; // Skip invalid trades
        }
        
        if (!portfolio[symbol]) {
          portfolio[symbol] = { quantity: 0, averagePrice: 0 };
        }
        
        const position = portfolio[symbol];
        
        if (type === 'BUY') {
          // Calculate new average price when buying
          const totalValue = position.quantity * position.averagePrice + quantity * price;
          const newQuantity = position.quantity + quantity;
          position.averagePrice = newQuantity > 0 ? totalValue / newQuantity : 0;
          position.quantity = newQuantity;
        } else if (type === 'SELL') {
          // Reduce quantity when selling (average price stays the same)
          position.quantity -= quantity;
          
          // Remove position if quantity is zero or negative
          if (position.quantity <= 0) {
            delete portfolio[symbol];
          }
        }
      });
    } else {
      // No trades found, return empty portfolio
      return res.status(200).json({ 
        portfolio: {},
        performance: { totalValue: 0, totalGainLoss: 0, holdings: [] }
      });
    }

    console.log('Portfolio after processing trades:', portfolio);

    // Fetch current stock prices for calculating current value
    const stocksSnapshot = await db.collection('stocks')
      .where('isActive', '==', true)
      .get();
    const stocks = stocksSnapshot.docs.map(doc => doc.data());
    console.log('Fetched stocks:', stocks);
    // Create a map of stock prices
    const stockPrices = new Map();
    stocks.forEach((stock: any) => {
      if (stock && stock.symbol && typeof stock.price === 'number') {
        stockPrices.set(stock.symbol, Number(stock.price));
      }
    });

    // Calculate performance metrics
    const holdings = Object.entries(portfolio).map(([symbol, position]) => {
      const currentPrice = Number(stockPrices.get(symbol) || 0);
      const value = position.quantity * currentPrice;
      const costBasis = position.quantity * position.averagePrice;
      const gainLoss = value - costBasis;
      
      return {
        symbol,
        quantity: position.quantity,
        averagePrice: position.averagePrice,
        currentPrice,
        value,
        gainLoss
      };
    });
    
    // Calculate total portfolio value and gain/loss
    const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);
    const totalGainLoss = holdings.reduce((sum, h) => sum + h.gainLoss, 0);
    
    return res.status(200).json({ 
      portfolio,
      performance: {
        totalValue,
        totalGainLoss,
        holdings
      }
    });
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch portfolio',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
