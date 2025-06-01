import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, AlertCircle, CreditCard, CalendarIcon, Clock, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import { formatCurrency, usdToTzs, CURRENCY_CODE } from '@/lib/utils/currency';
import { useSubscriptionStore, Subscription, SubscriptionPlan } from '@/lib/store/subscriptionStore';
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Interfaces are now imported from the subscription store

export function AccountSubscription() {
  const { toast } = useToast();
  const { 
    subscription, 
    availablePlans, 
    isLoading, 
    error,
    fetchSubscriptionData,
    toggleAutoRenew,
    cancelSubscription,
    upgradeSubscription
  } = useSubscriptionStore();
  const [activeTab, setActiveTab] = useState<'current' | 'plans'>('current');
  const [isActionInProgress, setIsActionInProgress] = useState(false);

  // Fetch subscription data
  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Use our utility function instead of the local one
  const formatSubscriptionCurrency = (amount: number, currency: string) => {
    // If the currency is not TZS, convert it to TZS first
    if (currency !== CURRENCY_CODE) {
      return formatCurrency(usdToTzs(amount));
    }
    return formatCurrency(amount);
  };

  const handleToggleAutoRenew = async () => {
    if (!subscription) return;
    
    try {
      setIsActionInProgress(true);
      await toggleAutoRenew(subscription.id);
      
      toast({
        title: "Auto-renew Updated",
        description: `Auto-renew has been ${subscription.autoRenew ? 'disabled' : 'enabled'}.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update auto-renew setting. Please try again.",
      });
    } finally {
      setIsActionInProgress(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
        return 'bg-green-500';
      case 'CANCELED':
        return 'bg-yellow-500';
      case 'EXPIRED':
        return 'bg-gray-500';
      case 'PENDING':
        return 'bg-blue-500';
      case 'FAILED':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription) return;
    
    try {
      setIsActionInProgress(true);
      await cancelSubscription(subscription.id);
      
      toast({
        title: "Subscription Canceled",
        description: "Your subscription has been canceled.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to cancel subscription. Please try again.",
      });
    } finally {
      setIsActionInProgress(false);
    }
  };

  const handleUpgradeSubscription = async (planId: string) => {
    if (!subscription) return;
    
    try {
      setIsActionInProgress(true);
      await upgradeSubscription(planId);
      
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
      <Alert variant="destructive" className="mb-4">
        <AlertDescription className="flex items-center justify-between">
          <span>Error loading subscription data: {error}</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => fetchSubscriptionData()}
            className="ml-2"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
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
                  <CardTitle>{subscription.plan.name}</CardTitle>
                  <CardDescription>
                    {subscription.plan.description}
                  </CardDescription>
                </div>
                <Badge 
                  className={`${getStatusColor(subscription.status)} text-white`}
                >
                  {subscription.status}
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
                          {formatSubscriptionCurrency(subscription.plan.price, subscription.plan.currency)}
                          /{subscription.plan.interval.toLowerCase()}
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
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-muted-foreground mr-2">Auto-Renew:</span>
                        <span>{subscription.autoRenew ? 'Yes' : 'No'}</span>
                      </div>
                      {subscription.nextPaymentDate && subscription.status === 'ACTIVE' && (
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
                      {subscription.plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <Check className="h-4 w-4 mr-2 text-green-500" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <Separator className="my-6" />
                
                <div>
                  <h3 className="font-semibold mb-2">Payment History</h3>
                  {subscription.paymentHistory.length > 0 ? (
                    <div className="space-y-2">
                      {subscription.paymentHistory.map((payment) => (
                        <div key={payment.id} className="flex justify-between text-sm p-2 bg-muted rounded">
                          <span>{formatDate(payment.createdAt)}</span>
                          <span className={payment.status === 'COMPLETED' ? 'text-green-500' : payment.status === 'FAILED' ? 'text-red-500' : 'text-yellow-500'}>
                            {formatSubscriptionCurrency(payment.amount, payment.currency)}
                            <span className="ml-2">{payment.status}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No payment history available.</p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between bg-muted/50 border-t">
                <div className="flex justify-between mt-6">
                  <Button
                    variant="outline"
                    onClick={handleToggleAutoRenew}
                    disabled={isActionInProgress}
                  >
                    {isActionInProgress ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      subscription.autoRenew ? 'Disable Auto-Renew' : 'Enable Auto-Renew'
                    )}
                  </Button>
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
              <Card key={plan.id} className={`overflow-hidden ${subscription?.plan.id === plan.id ? 'border-primary' : ''}`}>
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <span className="text-3xl font-bold">{formatSubscriptionCurrency(plan.price, plan.currency)}</span>
                    <span className="text-muted-foreground">/{plan.interval.toLowerCase()}</span>
                  </div>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="h-4 w-4 mr-2 text-primary" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={() => handleUpgradeSubscription(plan.id)}
                    disabled={isActionInProgress || Boolean(subscription && subscription.plan.id === plan.id)}
                  >
                    {isActionInProgress ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : subscription && subscription.plan.id === plan.id
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
