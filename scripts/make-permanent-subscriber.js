// Script to make a user a super admin with permanent Rafiki+ subscription
const { Client } = require('pg');
require('dotenv').config(); // Load environment variables from .env file

// Create a PostgreSQL client with direct connection string
// Using parameters based on .env.example
const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'terminaldb',
  user: 'postgres',
  password: 'your_secure_password_here' // Replace with actual password
});

async function makeUserSuperAdminAndPermanentSubscriber(email) {
  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to PostgreSQL database');
    console.log(`Looking for user with email: ${email}`);
    
    // Find the user by email
    const userResult = await client.query(
      'SELECT * FROM "User" WHERE email = $1 LIMIT 1',
      [email]
    );

    if (userResult.rows.length === 0) {
      console.error(`User with email ${email} not found`);
      return;
    }

    const user = userResult.rows[0];
    console.log(`Found user: ${user.name || user.email} (ID: ${user.id})`);

    // Update user role to ADMIN
    await client.query(
      'UPDATE "User" SET role = $1 WHERE id = $2',
      ['ADMIN', user.id]
    );
    
    console.log(`Updated user role to ADMIN`);

    // Find Rafiki+ subscription plan
    const planResult = await client.query(
      'SELECT * FROM "SubscriptionPlan" WHERE name = $1 AND "isActive" = true LIMIT 1',
      ['Rafiki+']
    );

    let planId;
    
    if (planResult.rows.length === 0) {
      console.log('Rafiki+ subscription plan not found, creating it...');
      
      // Create Rafiki+ plan if it doesn't exist
      const planId = 'plan_rafiki_plus';
      const planFeatures = JSON.stringify([
        'Unlimited trades',
        'Real-time market data with level 2 data',
        'Advanced analytics and AI predictions',
        'Portfolio management with automated strategies',
        'Priority support',
        'API access'
      ]);
      
      const newPlanResult = await client.query(
        'INSERT INTO "SubscriptionPlan" (id, name, description, price, currency, interval, "intervalCount", features, "isActive", "createdAt", "updatedAt") ' +
        'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()) RETURNING id',
        [
          planId,
          'Rafiki+',
          'Advanced trading features for professionals',
          100.00,
          'USD',
          'MONTHLY',
          1,
          planFeatures,
          true
        ]
      );
      
      planId = newPlanResult.rows[0].id;
      console.log(`Created new Rafiki+ plan with ID: ${planId}`);
    } else {
      planId = planResult.rows[0].id;
      console.log(`Found existing Rafiki+ plan with ID: ${planId}`);
    }

    // Check if user already has an active subscription
    const subscriptionResult = await client.query(
      'SELECT * FROM "Subscription" WHERE "userId" = $1 AND status = $2 LIMIT 1',
      [user.id, 'ACTIVE']
    );

    const startDate = new Date();
    const endDate = new Date('2099-12-31'); // Far future date
    
    if (subscriptionResult.rows.length > 0) {
      const existingSubscription = subscriptionResult.rows[0];
      console.log(`User already has an active subscription (ID: ${existingSubscription.id})`);
      
      // Update the existing subscription to never expire
      await client.query(
        'UPDATE "Subscription" SET "planId" = $1, "endDate" = $2, "autoRenew" = $3, "updatedAt" = NOW() WHERE id = $4',
        [planId, endDate, true, existingSubscription.id]
      );
      
      console.log(`Updated existing subscription to permanent Rafiki+`);
    } else {
      // Create a new permanent subscription
      const subscriptionId = `sub_${Date.now()}`;
      
      await client.query(
        'INSERT INTO "Subscription" (id, "userId", "planId", status, "startDate", "endDate", "autoRenew", "paymentMethod", "lastPaymentDate", "nextPaymentDate", "createdAt", "updatedAt") ' +
        'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())',
        [
          subscriptionId,
          user.id,
          planId,
          'ACTIVE',
          startDate,
          endDate,
          true,
          'admin_override',
          startDate,
          endDate
        ]
      );
      
      console.log(`Created new permanent Rafiki+ subscription (ID: ${subscriptionId})`);
      
      // Create a payment record
      const paymentId = `pay_${Date.now()}`;
      const transactionId = `admin_perm_${Date.now()}`;
      
      await client.query(
        'INSERT INTO "Payment" (id, "subscriptionId", amount, currency, status, "paymentMethod", "transactionId", "createdAt", "updatedAt") ' +
        'VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())',
        [
          paymentId,
          subscriptionId,
          0, // Free for permanent admin
          'USD',
          'COMPLETED',
          'admin_override',
          transactionId
        ]
      );
      
      console.log(`Created payment record for the subscription`);
    }

    console.log(`Successfully made ${email} a super admin with permanent Rafiki+ subscription`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
    console.log('Disconnected from PostgreSQL database');
  }
}

// Execute the function with the specified email
makeUserSuperAdminAndPermanentSubscriber('elvinasenga@gmail.com')
  .then(() => console.log('Operation completed'))
  .catch(error => console.error('Operation failed:', error))
  .finally(() => process.exit(0)); // Ensure the script exits
