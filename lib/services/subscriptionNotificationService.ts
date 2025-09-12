import { useSubscriptionStore } from '@/lib/store/subscriptionStore';
import { toast } from '@/components/ui/use-toast';

interface SubscriptionNotification {
  type: 'SUBSCRIPTION_CREATED' | 'SUBSCRIPTION_UPDATED' | 'SUBSCRIPTION_CANCELLED' | 'SUBSCRIPTION_EXPIRED';
  data: {
    subscriptionId: string;
    userId: string;
    planName?: string;
    status?: string;
    message?: string;
  };
}

class SubscriptionNotificationService {
  private static instance: SubscriptionNotificationService;
  
  public static getInstance(): SubscriptionNotificationService {
    if (!SubscriptionNotificationService.instance) {
      SubscriptionNotificationService.instance = new SubscriptionNotificationService();
    }
    return SubscriptionNotificationService.instance;
  }

  public handleSubscriptionNotification(notification: SubscriptionNotification) {
    const { type, data } = notification;
    
    switch (type) {
      case 'SUBSCRIPTION_CREATED':
        this.handleSubscriptionCreated(data);
        break;
      case 'SUBSCRIPTION_UPDATED':
        this.handleSubscriptionUpdated(data);
        break;
      case 'SUBSCRIPTION_CANCELLED':
        this.handleSubscriptionCancelled(data);
        break;
      case 'SUBSCRIPTION_EXPIRED':
        this.handleSubscriptionExpired(data);
        break;
      default:
        console.warn('Unknown subscription notification type:', type);
    }
  }

  private handleSubscriptionCreated(data: any) {
    // Refresh subscription data in the store
    useSubscriptionStore.getState().fetchSubscriptionData();
    
    toast({
      title: "Subscription Activated",
      description: data.planName 
        ? `Your ${data.planName} subscription is now active!`
        : "Your subscription is now active!",
      duration: 5000,
    });
  }

  private handleSubscriptionUpdated(data: any) {
    // Refresh subscription data in the store
    useSubscriptionStore.getState().fetchSubscriptionData();
    
    if (data.message) {
      toast({
        title: "Subscription Updated",
        description: data.message,
        duration: 4000,
      });
    }
  }

  private handleSubscriptionCancelled(data: any) {
    // Refresh subscription data in the store
    useSubscriptionStore.getState().fetchSubscriptionData();
    
    toast({
      title: "Subscription Cancelled",
      description: "Your subscription has been cancelled. You can resubscribe at any time.",
      variant: "destructive",
      duration: 6000,
    });
  }

  private handleSubscriptionExpired(data: any) {
    // Refresh subscription data in the store
    useSubscriptionStore.getState().fetchSubscriptionData();
    
    toast({
      title: "Subscription Expired",
      description: "Your subscription has expired. Please renew to continue accessing premium features.",
      variant: "destructive",
      duration: 8000,
    });
  }

  // Method to manually trigger subscription state refresh
  public refreshSubscriptionState() {
    useSubscriptionStore.getState().fetchSubscriptionData();
  }

  // Method to show subscription success notification
  public showSubscriptionSuccess(planName: string) {
    toast({
      title: "Subscription Successful",
      description: `Welcome! Your ${planName} subscription is now active.`,
      duration: 6000,
    });
  }

  // Method to show subscription error notification
  public showSubscriptionError(error: string) {
    toast({
      title: "Subscription Error",
      description: error,
      variant: "destructive",
      duration: 7000,
    });
  }
}

export const subscriptionNotificationService = SubscriptionNotificationService.getInstance();
