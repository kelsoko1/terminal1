import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/authOptions'
import { marginTradeService } from '@/lib/services/marginTradeService'
import { z } from 'zod'

// Schema for creating a new margin position
const createPositionSchema = z.object({
  symbol: z.string().min(1),
  type: z.enum(['LONG', 'SHORT']),
  amount: z.number().positive(),
  leverage: z.number().min(1).max(100),
  stopLoss: z.number().optional(),
  takeProfit: z.number().optional(),
})

// Schema for updating a margin position
const updatePositionSchema = z.object({
  positionId: z.string().uuid(),
  action: z.enum(['CLOSE', 'ADD_MARGIN']),
  amount: z.number().positive().optional(),
})

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

  // Handle GET request - get all positions
  if (req.method === 'GET') {
    try {
      const positions = await marginTradeService.getPositions(userId)
      return res.status(200).json({ positions })
    } catch (error) {
      console.error('Error fetching margin positions:', error)
      return res.status(500).json({ error: 'Failed to fetch margin positions' })
    }
  }

  // Handle POST request - create new position
  if (req.method === 'POST') {
    try {
      const validatedData = createPositionSchema.parse(req.body)
      
      const success = await marginTradeService.placeTrade({
        userId,
        ...validatedData,
      })

      if (success) {
        return res.status(201).json({ message: 'Position created successfully' })
      } else {
        return res.status(400).json({ error: 'Failed to create position' })
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors })
      }
      console.error('Error creating margin position:', error)
      return res.status(500).json({ error: 'Failed to create margin position' })
    }
  }

  // Handle PUT request - update position (close or add margin)
  if (req.method === 'PUT') {
    try {
      const validatedData = updatePositionSchema.parse(req.body)
      
      if (validatedData.action === 'CLOSE') {
        const success = await marginTradeService.closePosition(validatedData.positionId)
        
        if (success) {
          return res.status(200).json({ message: 'Position closed successfully' })
        } else {
          return res.status(400).json({ error: 'Failed to close position' })
        }
      } else if (validatedData.action === 'ADD_MARGIN' && validatedData.amount) {
        const success = await marginTradeService.addMargin(
          validatedData.positionId, 
          validatedData.amount
        )
        
        if (success) {
          return res.status(200).json({ message: 'Margin added successfully' })
        } else {
          return res.status(400).json({ error: 'Failed to add margin' })
        }
      } else {
        return res.status(400).json({ error: 'Invalid action or missing amount' })
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors })
      }
      console.error('Error updating margin position:', error)
      return res.status(500).json({ error: 'Failed to update margin position' })
    }
  }

  // Method not allowed
  return res.status(405).json({ error: 'Method not allowed' })
}
