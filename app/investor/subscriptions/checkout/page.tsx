import React from 'react';
import { Metadata } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import { CheckoutForm } from '@/components/subscription/CheckoutForm';

export const metadata: Metadata = {
  title: 'Subscription Checkout',
  description: 'Complete your subscription purchase',
};

async function getSubscriptionPlan(planId: string) {
  const prisma = new PrismaClient();
  
  try {
    const plan = await prisma.subscriptionPlan.findUnique({
      where: {
        id: planId,
        isActive: true,
      },
    });
    
    return plan;
  } catch (error) {
    console.error('Error fetching subscription plan:', error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: { planId: string };
}) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect('/auth/signin?callbackUrl=/investor/subscriptions');
  }
  
  // Check if user is an investor
  if (session.user.role !== 'INVESTOR') {
    redirect('/dashboard');
  }
  
  const { planId } = searchParams;
  
  if (!planId) {
    redirect('/investor/subscriptions');
  }
  
  const plan = await getSubscriptionPlan(planId);
  
  if (!plan) {
    redirect('/investor/subscriptions');
  }
  
  return (
    <div className="container max-w-3xl py-10">
      <div className="space-y-4 mb-8">
        <h1 className="text-3xl font-bold">Complete Your Subscription</h1>
        <p className="text-muted-foreground">
          You are subscribing to the {plan.name} plan.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="bg-muted p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Plan:</span>
                <span className="font-medium">{plan.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Billing Period:</span>
                <span className="font-medium">
                  {plan.interval === 'MONTHLY' 
                    ? 'Monthly' 
                    : plan.interval === 'QUARTERLY' 
                      ? 'Quarterly' 
                      : 'Yearly'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Amount:</span>
                <span className="font-medium">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: plan.currency,
                  }).format(plan.price)}
                </span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: plan.currency,
                    }).format(plan.price)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="font-medium mb-2">Features included:</h3>
              <ul className="space-y-1">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        <div>
          <CheckoutForm plan={plan} userId={session.user.id} />
        </div>
      </div>
    </div>
  );
}
