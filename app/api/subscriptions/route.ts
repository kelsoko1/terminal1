import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// GET - Fetch all subscriptions for the current user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const subscriptions = await prisma.subscription.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        plan: true,
      },
    });
    
    return NextResponse.json(subscriptions);
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new subscription
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { planId, paymentMethod } = await req.json();
    
    if (!planId) {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 });
    }
    
    // Get the plan details
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });
    
    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }
    
    // Calculate end date based on plan interval
    let endDate = new Date();
    if (plan.interval === 'MONTHLY') {
      endDate.setMonth(endDate.getMonth() + plan.intervalCount);
    } else if (plan.interval === 'QUARTERLY') {
      endDate.setMonth(endDate.getMonth() + (3 * plan.intervalCount));
    } else if (plan.interval === 'YEARLY') {
      endDate.setFullYear(endDate.getFullYear() + plan.intervalCount);
    }
    
    // Create the subscription
    const subscription = await prisma.subscription.create({
      data: {
        userId: session.user.id,
        planId,
        status: 'ACTIVE',
        startDate: new Date(),
        endDate,
        autoRenew: true,
        paymentMethod,
        nextPaymentDate: endDate,
      },
    });
    
    // Create the initial payment record
    await prisma.payment.create({
      data: {
        subscriptionId: subscription.id,
        amount: plan.price,
        currency: plan.currency,
        status: 'COMPLETED',
        paymentMethod,
        transactionId: `txn_${Date.now()}`,
      },
    });
    
    return NextResponse.json(subscription);
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
