import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/authOptions'
import prisma from '@/lib/prisma'

// Using the custom Prisma client from lib/prisma

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)

  if (!session || !session.user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const userId = session.user.id

  if (req.method === 'POST') {
    try {
      const { messageId } = req.body

      if (!messageId) {
        return res.status(400).json({ error: 'Missing messageId' })
      }

      // Verify the message exists and belongs to the user
      const message = await prisma.message.findUnique({
        where: { id: messageId }
      })

      if (!message) {
        return res.status(404).json({ error: 'Message not found' })
      }

      // Only the receiver can mark a message as read
      if (message.receiverId !== userId) {
        return res.status(403).json({ error: 'Forbidden' })
      }

      // Mark the message as read
      await prisma.message.update({
        where: { id: messageId },
        data: { read: true }
      })

      return res.status(200).json({ success: true })
    } catch (error) {
      console.error('Error marking message as read:', error)
      return res.status(500).json({ error: 'Failed to mark message as read' })
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' })
  }
}
