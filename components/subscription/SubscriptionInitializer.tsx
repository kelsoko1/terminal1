"use client";

import { useEffect } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { useSubscriptionStore } from '@/lib/store/subscriptionStore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';

export const SubscriptionInitializer = () => {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { 
    fetchSubscriptionData, 
    isLoading: isSubscriptionLoading,
    requiresSubscription,
    showSubscriptionPrompt
  } = useSubscriptionStore();
  const router = useRouter();
  const { toast } = useToast();
  
  useEffect(() => {
    const initializeSubscription = async () => {
      if (!isAuthenticated || !user || isAuthLoading) return;
      
      try {
        await fetchSubscriptionData();
        
        // If user doesn't have an active subscription and we're not currently showing the prompt
        if (requiresSubscription && !showSubscriptionPrompt) {
          // Only show notification if it's not immediately after page load
          setTimeout(() => {
            toast({
              title: "Subscription Required",
              description: "Please subscribe to access premium features.",
              variant: "default",
              duration: 4000,
            });
          }, 1000);
        }
      } catch (error) {
        console.error('Failed to initialize subscription:', error);
        toast({
          title: "Error",
          description: "Failed to load subscription information. Please try again later.",
          variant: "destructive",
        });
      }
    };
    
    initializeSubscription();
  }, [
    isAuthenticated, 
    user, 
    isAuthLoading, 
    fetchSubscriptionData, 
    requiresSubscription, 
    showSubscriptionPrompt, 
    router, 
    toast
  ]);
  
  // Don't render anything if we're still loading
  if (isAuthLoading || isSubscriptionLoading) {
    return null;
  }
  
  return null;
};

export default SubscriptionInitializer;
