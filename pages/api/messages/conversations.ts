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
      // Get all unique conversations for the current user
      const sentMessages = await prisma.message.findMany({
        where: {
          senderId: userId
        },
        orderBy: {
          createdAt: 'desc'
        },
        distinct: ['receiverId'],
        include: {
          receiver: {
            select: {
              id: true,
              name: true,
              image: true,
              email: true
            }
          }
        }
      })

      const receivedMessages = await prisma.message.findMany({
        where: {
          receiverId: userId
        },
        orderBy: {
          createdAt: 'desc'
        },
        distinct: ['senderId'],
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              image: true,
              email: true
            }
          }
        }
      })

      // Combine and deduplicate conversations
      const conversationMap = new Map()

      // Process sent messages
      for (const message of sentMessages) {
        const otherUserId = message.receiverId
        const otherUser = message.receiver
        
        if (!conversationMap.has(otherUserId)) {
          conversationMap.set(otherUserId, {
            id: `conv_${userId}_${otherUserId}`,
            otherUser: {
              id: otherUser.id,
              name: otherUser.name,
              image: otherUser.image,
              email: otherUser.email
            },
            lastMessage: {
              id: message.id,
              content: message.content,
              timestamp: message.createdAt,
              isMine: true
            }
          })
        }
      }

      // Process received messages
      for (const message of receivedMessages) {
        const otherUserId = message.senderId
        const otherUser = message.sender
        
        if (!conversationMap.has(otherUserId) || 
            new Date(message.createdAt) > new Date(conversationMap.get(otherUserId).lastMessage.timestamp)) {
          conversationMap.set(otherUserId, {
            id: `conv_${userId}_${otherUserId}`,
            otherUser: {
              id: otherUser.id,
              name: otherUser.name,
              image: otherUser.image,
              email: otherUser.email
            },
            lastMessage: {
              id: message.id,
              content: message.content,
              timestamp: message.createdAt,
              isMine: false
            }
          })
        }
      }

      // Count unread messages for each conversation
      const conversations = await Promise.all(
        Array.from(conversationMap.entries()).map(async ([otherUserId, conversation]) => {
          const unreadCount = await prisma.message.count({
            where: {
              senderId: otherUserId,
              receiverId: userId,
              read: false
            }
          })
          
          return {
            ...conversation,
            unreadCount
          }
        })
      )

      // Sort conversations by last message timestamp (newest first)
      conversations.sort((a, b) => 
        new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime()
      )

      return res.status(200).json(conversations)
    } catch (error) {
      console.error('Error fetching conversations:', error)
      return res.status(500).json({ error: 'Failed to fetch conversations' })
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' })
  }
}
