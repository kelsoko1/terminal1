# Firebase Subscription Service Migration

This document outlines the migration from Prisma-based subscriptions to Firebase Firestore-based subscriptions.

## Overview

We've migrated our subscription management system from using Prisma with a relational database to using Firebase Firestore. This change provides better scalability, real-time updates, and easier integration with Firebase Authentication and other Firebase services.

## Key Changes

1. **New Subscription Service**
   - Located at `lib/firebase/services/subscriptionService.ts`
   - Handles all subscription-related operations
   - Integrates with Firebase Firestore for data persistence

2. **API Endpoints**
   - `GET /api/subscriptions` - Get user's subscription and available plans
   - `POST /api/subscriptions` - Create a new subscription
   - `PATCH /api/subscriptions` - Update/cancel a subscription

3. **Data Models**
   - Updated subscription and payment models in `types/subscription.ts`
   - Added support for Firestore Timestamp and various subscription statuses

## Migration Steps

### 1. Run the Migration Script

Before deploying the new version, run the migration script to move existing subscription data to Firestore:

```bash
ts-node scripts/migrate-subscriptions.ts
```

This will:
- Copy all subscriptions from the Prisma database to Firestore
- Migrate associated payments
- Preserve all relationships and metadata

### 2. Update Environment Variables

Make sure these environment variables are set in your deployment:

```
GOOGLE_APPLICATION_CREDENTIALS=path/to/serviceAccountKey.json
NEXT_PUBLIC_FIREBASE_CONFIG='{"apiKey": "...", ...}'
```

### 3. Test the Service

Run the test script to verify everything is working:

```bash
ts-node scripts/test-subscription-service.ts
```

## API Reference

### Subscription Service Methods

- `getUserSubscription(userId: string)` - Get a user's active subscription
- `getAvailablePlans()` - Get all available subscription plans
- `createSubscription(userId, planId, paymentMethod, billingCycle, trialDays)` - Create a new subscription
- `updateSubscription(id, updates)` - Update subscription details
- `cancelSubscription(id, immediate = false)` - Cancel a subscription
- `validateSubscription(userId)` - Check if a user's subscription is valid
- `recordPayment(subscriptionId, status, amount)` - Record a payment for a subscription

### API Endpoints

#### GET /api/subscriptions

**Response**
```json
{
  "subscription": {
    "id": "sub_123",
    "status": "active",
    "planId": "premium-monthly",
    "startDate": "2023-01-01T00:00:00Z",
    "endDate": "2023-02-01T00:00:00Z",
    "autoRenew": true,
    "paymentStatus": "paid",
    "amount": 29.99,
    "currency": "USD",
    "billingCycle": "monthly"
  },
  "availablePlans": [
    {
      "id": "basic-monthly",
      "name": "Basic",
      "price": 9.99,
      "currency": "USD",
      "billingCycle": "monthly",
      "features": ["Feature 1", "Feature 2"]
    }
  ],
  "requiresSubscription": false
}
```

#### POST /api/subscriptions

**Request**
```json
{
  "planId": "premium-monthly",
  "paymentMethod": "pm_card_visa"
}
```

**Response**
```json
{
  "subscription": {
    "id": "sub_123",
    "status": "active",
    "planId": "premium-monthly",
    "startDate": "2023-01-01T00:00:00Z",
    "endDate": "2023-02-01T00:00:00Z",
    "autoRenew": true,
    "paymentStatus": "paid",
    "amount": 29.99,
    "currency": "USD",
    "billingCycle": "monthly"
  }
}
```

#### PATCH /api/subscriptions

**Request**
```json
{
  "subscriptionId": "sub_123",
  "action": "cancel"
}
```

**Response**
```json
{
  "subscription": {
    "id": "sub_123",
    "status": "canceled",
    "canceledAt": "2023-01-15T12:00:00Z"
  }
}
```

## Error Handling

All API endpoints return appropriate HTTP status codes and error messages in the following format:

```json
{
  "error": "Error message",
  "details": "Additional error details"
}
```

## Monitoring and Logging

- All subscription events are logged to the console in development
- In production, ensure proper logging is configured for Firebase
- Set up alerts for failed payments and subscription expirations

## Rollback Plan

In case of issues, you can roll back to the previous version by:

1. Reverting the code changes
2. Restoring the database from backup
3. Updating environment variables to point to the old database

## Future Improvements

- Implement webhook handlers for payment providers
- Add support for subscription proration
- Implement retry logic for failed payments
- Add more detailed analytics and reporting
- Support for team/organization subscriptions
