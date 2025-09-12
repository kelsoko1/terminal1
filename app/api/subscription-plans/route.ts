import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '../../../lib/firebase/admin';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/authOptions';

// Firestore will be used instead of PrismaClient.

// GET - Fetch all active subscription plans
export async function GET() {
  try {
    // Fetch all active subscription plans from Firestore
    const snap = await adminDb.collection('subscriptionPlans')
      .where('isActive', '==', true)
      .orderBy('price', 'asc')
      .get();
    const plans = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
    
    // Firestore logic to create a new subscription plan
    const newPlan = {
        name,
        description,
        price: parseFloat(price),
        currency: currency || 'USD',
        interval,
        intervalCount: intervalCount || 1,
        features: features || [],
        isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const docRef = await adminDb.collection('subscriptionPlans').add(newPlan);
    const plan = await docRef.get();
    return NextResponse.json({ id: plan.id, ...plan.data() });
  } catch (error) {
    console.error('Error creating subscription plan:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
