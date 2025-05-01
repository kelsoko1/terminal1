// Type declarations for @prisma/client
declare module '@prisma/client' {
  export class PrismaClient {
    constructor(options?: any);
    
    // Subscription model
    subscription: {
      findUnique(args: { where: { id: string }; include?: any }): Promise<any>;
      findMany(args: { where?: any; include?: any }): Promise<any[]>;
      create(args: { data: any }): Promise<any>;
      update(args: { where: { id: string }; data: any }): Promise<any>;
    };
    
    // SubscriptionPlan model
    subscriptionPlan: {
      findUnique(args: { where: { id: string }; include?: any }): Promise<any>;
      findMany(args: { where?: any; orderBy?: any }): Promise<any[]>;
      create(args: { data: any }): Promise<any>;
    };
    
    // Payment model
    payment: {
      create(args: { data: any }): Promise<any>;
      findMany(args: { where?: any; orderBy?: any; take?: number }): Promise<any[]>;
    };
    
    // User model
    user: {
      findUnique(args: { where: { id: string } | { email: string }; include?: any }): Promise<any>;
      findMany(args: { where?: any; include?: any }): Promise<any[]>;
      create(args: { data: any }): Promise<any>;
      update(args: { where: { id: string }; data: any }): Promise<any>;
    };
    
    // Transaction helper
    $transaction<T>(fn: (prisma: PrismaClient) => Promise<T>): Promise<T>;
  }
}
