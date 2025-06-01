"use client";

import { useEffect } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { useSubscriptionStore } from '@/lib/store/subscriptionStore';

export const SubscriptionInitializer = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { fetchSubscriptionData } = useSubscriptionStore();
  
  useEffect(() => {
    // Only fetch subscription data if the user is authenticated
    if (isAuthenticated && user && !isLoading) {
      fetchSubscriptionData().catch(error => {
        console.error('Failed to fetch subscription data:', error);
      });
    }
  }, [isAuthenticated, user, isLoading, fetchSubscriptionData]);
  
  // This is a utility component that doesn't render anything
  return null;
};

export default SubscriptionInitializer;
