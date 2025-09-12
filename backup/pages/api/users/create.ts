import { NextApiRequest, NextApiResponse } from 'next'
import { prismaRemote } from '@/lib/prisma'
import { verifyAuthToken } from '@/lib/auth/auth-utils'
import { logger } from '@/lib/logger'
import { hash } from 'bcrypt'
import { z } from 'zod'

// Define validation schema for user creation
const userCreateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['investor', 'broker', 'trader', 'hr', 'accounting', 'admin']),
  department: z.string().optional(),
  contactNumber: z.string().optional(),
  licenseNumber: z.string().optional(),
  permissions: z.array(z.string()).optional(),
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const startTime = performance.now()
  
  // Set appropriate CORS headers for production
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  if (req.method !== 'POST') {
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
    const allowedRoles = ['admin', 'hr', 'kelsoko_admin']
    if (!allowedRoles.includes(user.role)) {
      logger.warn(`Unauthorized user creation attempt by user ${user.id}`)
      return res.status(403).json({ error: 'Insufficient permissions' })
    }
    
    // Validate request body
    const validationResult = userCreateSchema.safeParse(req.body)
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationResult.error.format() 
      })
    }
    
    const userData = validationResult.data
    
    // Check if email already exists
    const existingUser = await prismaRemote.user.findUnique({
      where: { email: userData.email }
    })
    
    if (existingUser) {
      return res.status(409).json({ error: 'Email already in use' })
    }
    
    // Hash password
    const saltRounds = 10
    const hashedPassword = await hash(userData.password, saltRounds)
    
    // Create user with transaction to ensure data consistency
    const newUser = await prismaRemote.$transaction(async (tx) => {
      // Create the user
      const createdUser = await tx.user.create({
        data: {
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          role: userData.role,
          status: 'active',
          department: userData.department || null,
          contactNumber: userData.contactNumber || null,
          licenseNumber: userData.licenseNumber || null,
          // Add organization ID if needed
          // organizationId: user.organizationId,
        },
      })
      
      // Create user permissions if provided
      if (userData.permissions && userData.permissions.length > 0) {
        await tx.userPermission.createMany({
          data: userData.permissions.map(permission => ({
            userId: createdUser.id,
            permission,
            grantedBy: user.id,
          })),
        })
      }
      
      // Log user creation for audit purposes
      await tx.auditLog.create({
        data: {
          action: 'USER_CREATED',
          userId: user.id,
          targetId: createdUser.id,
          details: JSON.stringify({
            name: createdUser.name,
            email: createdUser.email,
            role: createdUser.role,
          }),
        },
      })
      
      return createdUser
    })
    
    // Remove sensitive information before returning
    const { password, ...userWithoutPassword } = newUser
    
    // Log performance metrics
    const endTime = performance.now()
    logger.info(`User creation completed in ${(endTime - startTime).toFixed(2)}ms`)
    
    // Log successful user creation
    logger.info(`User created: ${newUser.id} by admin ${user.id}`)
    
    return res.status(201).json({
      message: 'User created successfully',
      user: userWithoutPassword,
    })
  } catch (error: unknown) {
    logger.error('Error creating user:', error)
    
    // Handle different types of errors appropriately
    if (error instanceof Error) {
      if (error.name === 'PrismaClientKnownRequestError') {
        // Database query error
        const prismaError = error as unknown as { code: string }
        
        // Handle specific Prisma error codes
        if (prismaError.code === 'P2002') {
          return res.status(409).json({ 
            error: 'Conflict',
            message: 'A user with this email already exists'
          })
        }
        
        return res.status(500).json({ 
          error: 'Database error',
          message: 'There was an issue with the database operation'
        })
      } else {
        // Known error with a message
        return res.status(500).json({ 
          error: 'Failed to create user',
          message: error.message || 'An unexpected error occurred while processing your request'
        })
      }
    } else {
      // Unknown error type
      return res.status(500).json({ 
        error: 'Failed to create user',
        message: 'An unexpected error occurred while processing your request'
      })
    }
  }
}
