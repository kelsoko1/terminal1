import { NextApiRequest, NextApiResponse } from 'next';
import { prismaRemote } from '@/lib/database/prismaClients';
import { getSession } from 'next-auth/react';

// Function to convert USD to other currencies
const convertCurrency = async (amount: number, targetCurrency: string): Promise<number> => {
  try {
    // In a real implementation, you would fetch live exchange rates from an API
    // For now, we'll use a static mapping for demonstration
    const exchangeRates: Record<string, number> = {
      'USD': 1,
      'EUR': 0.92,
      'GBP': 0.78,
      'JPY': 150.25,
      'CAD': 1.36,
      'AUD': 1.52,
      'CHF': 0.90,
      'CNY': 7.24,
      'INR': 83.45,
      'KES': 130.25
    };
    
    return amount * (exchangeRates[targetCurrency] || 1);
  } catch (error) {
    console.error('Error converting currency:', error);
    return amount; // Return original amount if conversion fails
  }
};

// Define the default subscription plans (will be stored in database in production)
const DEFAULT_SUBSCRIPTION_PLANS = [
  {
    id: 'plan_rafiki',
    name: 'Rafiki',
    description: 'Essential trading features for beginners',
    price: 10.00,
    currency: 'USD',
    interval: 'MONTHLY',
    intervalCount: 1,
    features: [
      'Basic trade execution',
      'Market data',
      'Portfolio tracking',
      'Email support'
    ],
    isActive: true
  },
  {
    id: 'plan_rafiki_plus',
    name: 'Rafiki+',
    description: 'Advanced trading features for professionals',
    price: 100.00,
    currency: 'USD',
    interval: 'MONTHLY',
    intervalCount: 1,
    features: [
      'Unlimited trades',
      'Real-time market data with level 2 data',
      'Advanced analytics and AI predictions',
      'Portfolio management with automated strategies',
      'Priority support',
      'API access'
    ],
    isActive: true
  }
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Get user session
  const session = await getSession({ req });

  if (!session || !session.user) {
    return res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'Please sign in to access subscription information',
      requiresSubscription: true 
    });
  }
  
  // Get user ID from database using email
  const userResult = await prismaRemote.$queryRaw`
    SELECT id FROM "User" WHERE email = ${session.user.email || ''} LIMIT 1
  `;
  
  const user = userResult.length > 0 ? userResult[0] : null;
  
  if (!user) {
    return res.status(404).json({ 
      error: 'User not found',
      requiresSubscription: true 
    });
  }
  
  const userId = user.id;

  try {
    if (req.method === 'GET') {
      // Check if subscription plans exist in the database, if not create them
      const plansCount = await prismaRemote.$queryRaw`
        SELECT COUNT(*) as count FROM "SubscriptionPlan"
      `;
      
      if (plansCount[0].count === 0) {
        // Insert default plans if none exist
        for (const plan of DEFAULT_SUBSCRIPTION_PLANS) {
          await prismaRemote.$queryRaw`
            INSERT INTO "SubscriptionPlan" (id, name, description, price, currency, interval, interval_count, features, "isActive")
            VALUES (
              ${plan.id},
              ${plan.name},
              ${plan.description},
              ${plan.price},
              ${plan.currency},
              ${plan.interval},
              ${plan.intervalCount},
              ${JSON.stringify(plan.features)},
              ${plan.isActive}
            )
          `;
        }
      }
      
      // Get user's subscription with plan and payment history
      const subscriptionData = await prismaRemote.$queryRaw`
        SELECT s.*, p.id as plan_id, p.name as plan_name, p.description as plan_description, 
               p.price as plan_price, p.currency as plan_currency, p.interval as plan_interval, 
               p.interval_count as plan_interval_count, p.features as plan_features
        FROM "Subscription" s
        JOIN "SubscriptionPlan" p ON s."planId" = p.id
        WHERE s."userId" = ${userId}
        ORDER BY s."createdAt" DESC
        LIMIT 1
      `;

      // Get payment history if subscription exists
      let paymentHistory = [];
      if (subscriptionData.length > 0) {
        paymentHistory = await prismaRemote.$queryRaw`
          SELECT id, amount, currency, status, "createdAt"
          FROM "Payment"
          WHERE "subscriptionId" = ${subscriptionData[0]?.id || ''}
          ORDER BY "createdAt" DESC
        `;
      }

      // Format subscription data
      const subscription = subscriptionData.length > 0 ? {
        id: subscriptionData[0].id,
        status: subscriptionData[0].status,
        startDate: subscriptionData[0].startDate,
        endDate: subscriptionData[0].endDate,
        autoRenew: subscriptionData[0].autoRenew,
        nextPaymentDate: subscriptionData[0].nextPaymentDate,
        plan: {
          id: subscriptionData[0].plan_id,
          name: subscriptionData[0].plan_name,
          description: subscriptionData[0].plan_description,
          price: Number(subscriptionData[0].plan_price),
          currency: subscriptionData[0].plan_currency,
          interval: subscriptionData[0].plan_interval,
          intervalCount: subscriptionData[0].plan_interval_count,
          features: subscriptionData[0].plan_features || []
        },
        paymentHistory: paymentHistory || []
      } : null;

      // Get all available subscription plans
      const plansData = await prismaRemote.$queryRaw`
        SELECT id, name, description, price, currency, interval, interval_count as "intervalCount", features
        FROM "SubscriptionPlan"
        WHERE "isActive" = true
        ORDER BY price ASC
      `;

      // Format plans data
      const plans = Array.isArray(plansData) ? plansData.map(plan => ({
        id: plan.id,
        name: plan.name,
        description: plan.description,
        price: Number(plan.price),
        currency: plan.currency,
        interval: plan.interval,
        intervalCount: plan.intervalCount,
        features: plan.features || []
      })) : [];
      
      // Add flag to indicate if user needs to subscribe
      const requiresSubscription = !subscription || subscription.status !== 'ACTIVE';
      
      return res.status(200).json({
        subscription,
        availablePlans: plans,
        requiresSubscription
      });
    } else if (req.method === 'PATCH') {
      const { subscriptionId, action } = req.body;

      if (!subscriptionId) {
        return res.status(400).json({ error: 'Subscription ID is required' });
      }

      // Check if the subscription belongs to the user
      const subscriptionCheck = await prismaRemote.$queryRaw`
        SELECT id, "autoRenew"
        FROM "Subscription"
        WHERE id = ${subscriptionId}
        AND "userId" = ${userId}
        LIMIT 1
      `;

      const subscription = subscriptionCheck.length > 0 ? subscriptionCheck[0] : null;

      if (!subscription) {
        return res.status(404).json({ 
          error: 'Subscription not found',
          requiresSubscription: true 
        });
      }

      if (action === 'toggleAutoRenew') {
        // Update auto-renew setting
        await prismaRemote.$queryRaw`
          UPDATE "Subscription"
          SET "autoRenew" = ${!subscription.autoRenew}, 
              "updatedAt" = NOW()
          WHERE id = ${subscriptionId}
        `;

        // Get updated subscription
        const updatedSubscriptionData = await prismaRemote.$queryRaw`
          SELECT s.*, p.id as plan_id, p.name as plan_name, p.description as plan_description, 
                p.price as plan_price, p.currency as plan_currency, p.interval as plan_interval, 
                p.interval_count as plan_interval_count, p.features as plan_features
          FROM "Subscription" s
          JOIN "SubscriptionPlan" p ON s."planId" = p.id
          WHERE s.id = ${subscriptionId}
          LIMIT 1
        `;

        // Format updated subscription data
        const updatedSubscription = {
          id: updatedSubscriptionData[0].id,
          status: updatedSubscriptionData[0].status,
          startDate: updatedSubscriptionData[0].startDate,
          endDate: updatedSubscriptionData[0].endDate,
          autoRenew: updatedSubscriptionData[0].autoRenew,
          nextPaymentDate: updatedSubscriptionData[0].nextPaymentDate,
          plan: {
            id: updatedSubscriptionData[0].plan_id,
            name: updatedSubscriptionData[0].plan_name,
            description: updatedSubscriptionData[0].plan_description,
            price: Number(updatedSubscriptionData[0].plan_price),
            currency: updatedSubscriptionData[0].plan_currency,
            interval: updatedSubscriptionData[0].plan_interval,
            intervalCount: updatedSubscriptionData[0].plan_interval_count,
            features: updatedSubscriptionData[0].plan_features || []
          }
        };

        return res.status(200).json(updatedSubscription);
      } else if (action === 'cancel') {
        // Update subscription status to CANCELLED
        await prismaRemote.$queryRaw`
          UPDATE "Subscription"
          SET status = 'CANCELLED', 
              "updatedAt" = NOW(),
              "cancelledAt" = NOW()
          WHERE id = ${subscriptionId}
        `;

        // Get updated subscription
        const updatedSubscriptionData = await prismaRemote.$queryRaw`
          SELECT s.*, p.id as plan_id, p.name as plan_name, p.description as plan_description, 
                p.price as plan_price, p.currency as plan_currency, p.interval as plan_interval, 
                p.interval_count as plan_interval_count, p.features as plan_features
          FROM "Subscription" s
          JOIN "SubscriptionPlan" p ON s."planId" = p.id
          WHERE s.id = ${subscriptionId}
          LIMIT 1
        `;

        // Format updated subscription data
        const updatedSubscription = {
          id: updatedSubscriptionData[0].id,
          status: updatedSubscriptionData[0].status,
          startDate: updatedSubscriptionData[0].startDate,
          endDate: updatedSubscriptionData[0].endDate,
          autoRenew: updatedSubscriptionData[0].autoRenew,
          nextPaymentDate: updatedSubscriptionData[0].nextPaymentDate,
          plan: {
            id: updatedSubscriptionData[0].plan_id,
            name: updatedSubscriptionData[0].plan_name,
            description: updatedSubscriptionData[0].plan_description,
            price: Number(updatedSubscriptionData[0].plan_price),
            currency: updatedSubscriptionData[0].plan_currency,
            interval: updatedSubscriptionData[0].plan_interval,
            intervalCount: updatedSubscriptionData[0].plan_interval_count,
            features: updatedSubscriptionData[0].plan_features || []
          }
        };

        return res.status(200).json(updatedSubscription);
      }

      return res.status(400).json({ error: 'Invalid action' });
    } else if (req.method === 'POST') {
      // Handle subscription creation or upgrade
      const { planId, paymentMethod, currency = 'USD' } = req.body;

      if (!planId) {
        return res.status(400).json({ error: 'Plan ID is required' });
      }

      // Get plan details
      const planData = await prismaRemote.$queryRaw`
        SELECT id, name, description, price, currency, interval, interval_count as "intervalCount", features
        FROM "SubscriptionPlan"
        WHERE id = ${planId}
        LIMIT 1
      `;

      const plan = planData.length > 0 ? {
        id: planData[0].id,
        name: planData[0].name,
        description: planData[0].description,
        price: Number(planData[0].price),
        currency: planData[0].currency,
        interval: planData[0].interval,
        intervalCount: planData[0].intervalCount,
        features: planData[0].features || []
      } : null;

      if (!plan) {
        return res.status(404).json({ error: 'Plan not found' });
      }

      // Calculate end date based on plan interval
      let endDate = new Date();
      if (plan.interval === 'MONTHLY') {
        endDate.setMonth(endDate.getMonth() + plan.intervalCount);
      } else if (plan.interval === 'QUARTERLY') {
        endDate.setMonth(endDate.getMonth() + (3 * plan.intervalCount));
      } else if (plan.interval === 'YEARLY') {
        endDate.setFullYear(endDate.getFullYear() + plan.intervalCount);
      }

      // Convert price if needed
      let finalPrice = plan.price;
      if (currency !== 'USD') {
        finalPrice = await convertCurrency(plan.price, currency);
      }

      // Generate IDs for new records
      const subscriptionId = `sub_${Date.now()}`;
      const paymentId = `pay_${Date.now()}`;
      const transactionId = `tx_${Date.now()}`;
      const startDate = new Date();

      // Create subscription
      await prismaRemote.$queryRaw`
        INSERT INTO "Subscription" (id, "userId", "planId", status, "startDate", "endDate", "autoRenew", "paymentMethod", "lastPaymentDate", "nextPaymentDate", "createdAt", "updatedAt")
        VALUES (
          ${subscriptionId},
          ${userId},
          ${planId},
          'ACTIVE',
          ${startDate},
          ${endDate},
          true,
          ${paymentMethod || 'card'},
          ${startDate},
          ${endDate},
          ${startDate},
          ${startDate}
        )
      `;

      // Create payment record
      await prismaRemote.$queryRaw`
        INSERT INTO "Payment" (id, "subscriptionId", amount, currency, status, "paymentMethod", "transactionId", "createdAt", "updatedAt")
        VALUES (
          ${paymentId},
          ${subscriptionId},
          ${finalPrice},
          ${currency},
          'COMPLETED',
          ${paymentMethod || 'card'},
          ${transactionId},
          ${startDate},
          ${startDate}
        )
      `;

      // Get the new subscription with plan details
      const newSubscriptionData = await prismaRemote.$queryRaw`
        SELECT s.*, p.id as plan_id, p.name as plan_name, p.description as plan_description, 
              p.price as plan_price, p.currency as plan_currency, p.interval as plan_interval, 
              p.interval_count as plan_interval_count, p.features as plan_features
        FROM "Subscription" s
        JOIN "SubscriptionPlan" p ON s."planId" = p.id
        WHERE s.id = ${subscriptionId}
        LIMIT 1
      `;

      // Format new subscription data
      const newSubscription = {
        id: newSubscriptionData[0].id,
        status: newSubscriptionData[0].status,
        startDate: newSubscriptionData[0].startDate,
        endDate: newSubscriptionData[0].endDate,
        autoRenew: newSubscriptionData[0].autoRenew,
        nextPaymentDate: newSubscriptionData[0].nextPaymentDate,
        plan: {
          id: newSubscriptionData[0].plan_id,
          name: newSubscriptionData[0].plan_name,
          description: newSubscriptionData[0].plan_description,
          price: Number(newSubscriptionData[0].plan_price),
          currency: newSubscriptionData[0].plan_currency,
          interval: newSubscriptionData[0].plan_interval,
          intervalCount: newSubscriptionData[0].plan_interval_count,
          features: newSubscriptionData[0].plan_features || []
        }
      };

      return res.status(200).json(newSubscription);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Subscription API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
