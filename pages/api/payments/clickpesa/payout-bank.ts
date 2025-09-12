import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const CLICKPESA_BASE_URL = 'https://api.clickpesa.com/third-parties';
const CLICKPESA_CLIENT_ID = process.env.CLICKPESA_CLIENT_ID;
const CLICKPESA_API_KEY = process.env.CLICKPESA_API_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { amount, accountNumber, bic, transferType, payoutType, orderReference } = req.body;

  if (!amount || !accountNumber || !bic || !transferType || !payoutType) {
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

    // 2. Prepare payout request
    const ref = orderReference || `PAYOUT-BANK-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
    // TODO: Implement checksum logic as per ClickPesa docs
    const checksum = 'TODO_CHECKSUM';

    let payoutResp;
    if (payoutType === 'preview') {
      payoutResp = await axios.post(
        `${CLICKPESA_BASE_URL}/payouts/preview-bank-payout`,
        {
          amount: amount,
          accountNumber,
          currency: 'TZS',
          orderReference: ref,
          bic,
          transferType,
          checksum,
        },
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        }
      );
    } else if (payoutType === 'create') {
      payoutResp = await axios.post(
        `${CLICKPESA_BASE_URL}/payouts/create-bank-payout`,
        {
          amount: amount,
          accountNumber,
          currency: 'TZS',
          orderReference: ref,
          bic,
          transferType,
          checksum,
        },
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        }
      );
    } else {
      return res.status(400).json({ success: false, message: 'Invalid payoutType' });
    }

    return res.status(200).json({
      success: true,
      data: payoutResp.data,
      orderReference: ref,
    });
  } catch (error: any) {
    console.error('ClickPesa Bank Payout API error:', error?.response?.data || error);
    return res.status(500).json({
      success: false,
      message: error?.response?.data?.message || 'Internal server error',
    });
  }
} 