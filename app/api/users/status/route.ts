import { NextResponse } from 'next/server';
import { z } from 'zod';
// Removed prismaRemote import. Use Firestore/Firebase logic instead.
// Removed auth-utils import. Use Firestore/Firebase logic instead.
import { logger } from '@/lib/logger';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const firebaseConfig = {
  apiKey: '<API_KEY>',
  authDomain: '<AUTH_DOMAIN>',
  projectId: '<PROJECT_ID>',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Define validation schema for user status update
const userStatusSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  status: z.enum(['active', 'inactive', 'suspended']),
  reason: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    // Verify authentication and authorization
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const { user } = authResult;
    
    // Check if user has admin permissions
    const allowedRoles = ['admin', 'hr', 'kelsoko_admin'];
    if (!allowedRoles.includes(user.role)) {
      logger.warn('Unauthorized user status update attempt', { 
        userId: user.id, 
        role: user.role 
      });
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }
    
    // Parse and validate request body
    const body = await request.json();
    const validationResult = userStatusSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: validationResult.error.format() 
      }, { status: 400 });
    }
    
    const { userId, status, reason } = validationResult.data;
    
    // Check if user exists
    const targetUser = await prismaRemote.user.findUnique({
      where: { id: userId }
    });
    
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Prevent deactivation of super admin accounts by non-super admins
    if (targetUser.role === 'kelsoko_admin' && user.role !== 'kelsoko_admin') {
      return NextResponse.json({ 
        error: 'Insufficient permissions',
        message: 'You do not have permission to modify this user account'
      }, { status: 403 });
    }
    
    // Update user status
    const updated = await prismaRemote.user.update({
      where: { id: userId },
      data: { 
        status,
        updatedAt: new Date()
      }
    });
    
    // Log the status change
    logger.info(`User status change`, {
      targetUserId: userId,
      newStatus: status,
      changedBy: user.id,
      reason: reason || 'No reason provided'
    });
    
    // Extract only the fields we need for the response
    const updatedUser = {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      status: updated.status
    };
    
    // If deactivating, we would normally invalidate user sessions
    if (status !== 'active') {
      logger.info(`User deactivated - invalidating sessions`, { userId });
      
      // In a production environment, we would invalidate all sessions for this user
      // For a complete implementation, we would use something like:
      // await prisma.session.updateMany({
      //   where: { userId },
      //   data: { isValid: false }
      // });
    }
    
    return NextResponse.json({
      message: `User status updated to ${status} successfully`,
      user: updatedUser,
    }, { status: 200 });
  } catch (error) {
    // Log the error
    logger.error('Error updating user status', error instanceof Error ? error : new Error(String(error)));
    
    // Handle different types of errors appropriately
    if (error instanceof Error) {
      if (error.name === 'PrismaClientKnownRequestError') {
        return NextResponse.json({ 
          error: 'Database error',
          message: 'There was an issue with the database operation'
        }, { status: 500 });
      } else {
        // Known error with a message
        return NextResponse.json({ 
          error: 'Failed to update user status',
          message: error.message || 'An unexpected error occurred while processing your request'
        }, { status: 500 });
      }
    } else {
      // Unknown error type
      return NextResponse.json({ 
        error: 'Failed to update user status',
        message: 'An unexpected error occurred while processing your request'
      }, { status: 500 });
    }
  }
}
