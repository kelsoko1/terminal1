import React from 'react';
import { Metadata } from 'next';
import { getAuth } from 'firebase/auth';
import { redirect } from 'next/navigation';
// Removed PrismaClient import. Use Firestore/Firebase logic instead.
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, CreditCard, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Manage Subscriptions',
  description: 'Manage your investor subscription plans',
};

async function getUserSubscriptions(userId: string) {
  const prisma = new PrismaClient();
  
  try {
    const subscriptions = await prisma.subscription.findMany({
      where: {
        userId,
      },
      include: {
        plan: true,
        paymentHistory: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 5,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return subscriptions;
  } catch (error) {
    console.error('Error fetching user subscriptions:', error);
    return [];
  } finally {
    await prisma.$disconnect();
  }
}

export default async function ManageSubscriptionsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect('/auth/signin?callbackUrl=/investor/subscriptions/manage');
  }
  
  // Check if user is an investor
  if (session.user.role !== 'INVESTOR') {
    redirect('/dashboard');
  }
  
  const subscriptions = await getUserSubscriptions(session.user.id);
  
  const formatDate = (date: Date | null | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'status-bg-active';
      case 'CANCELED':
        return 'status-bg-canceled';
      case 'EXPIRED':
        return 'status-bg-expired';
      case 'PENDING':
        return 'status-bg-pending';
      case 'FAILED':
        return 'status-bg-failed';
      default:
        return 'status-bg-expired';
    }
  };
  
  return (
    <div className="container py-10">
      <div className="space-y-4 mb-8">
        <h1 className="text-3xl font-bold">Manage Your Subscriptions</h1>
        <p className="text-muted-foreground">
          View and manage your active and past subscription plans.
        </p>
      </div>
      
      {subscriptions.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">No Subscriptions Found</h2>
          <p className="text-muted-foreground mb-6">
            You don't have any active or past subscriptions.
          </p>
          <Button asChild>
            <Link href="/investor/subscriptions">Browse Subscription Plans</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {subscriptions.map((subscription) => (
            <Card key={subscription.id} className="overflow-hidden">
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle>{subscription.plan.name}</CardTitle>
                  <CardDescription>
                    Subscribed on {formatDate(subscription.startDate)}
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
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: subscription.plan.currency,
                          }).format(subscription.plan.price)}
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
                    <h3 className="font-semibold mb-2">Payment History</h3>
                    {subscription.paymentHistory.length > 0 ? (
                      <div className="space-y-2">
                        {subscription.paymentHistory.map((payment) => (
                          <div key={payment.id} className="flex justify-between text-sm p-2 bg-muted rounded">
                            <span>{formatDate(payment.createdAt)}</span>
                            <span className={payment.status === 'COMPLETED' ? 'investor-success' : payment.status === 'FAILED' ? 'investor-danger' : 'investor-warning'}>
                              {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: payment.currency,
                              }).format(payment.amount)}
                              <span className="ml-2">{payment.status}</span>
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
                {subscription.status === 'ACTIVE' && (
                  <>
                    <Button variant="outline" asChild>
                      <Link href={`/investor/subscriptions/manage/${subscription.id}/update`}>
                        {subscription.autoRenew ? 'Cancel Auto-Renew' : 'Enable Auto-Renew'}
                      </Link>
                    </Button>
                    <Button variant="outline" className="text-red-500 hover:text-red-700" asChild>
                      <Link href={`/investor/subscriptions/manage/${subscription.id}/cancel`}>
                        Cancel Subscription
                      </Link>
                    </Button>
                  </>
                )}
                {subscription.status !== 'ACTIVE' && (
                  <Button asChild>
                    <Link href="/investor/subscriptions">Browse Plans</Link>
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
