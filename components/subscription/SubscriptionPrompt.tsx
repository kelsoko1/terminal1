"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useSubscriptionStore } from '@/lib/store/subscriptionStore';
import { Check, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { subscriptionNotificationService } from '@/lib/services/subscriptionNotificationService';
import type { SubscriptionPlanDetails } from '@/types/subscription';

export const SubscriptionPrompt = () => {
  const { 
    availablePlans, 
    showSubscriptionPrompt, 
    hideSubscriptionPrompt, 
    upgradeSubscription,
    isLoading
  } = useSubscriptionStore();
  
  const router = useRouter();

  const [isSubscribing, setIsSubscribing] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubscribe = async (planId: string, planName: string) => {
    try {
      setIsSubscribing(planId);
      
      // In a real app, you would integrate with a payment provider here
      // For now, we'll simulate a successful subscription
      const subscription = await upgradeSubscription(planId, 'pm_card_visa'); // Default test payment method
      
      if (subscription) {
        subscriptionNotificationService.showSubscriptionSuccess(planName);
        hideSubscriptionPrompt();
        router.refresh(); // Refresh to update any subscription-protected content
      } else {
        throw new Error('Failed to create subscription');
      }
    } catch (error) {
      console.error('Failed to subscribe:', error);
      subscriptionNotificationService.showSubscriptionError(
        error instanceof Error ? error.message : 'Failed to process your subscription. Please try again.'
      );
    } finally {
      setIsSubscribing(null);
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
          {availablePlans.map((plan: SubscriptionPlanDetails) => (
            <Card key={plan.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription className="text-md">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="text-3xl font-bold mb-4">
                  ${plan.price.toFixed(2)}<span className="text-sm font-normal">/{plan.billingCycle?.toLowerCase() || 'month'}</span>
                </div>
                <ul className="space-y-2">
                  {plan.features?.map((feature: string, index: number) => (
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
                  onClick={() => handleSubscribe(plan.id, plan.name)}
                  disabled={isLoading || !!isSubscribing}
                >
                  {isSubscribing === plan.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Subscribe'
                  )}
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
