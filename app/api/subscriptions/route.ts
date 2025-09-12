import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/authOptions';
import { subscriptionService } from '@/lib/firebase/services/subscriptionService';
import { SubscriptionStatus, PaymentStatus } from '@/types/subscription';
import { Timestamp } from 'firebase/firestore';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    // Get user's subscription
    const subscription = await subscriptionService.getUserSubscription(session.user.id);
    
    // Get available plans
    const availablePlans = await subscriptionService.getAvailablePlans();
    
    // Check if user needs to subscribe
    const requiresSubscription = !subscription || 
      [SubscriptionStatus.EXPIRED, SubscriptionStatus.CANCELED].includes(subscription.status as SubscriptionStatus);

    return NextResponse.json({
      currentSubscription: subscription,
      plans: availablePlans,
      requiresSubscription
    });

  } catch (error) {
    console.error('Error fetching subscription data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription data' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    const { planId, paymentMethod, billingCycle = 'monthly', trialDays = 0 } = await req.json();

    if (!planId || !paymentMethod) {
      return NextResponse.json(
        { error: 'Plan ID and payment method are required' },
        { status: 400 }
      );
    }

    // Create the subscription
    const subscription = await subscriptionService.createSubscription(
      session.user.id,
      planId,
      paymentMethod,
      billingCycle,
      trialDays
    );

    return NextResponse.json({ subscription });

  } catch (error: any) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to create subscription',
        details: error.details
      },
      { status: error.statusCode || 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    const { subscriptionId, action, ...updates } = await req.json();

    if (!subscriptionId || !action) {
      return NextResponse.json(
        { error: 'Subscription ID and action are required' },
        { status: 400 }
      );
    }

    let updatedSubscription;

    switch (action) {
      case 'cancel':
        updatedSubscription = await subscriptionService.cancelSubscription(subscriptionId, true);
        break;
      case 'update':
        updatedSubscription = await subscriptionService.updateSubscription(subscriptionId, updates);
        break;
      case 'renew':
        // Process renewal payment and update subscription
        const subscription = await subscriptionService.getUserSubscription(session.user.id);
        if (!subscription) {
          throw new Error('Subscription not found');
        }
        
        // In a real app, process payment here
        await subscriptionService.recordPayment(
          subscriptionId,
          PaymentStatus.PAID,
          subscription.amount
        );
        
        let endDate = subscription.endDate;
        if (typeof endDate === 'string' || typeof endDate === 'number') {
          endDate = new Date(endDate);
        } else if (endDate instanceof Timestamp) {
          endDate = endDate.toDate();
        } else if (!(endDate instanceof Date)) {
          endDate = new Date();
        }
        updatedSubscription = await subscriptionService.updateSubscription(subscriptionId, {
          status: SubscriptionStatus.ACTIVE,
          lastPaymentDate: new Date(),
          nextPaymentDate: subscriptionService.calculateEndDate(
            endDate,
            subscription.billingCycle === 'yearly' ? 'year' : 'month'
          )
        });
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({ subscription: updatedSubscription });

  } catch (error: any) {
    console.error('Error updating subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update subscription' },
      { status: error.statusCode || 500 }
    );
  }
}
