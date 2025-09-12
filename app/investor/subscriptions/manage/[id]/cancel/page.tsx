import React from 'react';
import { Metadata } from 'next';
import { getAuth } from 'firebase/auth';
// Removed PrismaClient import. Use Firestore/Firebase logic instead.
import { CancelSubscriptionForm } from '@/components/subscription/CancelSubscriptionForm';

export const metadata: Metadata = {
  title: 'Cancel Subscription',
  description: 'Cancel your investor subscription plan',
};

async function getSubscription(id: string, userId: string) {
  const prisma = new PrismaClient();
  
  try {
    const subscription = await prisma.subscription.findUnique({
      where: {
        id,
      },
      include: {
        plan: true,
      },
    });
    
    // Ensure the user owns this subscription
    if (subscription && subscription.userId !== userId) {
      return null;
    }
    
    return subscription;
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}

export default async function CancelSubscriptionPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect('/auth/signin?callbackUrl=/investor/subscriptions/manage');
  }
  
  // Check if user is an investor
  if (session.user.role !== 'INVESTOR') {
    redirect('/dashboard');
  }
  
  const subscription = await getSubscription(params.id, session.user.id);
  
  if (!subscription) {
    redirect('/investor/subscriptions/manage');
  }
  
  // If subscription is already canceled or expired, redirect
  if (subscription.status !== 'ACTIVE') {
    redirect('/investor/subscriptions/manage');
  }
  
  return (
    <div className="container max-w-2xl py-10">
      <div className="space-y-4 mb-8">
        <h1 className="text-3xl font-bold">Cancel Subscription</h1>
        <p className="text-muted-foreground">
          You are about to cancel your {subscription.plan.name} subscription.
        </p>
      </div>
      
      <div className="bg-muted p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Subscription Details</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Plan:</span>
            <span className="font-medium">{subscription.plan.name}</span>
          </div>
          <div className="flex justify-between">
            <span>Status:</span>
            <span className="font-medium">Active</span>
          </div>
          <div className="flex justify-between">
            <span>Start Date:</span>
            <span className="font-medium">
              {new Date(subscription.startDate).toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span>End Date:</span>
            <span className="font-medium">
              {subscription.endDate 
                ? new Date(subscription.endDate).toLocaleDateString() 
                : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Amount:</span>
            <span className="font-medium">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: subscription.plan.currency,
              }).format(subscription.plan.price)}
              /{subscription.plan.interval.toLowerCase()}
            </span>
          </div>
        </div>
      </div>
      
      <div className="bg-destructive/10 p-6 rounded-lg mb-8">
        <h2 className="text-lg font-semibold mb-2">Important Information</h2>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Canceling your subscription will immediately stop your access to premium investor features.</li>
          <li>You will still have access until the end of your current billing period.</li>
          <li>No refunds will be provided for partial billing periods.</li>
          <li>You can resubscribe at any time, but you may lose access to any grandfathered pricing.</li>
        </ul>
      </div>
      
      <CancelSubscriptionForm subscriptionId={subscription.id} />
    </div>
  );
}
