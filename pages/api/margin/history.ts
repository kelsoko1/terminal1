import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/authOptions'
import { marginTradeService } from '@/lib/services/marginTradeService'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Check authentication
  const session = await getServerSession(req, res, authOptions)
  if (!session || !session.user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const userId = session.user.id

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Get position history
    const history = await marginTradeService.getHistory(userId)
    
    // If a positionId is provided, get trades for that position
    const { positionId } = req.query
    
    if (positionId && typeof positionId === 'string') {
      const trades = await marginTradeService.getPositionTrades(positionId)
      return res.status(200).json({ position: history.find(p => p.id === positionId), trades })
    }
    
    return res.status(200).json({ history })
  } catch (error) {
    console.error('Error fetching margin history:', error)
    return res.status(500).json({ error: 'Failed to fetch margin history' })
  }
}
