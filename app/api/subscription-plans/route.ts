import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/authOptions';

const prisma = new PrismaClient();

// GET - Fetch all active subscription plans
export async function GET() {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        price: 'asc',
      },
    });
    
    return NextResponse.json(plans);
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new subscription plan (admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { name, description, price, currency, interval, intervalCount, features } = await req.json();
    
    if (!name || !price || !interval) {
      return NextResponse.json({ error: 'Name, price, and interval are required' }, { status: 400 });
    }
    
    const plan = await prisma.subscriptionPlan.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        currency: currency || 'USD',
        interval,
        intervalCount: intervalCount || 1,
        features: features || [],
        isActive: true,
      },
    });
    
    return NextResponse.json(plan);
  } catch (error) {
    console.error('Error creating subscription plan:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
