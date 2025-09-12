export interface MembershipPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  billingCycle: 'monthly' | 'quarterly' | 'annual';
  features: {
    marketData: 'delayed' | 'real-time';
    tradesPerMonth: number | 'unlimited';
    researchReports: boolean;
    premiumSupport: boolean;
    advancedCharts: boolean;
    apiAccess?: boolean;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserMembership {
  id: string;
  userId: string;
  planId: string;
  plan?: MembershipPlan;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  autoRenew: boolean;
  paymentMethodId?: string;
  lastPaymentDate?: string;
  nextPaymentDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MembershipTransaction {
  id: string;
  userId: string;
  membershipId: string;
  amount: number;
  status: 'completed' | 'failed' | 'pending' | 'refunded';
  paymentMethod?: string;
  transactionReference?: string;
  createdAt: string;
}

export interface MembershipFeatureAccess {
  hasAccess: boolean;
  requiredPlan?: string;
  currentPlan?: string;
  upgradeUrl?: string;
}
