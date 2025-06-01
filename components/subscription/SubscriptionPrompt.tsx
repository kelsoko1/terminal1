"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useSubscriptionStore } from '@/lib/store/subscriptionStore';
import { Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const SubscriptionPrompt = () => {
  const { 
    availablePlans, 
    showSubscriptionPrompt, 
    hideSubscriptionPrompt, 
    upgradeSubscription,
    isLoading
  } = useSubscriptionStore();
  
  const router = useRouter();

  const handleSubscribe = async (planId: string) => {
    try {
      await upgradeSubscription(planId);
      hideSubscriptionPrompt();
      // Optionally redirect to a success page
      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to subscribe:', error);
    }
  };

  return (
    <Dialog open={showSubscriptionPrompt} onOpenChange={hideSubscriptionPrompt}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Subscription Required</DialogTitle>
          <DialogDescription className="text-lg">
            Please subscribe to one of our plans to access premium features.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          {availablePlans.map((plan) => (
            <Card key={plan.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription className="text-md">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="text-3xl font-bold mb-4">
                  ${plan.price.toFixed(2)}<span className="text-sm font-normal">/{plan.interval.toLowerCase()}</span>
                </div>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : `Subscribe to ${plan.name}`}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionPrompt;
