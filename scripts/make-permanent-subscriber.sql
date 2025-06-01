-- SQL script to make elvinasenga@gmail.com a super admin user with a permanent Rafiki+ subscription
-- Run this script directly on the database server with: psql -U postgres -d terminaldb -f make-permanent-subscriber.sql

-- Declare variables for the user
DO $$
DECLARE
    target_email VARCHAR := 'elvinasenga@gmail.com';
    user_id VARCHAR;
    plan_id VARCHAR;
    subscription_id VARCHAR;
    payment_id VARCHAR;
    transaction_id VARCHAR;
    start_date TIMESTAMP;
    end_date TIMESTAMP;
BEGIN
    -- Find the user by email
    SELECT id INTO user_id FROM "User" WHERE email = target_email;
    
    IF user_id IS NULL THEN
        RAISE NOTICE 'User with email % not found', target_email;
        RETURN;
    END IF;
    
    RAISE NOTICE 'Found user with ID: %', user_id;
    
    -- Update user role to ADMIN
    UPDATE "User" SET role = 'ADMIN' WHERE id = user_id;
    RAISE NOTICE 'Updated user role to ADMIN';
    
    -- Find or create Rafiki+ subscription plan
    SELECT id INTO plan_id FROM "SubscriptionPlan" WHERE name = 'Rafiki+' AND "isActive" = true LIMIT 1;
    
    IF plan_id IS NULL THEN
        RAISE NOTICE 'Rafiki+ plan not found, creating it...';
        
        -- Generate a plan ID
        plan_id := 'plan_rafiki_plus';
        
        -- Create the Rafiki+ plan
        INSERT INTO "SubscriptionPlan" (
            id, name, description, price, currency, interval, "intervalCount", 
            features, "isActive", "createdAt", "updatedAt"
        ) VALUES (
            plan_id,
            'Rafiki+',
            'Advanced trading features for professionals',
            100.00,
            'USD',
            'MONTHLY',
            1,
            '["Unlimited trades", "Real-time market data with level 2 data", "Advanced analytics and AI predictions", "Portfolio management with automated strategies", "Priority support", "API access"]',
            true,
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Created Rafiki+ plan with ID: %', plan_id;
    ELSE
        RAISE NOTICE 'Found existing Rafiki+ plan with ID: %', plan_id;
    END IF;
    
    -- Set dates for subscription
    start_date := NOW();
    end_date := '2099-12-31 23:59:59'::TIMESTAMP; -- Far future date
    
    -- Check if user already has an active subscription
    SELECT id INTO subscription_id FROM "Subscription" 
    WHERE "userId" = user_id AND status = 'ACTIVE' LIMIT 1;
    
    IF subscription_id IS NOT NULL THEN
        RAISE NOTICE 'User already has an active subscription (ID: %)', subscription_id;
        
        -- Update the existing subscription to never expire
        UPDATE "Subscription" 
        SET "planId" = plan_id, 
            "endDate" = end_date, 
            "autoRenew" = true,
            "updatedAt" = NOW()
        WHERE id = subscription_id;
        
        RAISE NOTICE 'Updated existing subscription to permanent Rafiki+';
    ELSE
        -- Generate IDs
        subscription_id := 'sub_' || EXTRACT(EPOCH FROM NOW())::BIGINT;
        
        -- Create a new permanent subscription
        INSERT INTO "Subscription" (
            id, "userId", "planId", status, "startDate", "endDate", 
            "autoRenew", "paymentMethod", "lastPaymentDate", "nextPaymentDate", 
            "createdAt", "updatedAt"
        ) VALUES (
            subscription_id,
            user_id,
            plan_id,
            'ACTIVE',
            start_date,
            end_date,
            true,
            'admin_override',
            start_date,
            end_date,
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Created new permanent Rafiki+ subscription (ID: %)', subscription_id;
        
        -- Generate payment ID and transaction ID
        payment_id := 'pay_' || EXTRACT(EPOCH FROM NOW())::BIGINT;
        transaction_id := 'admin_perm_' || EXTRACT(EPOCH FROM NOW())::BIGINT;
        
        -- Create a payment record
        INSERT INTO "Payment" (
            id, "subscriptionId", amount, currency, status, 
            "paymentMethod", "transactionId", "createdAt", "updatedAt"
        ) VALUES (
            payment_id,
            subscription_id,
            0, -- Free for permanent admin
            'USD',
            'COMPLETED',
            'admin_override',
            transaction_id,
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Created payment record for the subscription';
    END IF;
    
    RAISE NOTICE 'Successfully made % a super admin with permanent Rafiki+ subscription', target_email;
END $$;
