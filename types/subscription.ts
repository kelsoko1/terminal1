import { Timestamp as FirebaseTimestamp } from 'firebase/firestore';
import { Timestamp as AdminTimestamp } from 'firebase-admin/firestore';

export type Timestamp = FirebaseTimestamp | AdminTimestamp | Date | string | number;

export enum SubscriptionPlan {
  FREE = 'free',
  BASIC = 'basic',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELED = 'canceled',
  EXPIRED = 'expired',
  PAUSED = 'paused',
  TRIAL = 'trial',
  PAST_DUE = 'past_due',
  UNPAID = 'unpaid',
}

export enum PaymentStatus {
  PAID = 'paid',
  PENDING = 'pending',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELED = 'canceled',
  REQUIRES_ACTION = 'requires_action',
  REQUIRES_PAYMENT_METHOD = 'requires_payment_method',
  REQUIRES_CONFIRMATION = 'requires_confirmation',
  PROCESSING = 'processing',
  REQUIRES_CAPTURE = 'requires_capture',
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  startDate: Timestamp;
  endDate: Timestamp;
  autoRenew: boolean;
  paymentMethod?: string;
  lastPaymentDate?: Timestamp | null;
  nextPaymentDate?: Timestamp | null;
  paymentStatus?: PaymentStatus;
  amount: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly';
  trialEndsAt?: Timestamp | null;
  canceledAt?: Timestamp | null;
  metadata?: Record<string, any>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  paymentHistory?: Payment[];
  plan?: SubscriptionPlanDetails;
}

export interface Payment {
  id: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod?: string;
  paymentIntentId?: string;
  receiptUrl?: string;
  createdAt: Timestamp;
  metadata?: Record<string, any>;
}

export interface SubscriptionPlanDetails {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly';
  features: string[];
  isPopular: boolean;
  isActive: boolean;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}
