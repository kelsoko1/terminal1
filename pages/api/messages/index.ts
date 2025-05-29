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

  if (req.method === 'GET') {
    try {
      // Get all messages for the current user (sent or received)
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: userId },
            { receiverId: userId }
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
          },
          receiver: {
            select: {
              id: true,
              name: true,
              image: true
            }
          }
        }
      })

      return res.status(200).json(messages)
    } catch (error) {
      console.error('Error fetching messages:', error)
      return res.status(500).json({ error: 'Failed to fetch messages' })
    }
  } else if (req.method === 'POST') {
    try {
      const { receiverId, content } = req.body

      if (!receiverId || !content) {
        return res.status(400).json({ error: 'Missing required fields' })
      }

      // Create a new message
      const message = await prisma.message.create({
        data: {
          senderId: userId,
          receiverId,
          content,
          read: false
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              image: true
            }
          },
          receiver: {
            select: {
              id: true,
              name: true,
              image: true
            }
          }
        }
      })

      return res.status(201).json(message)
    } catch (error) {
      console.error('Error sending message:', error)
      return res.status(500).json({ error: 'Failed to send message' })
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' })
  }
}
