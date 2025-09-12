import { subscriptionService } from '@/lib/firebase/services/subscriptionService';
import { SubscriptionStatus, PaymentStatus } from '@/types/subscription';

// Test user ID - replace with an actual user ID for testing
const TEST_USER_ID = 'test-user-123';
const TEST_PLAN_ID = 'premium-monthly';

async function testSubscriptionService() {
  try {
    console.log('=== Testing Subscription Service ===\n');

    // 1. Test getting available plans
    console.log('1. Fetching available plans...');
    const plans = await subscriptionService.getAvailablePlans();
    console.log('Available plans:', JSON.stringify(plans, null, 2));

    // 2. Test creating a subscription
    console.log('\n2. Creating subscription...');
    const subscription = await subscriptionService.createSubscription(
      TEST_USER_ID,
      TEST_PLAN_ID,
      'pm_test_visa', // Test payment method ID
      'monthly',
      7 // 7-day trial
    );
    console.log('Created subscription:', JSON.stringify(subscription, null, 2));

    // 3. Test getting user subscription
    console.log('\n3. Getting user subscription...');
    const userSubscription = await subscriptionService.getUserSubscription(TEST_USER_ID);
    console.log('User subscription:', JSON.stringify(userSubscription, null, 2));

    // 4. Test validating subscription
    console.log('\n4. Validating subscription...');
    const validation = await subscriptionService.validateSubscription(TEST_USER_ID);
    console.log('Validation result:', validation);

    // 5. Test updating subscription
    console.log('\n5. Updating subscription...');
    const updated = await subscriptionService.updateSubscription(subscription.id, {
      autoRenew: false,
      metadata: { test: 'value' }
    });
    console.log('Updated subscription:', JSON.stringify(updated, null, 2));

    // 6. Test recording a payment
    console.log('\n6. Recording payment...');
    await subscriptionService.recordPayment(
      subscription.id,
      PaymentStatus.PAID,
      29.99
    );
    console.log('Payment recorded successfully');

    // 7. Test canceling subscription
    console.log('\n7. Canceling subscription...');
    const canceled = await subscriptionService.cancelSubscription(subscription.id, true);
    console.log('Canceled subscription:', JSON.stringify(canceled, null, 2));

    console.log('\n=== All tests completed successfully! ===');
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

// Run the tests
testSubscriptionService();
