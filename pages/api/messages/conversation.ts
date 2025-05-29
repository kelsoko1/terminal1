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
  const { otherUserId } = req.query

  if (!otherUserId || typeof otherUserId !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid otherUserId parameter' })
  }

  if (req.method === 'GET') {
    try {
      // Get all messages between the current user and the other user
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            {
              senderId: userId,
              receiverId: otherUserId
            },
            {
              senderId: otherUserId,
              receiverId: userId
            }
          ]
        },
        orderBy: {
          createdAt: 'asc'
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              image: true
            }
          }
        }
      })

      // Mark unread messages as read
      await prisma.message.updateMany({
        where: {
          senderId: otherUserId,
          receiverId: userId,
          read: false
        },
        data: {
          read: true
        }
      })

      return res.status(200).json(messages)
    } catch (error) {
      console.error('Error fetching conversation messages:', error)
      return res.status(500).json({ error: 'Failed to fetch conversation messages' })
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' })
  }
}
