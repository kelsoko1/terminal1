import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, AlertCircle, CreditCard, CalendarIcon, Clock } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";

interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  currency: string;
  interval: string;
  intervalCount: number;
  features: string[];
}

interface Subscription {
  id: string;
  status: string;
  startDate: string;
  endDate?: string | null;
  autoRenew: boolean;
  nextPaymentDate?: string | null;
  plan: SubscriptionPlan;
  paymentHistory: Payment[];
}

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
}

export function AccountSubscription() {
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'current' | 'plans'>('current');

  // Fetch subscription data
  useEffect(() => {
    const fetchSubscriptionData = async () => {
      try {
        setIsLoading(true);
        // In a real app, this would be an API call
        // const response = await fetch('/api/subscriptions');
        // const data = await response.json();
        
        // Simulate API response
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Sample subscription data
        const sampleSubscription = {
          id: 'sub_123456',
          status: 'ACTIVE',
          startDate: '2025-03-15T00:00:00Z',
          endDate: '2026-03-15T00:00:00Z',
          autoRenew: true,
          nextPaymentDate: '2026-03-15T00:00:00Z',
          plan: {
            id: 'plan_premium',
            name: 'Premium Investor',
            description: 'Access to premium investment opportunities and advanced analytics',
            price: 99.99,
            currency: 'USD',
            interval: 'YEARLY',
            intervalCount: 1,
            features: [
              'Unlimited investment opportunities',
              'Advanced portfolio analytics',
              'Priority customer support',
              'Early access to new features',
              'Exclusive market insights'
            ]
          },
          paymentHistory: [
            {
              id: 'pay_123',
              amount: 99.99,
              currency: 'USD',
              status: 'COMPLETED',
              createdAt: '2025-03-15T00:00:00Z'
            }
          ]
        };
        
        setSubscription(sampleSubscription);
        
        // Sample available plans
        const samplePlans = [
          {
            id: 'plan_basic',
            name: 'Basic Investor',
            description: 'Essential tools for beginning investors',
            price: 29.99,
            currency: 'USD',
            interval: 'YEARLY',
            intervalCount: 1,
            features: [
              'Basic investment opportunities',
              'Standard portfolio tracking',
              'Email support',
              'Market news updates'
            ]
          },
          {
            id: 'plan_premium',
            name: 'Premium Investor',
            description: 'Access to premium investment opportunities and advanced analytics',
            price: 99.99,
            currency: 'USD',
            interval: 'YEARLY',
            intervalCount: 1,
            features: [
              'Unlimited investment opportunities',
              'Advanced portfolio analytics',
              'Priority customer support',
              'Early access to new features',
              'Exclusive market insights'
            ]
          },
          {
            id: 'plan_enterprise',
            name: 'Enterprise Investor',
            description: 'Comprehensive solution for professional investors',
            price: 299.99,
            currency: 'USD',
            interval: 'YEARLY',
            intervalCount: 1,
            features: [
              'All Premium features',
              'Dedicated account manager',
              'Custom investment strategies',
              'API access',
              'White-label reporting',
              'Team collaboration tools'
            ]
          }
        ];
        
        setAvailablePlans(samplePlans);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching subscription data:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load subscription data. Please try again later.",
        });
        setIsLoading(false);
      }
    };
    
    fetchSubscriptionData();
  }, [toast]);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const handleToggleAutoRenew = async () => {
    if (!subscription) return;
    
    try {
      // In a real app, this would be an API call
      // const response = await fetch(`/api/subscriptions/${subscription.id}`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ action: 'toggle_auto_renew' })
      // });
      // const data = await response.json();
      
      // Simulate API response
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setSubscription({
        ...subscription,
        autoRenew: !subscription.autoRenew
      });
      
      toast({
        title: "Success",
        description: subscription.autoRenew 
          ? "Auto-renewal has been disabled" 
          : "Auto-renewal has been enabled",
      });
    } catch (error) {
      console.error('Error toggling auto-renew:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update auto-renewal setting. Please try again.",
      });
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex border-b">
        <button
          className={`px-6 py-3 font-medium text-center ${
            activeTab === 'current'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:bg-gray-50'
          }`}
          onClick={() => setActiveTab('current')}
        >
          Current Subscription
        </button>
        <button
          className={`px-6 py-3 font-medium text-center ${
            activeTab === 'plans'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:bg-gray-50'
          }`}
          onClick={() => setActiveTab('plans')}
        >
          Available Plans
        </button>
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
                          {formatCurrency(subscription.plan.price, subscription.plan.currency)}
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
                            {formatCurrency(payment.amount, payment.currency)}
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
                {subscription.status === 'ACTIVE' && (
                  <>
                    <Button variant="outline" onClick={handleToggleAutoRenew}>
                      {subscription.autoRenew ? 'Disable Auto-Renew' : 'Enable Auto-Renew'}
                    </Button>
                    <Button variant="outline" className="text-red-500 hover:text-red-700" asChild>
                      <Link href="/account/subscription/cancel">
                        Cancel Subscription
                      </Link>
                    </Button>
                  </>
                )}
                {subscription.status !== 'ACTIVE' && (
                  <Button onClick={() => setActiveTab('plans')}>
                    Browse Plans
                  </Button>
                )}
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
                    <span className="text-3xl font-bold">{formatCurrency(plan.price, plan.currency)}</span>
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
                    variant={subscription?.plan.id === plan.id ? "outline" : "default"}
                    disabled={subscription?.plan.id === plan.id}
                    asChild={subscription?.plan.id !== plan.id}
                  >
                    {subscription?.plan.id === plan.id ? (
                      'Current Plan'
                    ) : (
                      <Link href={`/account/subscription/checkout?planId=${plan.id}`}>
                        Subscribe
                      </Link>
                    )}
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
