import React from 'react';
import { Metadata } from 'next';
import { PlanCard } from '@/components/subscription/PlanCard';
import { getAuth } from 'firebase/auth';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Investor Subscription Plans',
  description: 'Choose a subscription plan to access premium investor features',
};

async function getSubscriptionPlans() {
  const prisma = new PrismaClient();
  
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        price: 'asc',
      },
    });
    
    return plans;
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    return [];
  } finally {
    await prisma.$disconnect();
  }
}

async function getCurrentSubscription(userId: string) {
  const prisma = new PrismaClient();
  
  try {
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
      },
      include: {
        plan: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return subscription;
  } catch (error) {
    console.error('Error fetching current subscription:', error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}

export default async function SubscriptionsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect('/auth/signin?callbackUrl=/investor/subscriptions');
  }
  
  // Check if user is an investor
  if (session.user.role !== 'INVESTOR') {
    redirect('/dashboard');
  }
  
  const plans = await getSubscriptionPlans();
  const currentSubscription = await getCurrentSubscription(session.user.id);
  
  return (
    <div className="container py-10">
      <div className="space-y-4 mb-8">
        <h1 className="text-3xl font-bold">Investor Subscription Plans</h1>
        <p className="text-muted-foreground">
          Choose a subscription plan to access premium investor features and opportunities.
        </p>
      </div>
      
      {currentSubscription && (
        <div className="bg-muted p-4 rounded-lg mb-8">
          <h2 className="font-semibold">Current Subscription</h2>
          <p>
            You are currently subscribed to the <strong>{currentSubscription.plan.name}</strong> plan.
            {currentSubscription.endDate && (
              <> Your subscription will {currentSubscription.autoRenew ? 'renew' : 'expire'} on {new Date(currentSubscription.endDate).toLocaleDateString()}.</>
            )}
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isCurrentPlan={currentSubscription?.planId === plan.id}
            onSelect={(planId) => {
              // This will be handled client-side
              window.location.href = `/investor/subscriptions/checkout?planId=${planId}`;
            }}
          />
        ))}
      </div>
      
      {plans.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No subscription plans available at the moment. Please check back later.</p>
        </div>
      )}
    </div>
  );
}
