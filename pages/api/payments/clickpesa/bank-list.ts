import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const CLICKPESA_BASE_URL = 'https://api.clickpesa.com/third-parties';
const CLICKPESA_CLIENT_ID = process.env.CLICKPESA_CLIENT_ID;
const CLICKPESA_API_KEY = process.env.CLICKPESA_API_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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

    // 2. Get bank list
    const bankListResp = await axios.get(
      `${CLICKPESA_BASE_URL}/list/banks`,
      {
        headers: {
          Authorization: token,
        },
      }
    );

    return res.status(200).json({
      success: true,
      data: bankListResp.data,
    });
  } catch (error: any) {
    console.error('ClickPesa Bank List API error:', error?.response?.data || error);
    return res.status(500).json({
      success: false,
      message: error?.response?.data?.message || 'Internal server error',
    });
  }
} 