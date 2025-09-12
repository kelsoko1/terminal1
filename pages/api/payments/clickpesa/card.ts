import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const CLICKPESA_BASE_URL = 'https://api.clickpesa.com/third-parties';
const CLICKPESA_CLIENT_ID = process.env.CLICKPESA_CLIENT_ID;
const CLICKPESA_API_KEY = process.env.CLICKPESA_API_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { amount, cardNumber, cardExpiry, cardCVC, cardName, orderReference, email } = req.body;

  if (!amount || !cardNumber || !cardExpiry || !cardCVC || !cardName) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    // 1. Generate ClickPesa JWT token
    const tokenResp = await axios.post(
      `${CLICKPESA_BASE_URL}/generate-token`,
      {},
      {
        headers: {
          'client-id': CLICKPESA_CLIENT_ID,
          'api-key': CLICKPESA_API_KEY,
        },
      }
    );
    const token = tokenResp.data.token;

    // 2. Prepare Card Payment request
    const ref = orderReference || `WALLET-CARD-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
    // TODO: Implement checksum logic as per ClickPesa docs
    const checksum = 'TODO_CHECKSUM';

    const cardResp = await axios.post(
      `${CLICKPESA_BASE_URL}/payments/initiate-card-payment`,
      {
        amount: amount.toString(),
        currency: 'TZS',
        orderReference: ref,
        cardNumber,
        cardExpiry,
        cardCVC,
        cardName,
        email,
        checksum,
      },
      {
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
        },
      }
    );

    if (cardResp.data && cardResp.data.id) {
      return res.status(200).json({
        success: true,
        message: 'Card payment initiated. Please complete the payment.',
        transactionId: cardResp.data.id,
        orderReference: ref,
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to initiate card payment',
      });
    }
  } catch (error: any) {
    console.error('ClickPesa Card API error:', error?.response?.data || error);
    return res.status(500).json({
      success: false,
      message: error?.response?.data?.message || 'Internal server error',
    });
  }
} 