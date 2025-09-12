import React from 'react';
import { Metadata } from 'next';
import { getAuth } from 'firebase/auth';
// Removed PrismaClient import. Use Firestore/Firebase logic instead.
import { CheckoutForm } from '@/components/subscription/CheckoutForm';

export const metadata: Metadata = {
  title: 'Subscription Checkout',
  description: 'Complete your subscription purchase',
};

import { adminDb } from '@/lib/firebase/admin';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  isActive: boolean;
  features: string[];
  interval?: string;
  currency?: string;
}

async function getSubscriptionPlan(planId: string): Promise<SubscriptionPlan | null> {
  try {
    const doc = await adminDb.collection('subscriptionPlans').doc(planId).get();
    if (!doc.exists) return null;
    const data = doc.data();
    return { id: doc.id, ...data } as SubscriptionPlan;
  } catch (error) {
    console.error('Error fetching plan:', error);
    return null;
  }
}

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: { planId: string };
}) {
  const { planId } = searchParams;
  
  if (!planId) {
    // Handle error or redirect
  }
  
  const plan = await getSubscriptionPlan(planId);
  
  if (!plan) {
    return (
      <div className="container max-w-3xl py-10">
        <h1 className="text-3xl font-bold mb-4">Checkout</h1>
        <div className="bg-white rounded-lg shadow p-6 text-red-500">
          Subscription plan not found.
        </div>
      </div>
    );
  }
  
  return (
    <div className="container max-w-3xl py-10">
      <div className="space-y-4 mb-8">
        <h1 className="text-3xl font-bold">Complete Your Subscription</h1>
        <p className="text-muted-foreground">
          You are subscribing to the {plan!.name} plan.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="bg-muted p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Plan:</span>
                <span className="font-medium">{plan!.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Billing Period:</span>
                <span className="font-medium">
                  {plan!.interval === 'MONTHLY' 
                    ? 'Monthly' 
                    : plan!.interval === 'QUARTERLY' 
                      ? 'Quarterly' 
                      : plan!.interval === 'YEARLY' 
                        ? 'Yearly' 
                        : 'month'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Amount:</span>
                <span className="font-medium">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: plan!.currency || 'USD',
                  }).format(plan!.price)}
                </span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: plan!.currency || 'USD',
                    }).format(plan!.price)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="font-medium mb-2">Features included:</h3>
              <ul className="space-y-1">
                {plan!.features.map((feature: string, index: number) => (
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
          <CheckoutForm plan={{ id: plan!.id, name: plan!.name, price: plan!.price, currency: plan!.currency || 'USD' }} />
        </div>
      </div>
    </div>
  );
}
