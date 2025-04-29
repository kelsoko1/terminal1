import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// GET - Fetch a specific subscription
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const subscription = await prisma.subscription.findUnique({
      where: {
        id: params.id,
      },
      include: {
        plan: true,
        paymentHistory: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 5,
        },
      },
    });
    
    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }
    
    // Ensure the user owns this subscription
    if (subscription.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return NextResponse.json(subscription);
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update a subscription (cancel, toggle auto-renew)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { action } = await req.json();
    
    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    }
    
    // Get the subscription
    const subscription = await prisma.subscription.findUnique({
      where: { id: params.id },
    });
    
    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }
    
    // Ensure the user owns this subscription
    if (subscription.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Handle different actions
    switch (action) {
      case 'cancel':
        // Cancel the subscription
        const canceledSubscription = await prisma.subscription.update({
          where: { id: params.id },
          data: {
            status: 'CANCELED',
            autoRenew: false,
          },
        });
        return NextResponse.json(canceledSubscription);
        
      case 'toggle_auto_renew':
        // Toggle auto-renew setting
        const updatedSubscription = await prisma.subscription.update({
          where: { id: params.id },
          data: {
            autoRenew: !subscription.autoRenew,
          },
        });
        return NextResponse.json(updatedSubscription);
        
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error updating subscription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
