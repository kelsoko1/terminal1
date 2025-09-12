import { NextApiRequest, NextApiResponse } from 'next'
import { prismaRemote } from '@/lib/prisma'
import { verifyAuthToken } from '@/lib/auth/auth-utils'
import { logger } from '@/lib/logger'
import { redis } from '@/lib/redis'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const startTime = performance.now()
  
  // Set appropriate CORS headers for production
  res.setHeader('Access-Control-Allow-Methods', 'GET')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Verify authentication and authorization
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' })
    }
    
    const token = authHeader.split(' ')[1]
    const user = await verifyAuthToken(token)
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid authentication token' })
    }
    
    // Check if user has admin permissions
    const allowedRoles = ['admin', 'broker', 'hr', 'kelsoko_admin']
    if (!allowedRoles.includes(user.role)) {
      logger.warn(`Unauthorized access attempt to users list by user ${user.id}`)
      return res.status(403).json({ error: 'Insufficient permissions' })
    }
    
    // Check cache first
    const cacheKey = `users:list:${user.id}`
    const cachedData = await redis.get(cacheKey)
    
    if (cachedData) {
      logger.info(`Serving users list from cache for user ${user.id}`)
      return res.status(200).json(JSON.parse(cachedData))
    }
    
    // Get pagination parameters
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const offset = (page - 1) * limit
    
    // Get filter parameters
    const role = req.query.role as string
    const status = req.query.status as string
    const search = req.query.search as string
    
    // Build where clause for filtering
    const whereClause: any = {}
    
    if (role) {
      whereClause.role = role
    }
    
    if (status) {
      whereClause.status = status
    }
    
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    // Get users with pagination and filtering
    const [users, totalCount] = await Promise.all([
      prismaRemote.user.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          department: true,
          contactNumber: true,
          // Don't include sensitive fields like password
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      }),
      prismaRemote.user.count({ where: whereClause })
    ])
    
    // Prepare response data
    const responseData = {
      users,
      pagination: {
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
        currentPage: page,
        limit
      }
    }
    
    // Cache the results (expire after 5 minutes)
    await redis.set(cacheKey, JSON.stringify(responseData), 'EX', 300)
    
    // Log performance metrics
    const endTime = performance.now()
    logger.info(`Users list API request completed in ${(endTime - startTime).toFixed(2)}ms`)
    
    return res.status(200).json(responseData)
  } catch (error: unknown) {
    logger.error('Error fetching users list:', error)
    
    // Handle different types of errors appropriately
    if (error instanceof Error) {
      if (error.name === 'PrismaClientKnownRequestError') {
        // Database query error
        const prismaError = error as unknown as { code: string }
        return res.status(500).json({ 
          error: 'Database query failed',
          code: prismaError.code,
          message: 'There was an issue with the database query'
        })
      } else if (error.name === 'JsonWebTokenError') {
        // JWT validation error
        return res.status(401).json({ 
          error: 'Authentication failed',
          message: 'Invalid authentication token'
        })
      } else {
        // Known error with a message
        return res.status(500).json({ 
          error: 'Failed to fetch users list',
          message: error.message || 'An unexpected error occurred while processing your request'
        })
      }
    } else {
      // Unknown error type
      return res.status(500).json({ 
        error: 'Failed to fetch users list',
        message: 'An unexpected error occurred while processing your request'
      })
    }
  }
}
