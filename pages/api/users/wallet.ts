import { NextApiRequest, NextApiResponse } from 'next';
import { walletService, WalletTransaction } from '@/lib/firebase/services/walletService';

type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

// Helper function to send consistent API responses
// Helper function to send consistent API responses
const sendResponse = <T>(
  res: NextApiResponse,
  status: number,
  data?: T,
  error?: string,
  message?: string
) => {
  const response: ApiResponse<T> = {
    success: status >= 200 && status < 300,
  };
  
  if (data) response.data = data;
  if (error) response.error = error;
  if (message) response.message = message;
  
  return res.status(status).json(response);
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Set common headers
  res.setHeader('Content-Type', 'application/json');

  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return handleGetRequest(req, res);
    case 'POST':
      return handlePostRequest(req, res);
    default:
      return sendResponse(
        res,
        405,
        undefined,
        'Method Not Allowed',
        'Only GET and POST methods are supported'
      );
  }
}

// Handle GET /api/users/wallet?userId=:userId
async function handleGetRequest(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<{ balance: number; transactions: WalletTransaction[] }>>
) {
  try {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      return sendResponse(
        res,
        400,
        undefined,
        'Bad Request',
        'User ID is required and must be a string'
      );
    }

    // Get wallet balance and recent transactions in parallel
    const [balance, transactions] = await Promise.all([
      walletService.getWalletBalance(userId),
      walletService.getRecentTransactions(userId, 10)
    ]);

    return sendResponse(
      res,
      200,
      { balance, transactions },
      undefined,
      'Wallet data retrieved successfully'
    );
  } catch (error) {
    console.error('Error fetching wallet data:', error);
    return sendResponse(
      res,
      500,
      undefined,
      'Internal Server Error',
      error instanceof Error ? error.message : 'Failed to fetch wallet data'
    );
  }
}

// Handle POST /api/users/wallet?userId=:userId
async function handlePostRequest(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<{ transaction: WalletTransaction; balance: number }>>
) {
  try {
    const { userId } = req.query;
    const { amount, description, type, referenceId, metadata } = req.body;

    // Input validation
    if (!userId || typeof userId !== 'string') {
      return sendResponse(
        res,
        400,
        undefined,
        'Bad Request',
        'User ID is required and must be a string'
      );
    }

    if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
      return sendResponse(
        res,
        400,
        undefined,
        'Bad Request',
        'A valid positive amount is required'
      );
    }

    if (!['deposit', 'withdrawal'].includes(type)) {
      return sendResponse(
        res,
        400,
        undefined,
        'Bad Request',
        'Invalid transaction type. Must be "deposit" or "withdrawal"'
      );
    }

    // Process the transaction based on type
    let transaction: WalletTransaction;
    
    try {
      if (type === 'deposit') {
        transaction = await walletService.addFunds(
          userId,
          amount,
          'api',
          referenceId,
          { ...metadata, description: description || 'API deposit' }
        );
      } else {
        transaction = await walletService.withdrawFunds(
          userId,
          amount,
          'api',
          referenceId,
          { ...metadata, description: description || 'API withdrawal' }
        );
      }

      // Get updated balance
      const balance = await walletService.getWalletBalance(userId);

      return sendResponse(
        res,
        201,
        { transaction, balance },
        undefined,
        `Successfully processed ${type}`
      );
    } catch (error) {
      if (error instanceof Error && error.message.includes('Insufficient funds')) {
        return sendResponse(
          res,
          400,
          undefined,
          'Insufficient Funds',
          'You do not have enough balance for this withdrawal'
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Error processing wallet transaction:', error);
    
    // Handle specific error cases
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    let status = 500;
    
    if (errorMessage.includes('must be greater than 0') || 
        errorMessage.includes('valid positive amount')) {
      status = 400;
    }

    return sendResponse(
      res,
      status,
      undefined,
      'Transaction Failed',
      errorMessage
    );
  }
}

// Extend the Next.js API response type
type ExtendedApiResponse<T = any> = NextApiResponse<T> & {
  status: (code: number) => ExtendedApiResponse<T>;
};
