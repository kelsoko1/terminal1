import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, AlertCircle, CreditCard, CalendarIcon, Clock, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { formatCurrency, usdToTzs, CURRENCY_CODE } from '@/lib/utils/currency';
import { useSubscriptionStore } from '@/lib/store/subscriptionStore';
import type { 
  Subscription, 
  SubscriptionPlan, 
  Payment as PaymentType,
  SubscriptionPlanDetails,
  Timestamp
} from '@/types/subscription';

// Import enums as values, not types
import { SubscriptionStatus, PaymentStatus } from '@/types/subscription';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from "@/components/ui/skeleton";

// Type guard for Firebase Timestamp
const isFirebaseTimestamp = (value: any): value is { toDate: () => Date } => {
  return value !== null && 
         typeof value === 'object' && 
         'toDate' in value && 
         typeof value.toDate === 'function';
};

export function AccountSubscription() {
  const { toast } = useToast();
  const { 
    subscription, 
    availablePlans, 
    isLoading, 
    error,
    fetchSubscriptionData,
    cancelSubscription,
    upgradeSubscription
  } = useSubscriptionStore();
  
  const [activeTab, setActiveTab] = useState<'current' | 'plans'>('current');
  const [isActionInProgress, setIsActionInProgress] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  // Fetch subscription data on component mount and when subscription changes
  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchSubscriptionData();
      } catch (error) {
        console.error('Failed to load subscription data:', error);
      }
    };
    
    loadData();
  }, [fetchSubscriptionData]);

  // Format date from Firebase Timestamp or Date
  const formatDate = (date: Timestamp | Date | string | number | undefined | null): string => {
    if (!date) return 'N/A';
    
    try {
      let dateValue: Date;
      
      // Handle Firebase Timestamp
      if (isFirebaseTimestamp(date)) {
        dateValue = date.toDate();
      } 
      // Handle string or number timestamp
      else if (typeof date === 'string' || typeof date === 'number') {
        dateValue = new Date(date);
      } 
      // Already a Date object or Firebase Timestamp from admin SDK
      else if (date instanceof Date) {
        dateValue = date;
      } else if (isFirebaseTimestamp(date)) {
        dateValue = date.toDate();
      } else {
        console.warn('Unsupported date format:', date);
        return 'Invalid date';
      }
      
      // Check if date is valid
      if (isNaN(dateValue.getTime())) {
        console.warn('Invalid date value:', date);
        return 'Invalid date';
      }
      
      return dateValue.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error, date);
      return 'Invalid date';
    }
  };

  // Use our utility function instead of the local one
  const formatSubscriptionCurrency = (amount: number | undefined, currency: string | undefined): string => {
    if (amount === undefined || amount === null) return 'N/A';
    // If the currency is not TZS, convert it to TZS first
    if (currency && currency !== CURRENCY_CODE) {
      return formatCurrency(usdToTzs(amount));
    }
    return formatCurrency(amount);
  };

  // Helper to safely access plan properties
  const getPlanDetails = (plan: SubscriptionPlan | SubscriptionPlanDetails | string | undefined | null): SubscriptionPlanDetails | null => {
    if (!plan) return null;
    
    // If plan is a string ID, try to find the full plan details
    if (typeof plan === 'string') {
      return availablePlans.find(p => p.id === plan) || null;
    }
    
    // If it's already a full plan object, return it
    if ('id' in plan && 'name' in plan) {
      return plan as SubscriptionPlanDetails;
    }
    
    // If it's a SubscriptionPlan enum value, find the corresponding plan details
    const planId = plan as SubscriptionPlan;
    return availablePlans.find(p => p.id === planId) || null;
  };

  // Get current plan details with proper typing
  const currentPlan = subscription 
    ? getPlanDetails(subscription.plan || subscription.planId)
    : null;

  const handleUpgradePlan = async (planId: string) => {
    if (!subscription) return;
    
    try {
      setIsActionInProgress(true);
      setSelectedPlan(planId);
      
      // In a real app, you would handle payment processing here
      // For now, we'll just simulate a successful upgrade
      await upgradeSubscription(planId, 'pm_card_visa'); // Default test payment method
      
      toast({
        title: "Plan Updated",
        description: "Your subscription plan has been updated successfully.",
      });
      
      // Refresh subscription data
      await fetchSubscriptionData();
    } catch (error) {
      console.error('Failed to upgrade plan:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update subscription plan. Please try again.",
      });
    } finally {
      setIsActionInProgress(false);
      setSelectedPlan(null);
    }
  };

  // Get status text for display
  const getStatusText = (status: string): string => {
    if (typeof status !== 'string') return 'Unknown';
    return status.split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };
  
  // Get payment status text for display
  const getPaymentStatusText = (status: string): string => {
    return getStatusText(status);
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case SubscriptionStatus.ACTIVE:
        return 'bg-green-500';
      case SubscriptionStatus.CANCELED:
        return 'bg-yellow-500';
      case SubscriptionStatus.EXPIRED:
        return 'bg-gray-500';
      case SubscriptionStatus.PAST_DUE:
      case SubscriptionStatus.UNPAID:
        return 'bg-red-500';
      case SubscriptionStatus.TRIAL:
        return 'bg-blue-500';
      case SubscriptionStatus.PAUSED:
        return 'bg-purple-500';
      default:
        console.warn('Unknown subscription status:', status);
        return 'bg-gray-500';
    }
  };

  const handleUpgradeSubscription = async (planId: string) => {
    if (!subscription) return;
    
    try {
      setIsActionInProgress(true);
      await upgradeSubscription(planId, 'pm_card_visa'); // Default test payment method
      
      toast({
        title: "Subscription Upgraded",
        description: "Your subscription has been upgraded.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upgrade subscription. Please try again.",
      });
    } finally {
      setIsActionInProgress(false);
    }
  };

  // Handle cancel subscription
  const handleCancelSubscription = async () => {
    if (!subscription) return;
    
    // Confirm before cancelling
    const confirmed = window.confirm("Are you sure you want to cancel your subscription?");
    if (!confirmed) return;
    
    try {
      setIsActionInProgress(true);
      await cancelSubscription(subscription.id);
      
      toast({
        title: "Subscription Canceled",
        description: "Your subscription has been canceled.",
      });
      
      // Refresh subscription data
      await fetchSubscriptionData();
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to cancel subscription. Please try again.",
      });
    } finally {
      setIsActionInProgress(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show error if there is one
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription className="space-y-2">
          <div>{error}</div>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2" 
            onClick={() => fetchSubscriptionData()}
            disabled={isActionInProgress}
          >
            {isActionInProgress ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Subscription Management</h2>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => fetchSubscriptionData()}
            disabled={isLoading || isActionInProgress}
            className="mr-2"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={() => setActiveTab('current')}
            className={activeTab === 'current' ? 'bg-primary/10' : ''}
            disabled={isLoading || isActionInProgress}
          >
            Current Plan
          </Button>
          <Button
            variant="outline"
            onClick={() => setActiveTab('plans')}
            className={activeTab === 'plans' ? 'bg-primary/10' : ''}
            disabled={isLoading || isActionInProgress}
          >
            Available Plans
          </Button>
        </div>
      </div>

      {activeTab === 'current' && (
        <div className="space-y-6">
          {subscription ? (
            <Card>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle>{currentPlan?.name}</CardTitle>
                  <CardDescription>
                    {currentPlan?.description}
                  </CardDescription>
                </div>
                <Badge 
                  className={`${getStatusColor(subscription.status)} text-white`}
                >
                  {getStatusText(subscription.status)}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">Subscription Details</h3>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-muted-foreground mr-2">Price:</span>
                        <span>
                          {formatSubscriptionCurrency(currentPlan?.price, currentPlan?.currency)}
                          /{currentPlan?.billingCycle?.toLowerCase() || 'month'}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-muted-foreground mr-2">Start Date:</span>
                        <span>{formatDate(subscription.startDate)}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-muted-foreground mr-2">End Date:</span>
                        <span>{formatDate(subscription.endDate)}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-muted-foreground mr-2">Billing Cycle:</span>
                        <span>{subscription.billingCycle?.toLowerCase() || 'monthly'}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-muted-foreground mr-2">Status:</span>
                        <Badge className={getStatusColor(subscription.status)}>
                          {getStatusText(subscription.status)}
                        </Badge>
                      </div>
                      {subscription.status === 'active' && subscription.nextPaymentDate && (
                        <div className="flex items-center text-sm">
                          <AlertCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="text-muted-foreground mr-2">Next Payment:</span>
                          <span>{formatDate(subscription.nextPaymentDate)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Features</h3>
                    <ul className="space-y-1">
                      {currentPlan?.features?.map((feature: string, index: number) => (
                        <li key={index} className="flex items-center text-sm">
                          <Check className="h-4 w-4 mr-2 text-green-500" />
                          <span>{feature}</span>
                        </li>
                      )) || (
                        <li className="text-sm text-muted-foreground">No features listed</li>
                      )}
                    </ul>
                  </div>
                </div>
                
                <Separator className="my-6" />
                
                <div>
                  <h3 className="font-semibold mb-2">Payment History</h3>
                  <div className="space-y-2">
                    {subscription.paymentHistory && subscription.paymentHistory.length > 0 ? (
                      <div className="space-y-2">
                        {subscription.paymentHistory?.map((payment: PaymentType) => (
                          <div key={payment.id} className="flex justify-between text-sm p-2 bg-muted rounded">
                            <span>{formatDate(payment.createdAt)}</span>
                            <span className={payment.status === 'paid' ? 'text-green-500' : 
                                  payment.status === 'failed' ? 'text-red-500' : 'text-yellow-500'}>
                              {formatSubscriptionCurrency(payment.amount, payment.currency)}
                              <span className="ml-2">{getPaymentStatusText(payment.status)}</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No payment history available.</p>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between bg-muted/50 border-t">
                <div className="flex justify-between mt-6 w-full">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {subscription.autoRenew ? 'Subscription will auto-renew' : 'Auto-renew is disabled'}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={handleCancelSubscription}
                    disabled={isActionInProgress}
                  >
                    {isActionInProgress ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Cancel Subscription'
                    )}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ) : (
            <div className="text-center py-8">
              <h2 className="text-xl font-semibold mb-2">No Active Subscription</h2>
              <p className="text-muted-foreground mb-6">
                You don't have any active subscription plans.
              </p>
              <Button onClick={() => setActiveTab('plans')}>
                Browse Subscription Plans
              </Button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'plans' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {availablePlans.map((plan) => (
              <Card key={plan.id} className={`overflow-hidden ${subscription?.planId === (plan as SubscriptionPlanDetails).id ? 'border-primary' : ''}`}>
                <CardHeader>
                  <CardTitle>{(plan as SubscriptionPlanDetails).name}</CardTitle>
                  <CardDescription>{(plan as SubscriptionPlanDetails).description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <span className="text-3xl font-bold">
                      {formatSubscriptionCurrency(
                        (plan as SubscriptionPlanDetails).price, 
                        (plan as SubscriptionPlanDetails).currency
                      )}
                    </span>
                    <span className="text-muted-foreground">
                      /{(plan as SubscriptionPlanDetails).billingCycle?.toLowerCase() || 'month'}
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {(plan as SubscriptionPlanDetails).features?.map((feature: string, index: number) => (
                      <li key={index} className="flex items-center">
                        <Check className="h-4 w-4 mr-2 text-primary" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    )) || (
                      <li className="text-sm text-muted-foreground">No features listed</li>
                    )}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={() => handleUpgradeSubscription((plan as SubscriptionPlanDetails).id)}
                    disabled={isActionInProgress || Boolean(subscription && subscription.planId === (plan as SubscriptionPlanDetails).id)}
                    variant={subscription?.planId === (plan as SubscriptionPlanDetails).id ? 'outline' : 'default'}
                  >
                    {isActionInProgress && selectedPlan === plan.id ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : subscription?.planId === (plan as SubscriptionPlanDetails).id
                      ? 'Current Plan'
                      : 'Upgrade'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
