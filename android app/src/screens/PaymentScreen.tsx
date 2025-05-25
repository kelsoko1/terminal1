import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/CustomThemeProvider';
import { backendService } from '../services/backendService';
import { CreditCard, Calendar, Lock } from 'lucide-react-native';
import Icon from '../components/Icon';

interface PaymentScreenProps {
  navigation: {
    goBack: () => void;
    navigate: (screen: string) => void;
    reset: (config: { index: number; routes: Array<{ name: string }> }) => void;
  };
  route: {
    params: {
      planId: string;
    };
  };
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
}

export default function PaymentScreen({ navigation, route }: PaymentScreenProps) {
  const { planId } = route.params;
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  // Payment form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');
  
  const { theme } = useTheme();

  useEffect(() => {
    const fetchPlanDetails = async () => {
      try {
        const response = await backendService.getSubscriptionPlans();
        const selectedPlan = response.data.find((p: SubscriptionPlan) => p.id === planId);
        
        if (selectedPlan) {
          setPlan(selectedPlan);
        } else {
          Alert.alert('Error', 'Subscription plan not found');
          navigation.goBack();
        }
      } catch (error: any) {
        console.error('Error fetching plan details:', error);
        Alert.alert('Error', 'Failed to load subscription plan details');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    fetchPlanDetails();
  }, [planId, navigation]);

  const formatCardNumber = (text: string) => {
    // Remove all non-digit characters
    const cleaned = text.replace(/\D/g, '');
    
    // Limit to 16 digits
    const limited = cleaned.substring(0, 16);
    
    // Format with spaces every 4 digits
    const formatted = limited.replace(/(\d{4})(?=\d)/g, '$1 ');
    
    setCardNumber(formatted);
  };

  const formatCardExpiry = (text: string) => {
    // Remove all non-digit characters
    const cleaned = text.replace(/\D/g, '');
    
    // Limit to 4 digits
    const limited = cleaned.substring(0, 4);
    
    // Format as MM/YY
    if (limited.length > 2) {
      setCardExpiry(`${limited.substring(0, 2)}/${limited.substring(2)}`);
    } else {
      setCardExpiry(limited);
    }
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!cardNumber || !cardExpiry || !cardCvc || !cardName) {
      Alert.alert('Error', 'Please fill in all payment details');
      return;
    }

    if (cardNumber.replace(/\s/g, '').length !== 16) {
      Alert.alert('Error', 'Please enter a valid card number');
      return;
    }

    if (cardExpiry.length !== 5) {
      Alert.alert('Error', 'Please enter a valid expiry date (MM/YY)');
      return;
    }

    if (cardCvc.length < 3) {
      Alert.alert('Error', 'Please enter a valid CVC code');
      return;
    }

    setProcessing(true);

    try {
      // In a real app, you would use a payment processor SDK here
      // For this demo, we'll simulate a payment method creation
      const paymentMethodId = `pm_${Date.now()}`;
      
      // Subscribe with the payment method
      await backendService.subscribe(planId, paymentMethodId);
      
      Alert.alert(
        'Subscription Successful',
        `You have successfully subscribed to the ${plan?.name} plan.`,
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'MainApp' }],
              });
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Payment error:', error);
      Alert.alert('Payment Failed', 'There was an error processing your payment. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Loading subscription details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Payment Details</Text>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Text style={[styles.backButtonText, { color: theme.colors.primary }]}>Back</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.planSummary, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.planName, { color: theme.colors.text }]}>{plan?.name}</Text>
            <Text style={[styles.planPrice, { color: theme.colors.text }]}>
              ${plan?.price}/{plan?.interval === 'month' ? 'mo' : 'yr'}
            </Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Card Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Card Number</Text>
              <View style={[styles.inputContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <Icon icon={CreditCard} size={20} color={theme.colors.text} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.colors.text }]}
                  placeholder="1234 5678 9012 3456"
                  placeholderTextColor={`${theme.colors.text}80`}
                  value={cardNumber}
                  onChangeText={formatCardNumber}
                  keyboardType="numeric"
                  maxLength={19} // 16 digits + 3 spaces
                />
              </View>
            </View>

            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={[styles.label, { color: theme.colors.text }]}>Expiry Date</Text>
                <View style={[styles.inputContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                  <Icon icon={Calendar} size={20} color={theme.colors.text} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: theme.colors.text }]}
                    placeholder="MM/YY"
                    placeholderTextColor={`${theme.colors.text}80`}
                    value={cardExpiry}
                    onChangeText={formatCardExpiry}
                    keyboardType="numeric"
                    maxLength={5}
                  />
                </View>
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={[styles.label, { color: theme.colors.text }]}>CVC</Text>
                <View style={[styles.inputContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                  <Icon icon={Lock} size={20} color={theme.colors.text} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: theme.colors.text }]}
                    placeholder="123"
                    placeholderTextColor={`${theme.colors.text}80`}
                    value={cardCvc}
                    onChangeText={setCardCvc}
                    keyboardType="numeric"
                    maxLength={4}
                    secureTextEntry
                  />
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Cardholder Name</Text>
              <View style={[styles.inputContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <TextInput
                  style={[styles.input, { color: theme.colors.text, paddingLeft: 12 }]}
                  placeholder="John Doe"
                  placeholderTextColor={`${theme.colors.text}80`}
                  value={cardName}
                  onChangeText={setCardName}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.payButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleSubmit}
              disabled={processing}
            >
              {processing ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.payButtonText}>Pay ${plan?.price}</Text>
              )}
            </TouchableOpacity>

            <Text style={[styles.secureText, { color: theme.colors.text }]}>
              Your payment information is secure and encrypted
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
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
    marginBottom: 24,
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
  planSummary: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planName: {
    fontSize: 18,
    fontWeight: '600',
  },
  planPrice: {
    fontSize: 18,
    fontWeight: '600',
  },
  formContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    height: 50,
  },
  inputIcon: {
    marginLeft: 12,
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  payButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secureText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
    opacity: 0.7,
  },
});
