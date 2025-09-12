import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const CLICKPESA_BASE_URL = 'https://api.clickpesa.com/third-parties';
const CLICKPESA_CLIENT_ID = process.env.CLICKPESA_CLIENT_ID;
const CLICKPESA_API_KEY = process.env.CLICKPESA_API_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { provider, phoneNumber, amount } = req.body;

  if (!provider || !phoneNumber || !amount) {
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

    // 2. Prepare USSD push request
    const orderReference = `WALLET${Date.now()}${Math.floor(Math.random() * 1000000)}`;
    // TODO: Implement checksum logic as per ClickPesa docs
    const checksum = 'TODO_CHECKSUM';

    const ussdResp = await axios.post(
      `${CLICKPESA_BASE_URL}/payments/initiate-ussd-push-request`,
      {
        amount: amount.toString(),
        currency: 'TZS',
        orderReference,
        phoneNumber,
        checksum,
      },
      {
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
        },
      }
    );

    if (ussdResp.data && ussdResp.data.id) {
      return res.status(200).json({
        success: true,
        message: 'USSD push initiated. Please confirm the prompt on your phone.',
        transactionId: ussdResp.data.id,
        orderReference,
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to initiate USSD push',
      });
    }
  } catch (error: any) {
    console.error('ClickPesa USSD API error:', error?.response?.data || error);
    return res.status(500).json({
      success: false,
      message: error?.response?.data?.message || 'Internal server error',
    });
  }
} 