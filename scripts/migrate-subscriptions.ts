import { PrismaClient } from '@prisma/client';
import { adminDb } from '@/lib/firebase/admin';
import { SubscriptionStatus, PaymentStatus } from '@/types/subscription';
import { Timestamp } from 'firebase-admin/firestore';

const prisma = new PrismaClient();

async function migrateSubscriptions() {
  try {
    console.log('Starting subscription migration...');
    
    // 1. Fetch all subscriptions from Prisma
    const subscriptions = await prisma.subscription.findMany({
      include: {
        user: true,
        plan: true,
        payments: true,
      },
    });

    console.log(`Found ${subscriptions.length} subscriptions to migrate`);

    let successCount = 0;
    let errorCount = 0;

    // 2. Process each subscription
    for (const sub of subscriptions) {
      try {
        // Skip if user doesn't exist
        if (!sub.user) {
          console.warn(`Skipping subscription ${sub.id} - user not found`);
          errorCount++;
          continue;
        }


        // 3. Prepare subscription data for Firestore
        const subscriptionData = {
          id: sub.id,
          userId: sub.userId,
          planId: sub.planId,
          status: mapStatus(sub.status) as SubscriptionStatus,
          startDate: Timestamp.fromDate(sub.startDate),
          endDate: Timestamp.fromDate(sub.endDate),
          autoRenew: sub.autoRenew,
          paymentMethod: sub.paymentMethod || undefined,
          lastPaymentDate: sub.lastPaymentDate ? Timestamp.fromDate(sub.lastPaymentDate) : null,
          nextPaymentDate: sub.nextPaymentDate ? Timestamp.fromDate(sub.nextPaymentDate) : null,
          paymentStatus: mapPaymentStatus(sub.paymentStatus) as PaymentStatus,
          amount: sub.amount.toNumber(),
          currency: sub.currency || 'USD',
          billingCycle: sub.billingCycle?.toLowerCase() === 'yearly' ? 'yearly' : 'monthly',
          trialEndsAt: sub.trialEndsAt ? Timestamp.fromDate(sub.trialEndsAt) : null,
          canceledAt: sub.canceledAt ? Timestamp.fromDate(sub.canceledAt) : null,
          metadata: sub.metadata || {},
          createdAt: Timestamp.fromDate(sub.createdAt),
          updatedAt: Timestamp.fromDate(sub.updatedAt),
        };

        // 4. Create subscription in Firestore
        await adminDb.collection('subscriptions').doc(sub.id).set(subscriptionData);

        // 5. Migrate payments if they exist
        if (sub.payments && sub.payments.length > 0) {
          const batch = adminDb.batch();
          const paymentsRef = adminDb.collection('payments');
          
          for (const payment of sub.payments) {
            const paymentRef = paymentsRef.doc(payment.id);
            batch.set(paymentRef, {
              id: payment.id,
              subscriptionId: sub.id,
              amount: payment.amount.toNumber(),
              currency: payment.currency || 'USD',
              status: mapPaymentStatus(payment.status) as PaymentStatus,
              paymentMethod: payment.paymentMethod || undefined,
              paymentIntentId: payment.paymentIntentId || undefined,
              receiptUrl: payment.receiptUrl || undefined,
              createdAt: Timestamp.fromDate(payment.createdAt),
              metadata: payment.metadata || {},
            });
          }
          
          await batch.commit();
        }


        successCount++;
        console.log(`Migrated subscription ${sub.id} for user ${sub.user.email}`);
      } catch (error) {
        console.error(`Error migrating subscription ${sub.id}:`, error);
        errorCount++;
      }
    }

    console.log(`\nMigration complete!`);
    console.log(`- Successfully migrated: ${successCount} subscriptions`);
    console.log(`- Failed to migrate: ${errorCount} subscriptions`);

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

function mapStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'ACTIVE': 'active',
    'CANCELED': 'canceled',
    'EXPIRED': 'expired',
    'PAUSED': 'paused',
    'TRIAL': 'trial',
  };
  return statusMap[status] || status.toLowerCase();
}

function mapPaymentStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'PAID': 'paid',
    'PENDING': 'pending',
    'FAILED': 'failed',
    'REFUNDED': 'refunded',
    'CANCELED': 'canceled',
  };
  return statusMap[status] || status.toLowerCase();
}

// Run the migration
migrateSubscriptions();
