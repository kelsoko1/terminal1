import { BaseService } from './baseService';
import { adminDb } from '../admin';
import { 
  Subscription, 
  SubscriptionStatus, 
  PaymentStatus, 
  SubscriptionPlan,
  SubscriptionPlanDetails
} from '@/types/subscription';
import { Timestamp } from 'firebase-admin/firestore';

type DocumentData = {
  [key: string]: any;
};

// Extend the Subscription interface to ensure id is required
export interface SubscriptionWithRequiredId extends Omit<Subscription, 'id'> {
  id: string;
}

// Extend the SubscriptionPlanDetails interface to ensure all required fields are present
export interface SubscriptionPlanWithRequiredFields extends Omit<SubscriptionPlanDetails, 'id' | 'createdAt' | 'updatedAt'> {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

type BillingCycle = 'monthly' | 'yearly';

export class SubscriptionService extends BaseService<Subscription> {
  private defaultPlans: SubscriptionPlanDetails[] = [
    {
      id: 'free',
      name: 'Free',
      description: 'Basic access with limited features',
      price: 0,
      currency: 'USD',
      billingCycle: 'monthly',
      features: [
        'Basic analytics',
        'Email support',
        'Limited API access'
      ],
      isPopular: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'basic',
      name: 'Basic',
      description: 'For individual traders',
      price: 10,
      currency: 'USD',
      billingCycle: 'monthly',
      features: [
        'Advanced analytics',
        'Priority support',
        'Full API access',
        'Basic indicators'
      ],
      isPopular: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'premium',
      name: 'Premium',
      description: 'For active traders',
      price: 25,
      currency: 'USD',
      billingCycle: 'monthly',
      features: [
        'All Basic features',
        'Advanced indicators',
        'Real-time data',
        'Dedicated account manager'
      ],
      isPopular: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'Custom solutions for businesses',
      price: 100,
      currency: 'USD',
      billingCycle: 'monthly',
      features: [
        'All Premium features',
        'Custom integrations',
        '24/7 support',
        'SLA',
        'Custom development'
      ],
      isPopular: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  constructor() {
    super('subscriptions');
    this.initializeDefaultPlans();
  }

  private async initializeDefaultPlans() {
    try {
      const existingPlans = await this.list();
      if (existingPlans.length === 0) {
        for (const plan of this.defaultPlans) {
          await this.create(plan as any);
        }
      }
    } catch (error) {
      console.error('Error initializing default plans:', error);
    }
  }

  async getAvailablePlans(): Promise<SubscriptionPlanDetails[]> {
    // Check if we have plans in the database
    const plansSnapshot = await adminDb.collection('subscriptionPlans').get();
    
    if (!plansSnapshot.empty) {
      return plansSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as SubscriptionPlanDetails));
    }
    
    // If no plans in DB, return default plans
    return this.defaultPlans;
  }

  async getPlanById(planId: string): Promise<SubscriptionPlanDetails | null> {
    try {
      const plan = await adminDb.collection('subscriptionPlans').doc(planId).get();
      if (!plan.exists) {
        // Check default plans if not found in DB
        const defaultPlan = this.defaultPlans.find(p => p.id === planId);
        return defaultPlan || null;
      }
      return {
        id: plan.id,
        ...plan.data(),
      } as SubscriptionPlanDetails;
    } catch (error) {
      console.error('Error fetching plan:', error);
      return null;
    }
  }

  async getUserSubscription(userId: string): Promise<Subscription | null> {
    try {
      const snapshot = await adminDb
        .collection('subscriptions')
        .where('userId', '==', userId)
        .where('status', 'in', ['ACTIVE', 'TRIAL'])
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
      } as Subscription;
    } catch (error) {
      console.error('Error fetching user subscription:', error);
      return null;
    }
  }

  async createSubscription(
    userId: string,
    planId: string,
    paymentMethod: string,
    billingCycle: BillingCycle = 'monthly',
    trialDays: number = 0
  ): Promise<Subscription> {
    const now = Timestamp.now();
    const plan = await this.getPlanById(planId);
    
    if (!plan) {
      throw new Error(`Plan ${planId} not found`);
    }

    // Check if user already has an active subscription
    const existingSub = await this.getUserSubscription(userId);
    if (existingSub) {
      throw new Error('User already has an active subscription');
    }

    // Calculate dates
    const startDate = now.toDate();
    let endDate = this.calculateEndDate(now, billingCycle === 'yearly' ? 'year' : 'month').toDate();
    let trialEndsAt: Date | null = null;
    
    if (trialDays > 0) {
      trialEndsAt = new Date(now.toMillis() + (trialDays * 24 * 60 * 60 * 1000));
      endDate = trialEndsAt;
    }

    const subscriptionData: Omit<Subscription, 'id'> = {
      userId,
      planId,
      status: trialDays > 0 ? SubscriptionStatus.TRIAL : SubscriptionStatus.ACTIVE,
      startDate,
      endDate,
      trialEndsAt,
      autoRenew: true,
      paymentMethod,
      lastPaymentDate: now.toDate(),
      nextPaymentDate: endDate,
      paymentStatus: trialDays > 0 ? PaymentStatus.PAID : PaymentStatus.PENDING,
      amount: plan.price,
      currency: plan.currency,
      billingCycle,
      createdAt: now.toDate(),
      updatedAt: now.toDate(),
    };

    return this.create(subscriptionData as any) as Promise<Subscription>;
  }

  async updateSubscription(
    subscriptionId: string,
    updates: Partial<Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<Subscription | null> {
    try {
      const docRef = adminDb.collection('subscriptions').doc(subscriptionId);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        return null;
      }
      
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now(),
      };
      
      // Record payment if payment status is provided and valid
      if (updates.paymentStatus) {
        await adminDb.collection('payments').add({
          subscriptionId,
          amount: updates.amount || 0,
          status: updates.paymentStatus,
          paymentDate: Timestamp.now(),
        });
      }
      
      await docRef.update(updateData);
      
      // Return the updated subscription
      const updatedDoc = await docRef.get();
      return {
        id: updatedDoc.id,
        ...updatedDoc.data(),
      } as Subscription;
    } catch (error) {
      console.error(`Error updating subscription ${subscriptionId}:`, error);
      throw error;
    }
  }

  async cancelSubscription(subscriptionId: string, immediate: boolean = false): Promise<Subscription | null> {
    const now = Timestamp.now();
    
    try {
      const subscription = await this.getUserSubscription('');
      if (!subscription) {
        throw new Error('Subscription not found');
      }

      const updates: Partial<Subscription> = {
        status: SubscriptionStatus.CANCELED,
        autoRenew: false,
        endDate: immediate ? now.toDate() : subscription.endDate,
        updatedAt: now.toDate(),
      };

      if (immediate) {
        updates.nextPaymentDate = null as any;
      }

      await this.update(subscriptionId, updates);
      
      // Update the subscription object to reflect the changes
      subscription.status = SubscriptionStatus.CANCELED;
      subscription.autoRenew = false;
      subscription.endDate = immediate ? now.toDate() : subscription.endDate;
      subscription.updatedAt = now.toDate();
      
      return subscription;
    } catch (error) {
      console.error(`Error canceling subscription ${subscriptionId}:`, error);
      throw error;
    }
  }

  async validateSubscription(userId: string): Promise<{ isValid: boolean; subscription?: Subscription }> {
    try {
      const subscription = await this.getUserSubscription(userId);
      
      if (!subscription) {
        return { isValid: false };
      }
      
      const now = Timestamp.now();
      const endDate = subscription.endDate instanceof Timestamp 
        ? subscription.endDate 
        : Timestamp.fromDate(new Date(subscription.endDate as string | number | Date));
      
      const isExpired = endDate.toMillis() < now.toMillis();
      
      if (isExpired) {
        if (subscription.autoRenew) {
          try {
            // Process renewal
            const nextPaymentDate = this.calculateEndDate(now, 'month');
            
            if (subscription.id) {
              await this.updateSubscription(subscription.id, {
                lastPaymentDate: now.toDate(),
                nextPaymentDate: nextPaymentDate.toDate(),
                endDate: nextPaymentDate.toDate(),
                status: SubscriptionStatus.ACTIVE
              });
              
              // Get the updated subscription
              const updatedSub = await this.getUserSubscription(userId);
              return { 
                isValid: !!updatedSub && updatedSub.status === SubscriptionStatus.ACTIVE,
                subscription: updatedSub || undefined
              };
            }
          } catch (error) {
            console.error('Error processing subscription renewal:', error);
            return { isValid: false, subscription };
          }
        }
        
        // Update status to expired if not renewing
        if (subscription.id) {
          await this.updateSubscription(subscription.id, {
            status: SubscriptionStatus.EXPIRED
          });
        }
        
        return { isValid: false };
      }
      
      return { isValid: true, subscription };
    } catch (error) {
      console.error('Error validating subscription:', error);
      return { isValid: false };
    }
  }

  public calculateEndDate(startDate: Timestamp | Date, period: 'day' | 'week' | 'month' | 'year'): Timestamp {
    const start = startDate instanceof Timestamp ? startDate.toDate() : new Date(startDate);
    const date = new Date(start);
    
    switch (period) {
      case 'day':
        date.setDate(date.getDate() + 1);
        break;
      case 'week':
        date.setDate(date.getDate() + 7);
        break;
      case 'month':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'year':
        date.setFullYear(date.getFullYear() + 1);
        break;
    }
    
    return Timestamp.fromDate(date);
  }
  
  // Helper method to handle payment status updates
  public async recordPayment(
    subscriptionId: string,
    status: PaymentStatus,
    amount: number = 0
  ): Promise<void> {
    await adminDb.collection('payments').add({
      subscriptionId,
      amount,
      status,
      paymentDate: Timestamp.now(),
    });
  }
}

// Export the service instance
export const subscriptionService = new SubscriptionService();

export default subscriptionService;
