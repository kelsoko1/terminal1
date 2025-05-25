import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/CustomThemeProvider';
import { backendService } from '../services/backendService';
import { Check, AlertCircle } from 'lucide-react-native';
import Icon from '../components/Icon';

interface SubscriptionScreenProps {
  navigation: {
    goBack: () => void;
    navigate: (screen: string, params?: any) => void;
  };
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
}

interface CurrentSubscription {
  id: string;
  planId: string;
  status: 'active' | 'canceled' | 'expired';
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export default function SubscriptionScreen({ navigation }: SubscriptionScreenProps) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<CurrentSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch subscription plans
        const plansResponse = await backendService.getSubscriptionPlans();
        setPlans(plansResponse.data);
        
        // Fetch current subscription if any
        try {
          const subscriptionResponse = await backendService.getCurrentSubscription();
          setCurrentSubscription(subscriptionResponse.data);
        } catch (error) {
          // User might not have a subscription, which is okay
          console.log('No active subscription found');
        }
      } catch (error: any) {
        console.error('Error fetching subscription data:', error);
        Alert.alert('Error', 'Failed to load subscription information');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubscribe = (planId: string) => {
    navigation.navigate('PaymentScreen', { planId });
  };

  const handleCancelSubscription = async () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your subscription? You will still have access until the end of your billing period.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await backendService.cancelSubscription();
              
              // Refresh subscription data
              const subscriptionResponse = await backendService.getCurrentSubscription();
              setCurrentSubscription(subscriptionResponse.data);
              
              Alert.alert(
                'Subscription Canceled',
                'Your subscription has been canceled. You will have access until the end of your current billing period.'
              );
            } catch (error: any) {
              console.error('Error canceling subscription:', error);
              Alert.alert('Error', 'Failed to cancel subscription. Please try again.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Loading subscription information...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Subscription Plans</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={[styles.backButtonText, { color: theme.colors.primary }]}>Back</Text>
        </TouchableOpacity>
      </View>

      {currentSubscription && (
        <View style={[styles.currentSubscriptionCard, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.currentSubscriptionTitle, { color: theme.colors.text }]}>
            Current Subscription
          </Text>
          
          <View style={styles.subscriptionDetails}>
            <Text style={[styles.subscriptionPlan, { color: theme.colors.text }]}>
              {plans.find(p => p.id === currentSubscription.planId)?.name || 'Premium Plan'}
            </Text>
            
            <View style={[
              styles.statusBadge, 
              { backgroundColor: currentSubscription.status === 'active' ? theme.colors.success : theme.colors.warning }
            ]}>
              <Text style={styles.statusText}>
                {currentSubscription.status === 'active' ? 'Active' : 'Canceled'}
              </Text>
            </View>
          </View>
          
          <Text style={[styles.expiryText, { color: theme.colors.text }]}>
            {currentSubscription.cancelAtPeriodEnd 
              ? 'Access until: ' 
              : 'Renews on: '
            }
            {new Date(currentSubscription.currentPeriodEnd).toLocaleDateString()}
          </Text>
          
          {!currentSubscription.cancelAtPeriodEnd && (
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: theme.colors.error }]}
              onPress={handleCancelSubscription}
            >
              <Text style={[styles.cancelButtonText, { color: theme.colors.error }]}>
                Cancel Subscription
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <ScrollView style={styles.plansContainer}>
        {plans.map((plan) => (
          <View
            key={plan.id}
            style={[styles.planCard, { backgroundColor: theme.colors.card }]}
          >
            <View style={styles.planHeader}>
              <Text style={[styles.planName, { color: theme.colors.text }]}>{plan.name}</Text>
              <Text style={[styles.planPrice, { color: theme.colors.text }]}>
                ${plan.price}/{plan.interval === 'month' ? 'mo' : 'yr'}
              </Text>
            </View>

            <View style={styles.featuresContainer}>
              {plan.features.map((feature, index) => (
                <View key={index} style={styles.featureRow}>
                  <Icon icon={Check} size={16} color={theme.colors.success} />
                  <Text style={[styles.featureText, { color: theme.colors.text }]}>
                    {feature}
                  </Text>
                </View>
              ))}
            </View>

            {(!currentSubscription || currentSubscription.planId !== plan.id) && (
              <TouchableOpacity
                style={[styles.subscribeButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => handleSubscribe(plan.id)}
              >
                <Text style={styles.subscribeButtonText}>
                  {currentSubscription ? 'Switch Plan' : 'Subscribe'}
                </Text>
              </TouchableOpacity>
            )}

            {currentSubscription && currentSubscription.planId === plan.id && (
              <View style={[styles.currentPlanBadge, { backgroundColor: theme.colors.success }]}>
                <Text style={styles.currentPlanText}>Current Plan</Text>
              </View>
            )}
          </View>
        ))}

        {plans.length === 0 && (
          <View style={styles.noPlansContainer}>
            <Icon icon={AlertCircle} size={48} color={theme.colors.text} style={styles.noPlansIcon} />
            <Text style={[styles.noPlansText, { color: theme.colors.text }]}>
              No subscription plans available at the moment.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  currentSubscriptionCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  currentSubscriptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  subscriptionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subscriptionPlan: {
    fontSize: 16,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 12,
  },
  expiryText: {
    fontSize: 14,
    marginBottom: 16,
  },
  cancelButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  cancelButtonText: {
    fontWeight: '500',
  },
  plansContainer: {
    flex: 1,
    padding: 16,
  },
  planCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  planHeader: {
    marginBottom: 16,
  },
  planName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 24,
    fontWeight: '600',
  },
  featuresContainer: {
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    marginLeft: 8,
    fontSize: 14,
  },
  subscribeButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  subscribeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  currentPlanBadge: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  currentPlanText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  noPlansContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  noPlansIcon: {
    marginBottom: 16,
  },
  noPlansText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
});
