import { NextApiRequest, NextApiResponse } from 'next';
import { tradingService } from '@/lib/firebase/services/tradingService';
import { walletService } from '@/lib/firebase/services/walletService';

// Helper function to send consistent API responses
const sendResponse = <T>(
  res: NextApiResponse,
  status: number,
  data?: T,
  error?: string,
  message?: string
) => {
  const response = {
    success: status >= 200 && status < 300,
    data,
    error,
    message
  };
  
  return res.status(status).json(response);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return handleGetRequest(req, res);
      case 'POST':
        return handlePostRequest(req, res);
      default:
        return sendResponse(res, 405, undefined, 'Method Not Allowed', 'Only GET and POST methods are supported');
    }
  } catch (error) {
    console.error('API Error:', error);
    return sendResponse(res, 500, undefined, 'Internal Server Error', 'An unexpected error occurred');
  }
}

// Handle GET /api/trading/trades?userId=<userId>
async function handleGetRequest(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { userId } = req.query;
    
    let trades;
    if (userId) {
      trades = await tradingService.getUserTrades(userId as string);
    } else {
      // In a real app, you might want to restrict this to admin users
      trades = await tradingService.list([], { field: 'executedAt', direction: 'desc' });
    }
    
    return sendResponse(res, 200, { trades });
  } catch (error) {
    console.error('Failed to fetch trades:', error);
    return sendResponse(res, 500, undefined, 'Failed to fetch trades');
  }
}

// Handle POST /api/trading/trades
async function handlePostRequest(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { userId, symbol, quantity, price, type } = req.body;

    // Validate required fields
    if (!userId || !symbol || !quantity || !price || !type) {
      return sendResponse(res, 400, undefined, 'Missing required fields');
    }

    // Convert to numbers
    const numericQuantity = Number(quantity);
    const numericPrice = Number(price);

    if (isNaN(numericQuantity) || isNaN(numericPrice)) {
      return sendResponse(res, 400, undefined, 'Invalid quantity or price');
    }

    // Calculate total cost
    const totalCost = numericQuantity * numericPrice;

    // For buy orders, check user balance
    if (type === 'BUY') {
      const balance = await walletService.getWalletBalance(userId);
      if (balance < totalCost) {
        return sendResponse(res, 400, undefined, 'Insufficient funds');
      }
      
      // Deduct from wallet
      await walletService.withdrawFunds(
        userId,
        totalCost,
        'trading',
        `BUY ${quantity} ${symbol} @ ${price}`
      );
    }

    // Execute the trade
    const trade = await tradingService.executeTrade(
      userId,
      symbol,
      numericQuantity,
      numericPrice,
      type as any // Type assertion since we've validated the type
    );

    // For sell orders, credit the wallet
    if (type === 'SELL') {
      await walletService.addFunds(
        userId,
        totalCost,
        'trading',
        `SELL ${quantity} ${symbol} @ ${price}`
      );
    }

    return sendResponse(res, 201, { trade }, undefined, 'Trade executed successfully');
  } catch (error) {
    console.error('Failed to execute trade:', error);
    return sendResponse(
      res, 
      500, 
      undefined, 
      'Failed to execute trade',
      error instanceof Error ? error.message : 'An unexpected error occurred'
    );
  }
}
