import { NextResponse } from 'next/server';
import { prismaRemote } from '@/lib/database/prismaClients';
import { verifyAuth } from '@/lib/auth/auth-utils';
import { logger } from '@/lib/logger';

export async function GET(request: Request) {
  try {
    // Get the user ID from the query parameters
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    // Check if user is requesting their own data or has admin privileges
    if (authResult.user.id !== userId && !['admin', 'hr', 'kelsoko_admin'].includes(authResult.user.role)) {
      logger.warn('Unauthorized account access attempt', { 
        requesterId: authResult.user.id,
        targetUserId: userId
      });
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }
    
    // Fetch user from the database
    const user = await prismaRemote.user.findUnique({
      where: { id: userId },
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Extract only the fields we need
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      contactNumber: user.contactNumber,
      department: user.department,
      position: user.position
    };
    
    // Get user's wallet balance
    const wallet = await prismaRemote.$queryRaw`
      SELECT SUM(amount) as balance 
      FROM "Transaction" 
      WHERE "userId" = ${userId}
    `;
    
    const balance = wallet[0]?.balance || 0;
    
    return NextResponse.json({
      user: {
        ...userData,
        balance
      }
    }, { status: 200 });
  } catch (error) {
    logger.error('Error fetching user account', error instanceof Error ? error : new Error(String(error)));
    
    return NextResponse.json({ 
      error: 'Failed to fetch user account',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    // Get the user ID from the query parameters
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    // Check if user is updating their own data or has admin privileges
    if (authResult.user.id !== userId && !['admin', 'hr', 'kelsoko_admin'].includes(authResult.user.role)) {
      logger.warn('Unauthorized account update attempt', { 
        requesterId: authResult.user.id,
        targetUserId: userId
      });
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }
    
    // Parse request body
    const body = await request.json();
    const { name, email, phone, department, position } = body;
    
    // Update user in the database
    const updatedUser = await prismaRemote.user.update({
      where: { id: userId },
      data: {
        name,
        email,
        contactNumber: phone,
        department,
        position,
        updatedAt: new Date()
      }
    });
    
    // Extract only the fields we need for the response
    const userData = {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
      status: updatedUser.status,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
      contactNumber: updatedUser.contactNumber,
      department: updatedUser.department,
      position: updatedUser.position
    };
    
    logger.info('User account updated', { userId, updatedBy: authResult.user.id });
    
    return NextResponse.json({ user: userData }, { status: 200 });
  } catch (error) {
    logger.error('Error updating user account', error instanceof Error ? error : new Error(String(error)));
    
    return NextResponse.json({ 
      error: 'Failed to update user account',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
