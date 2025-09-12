# Firebase Migration Guide

This guide will help you migrate your application from PostgreSQL to Firebase Firestore.

## Prerequisites

1. Node.js 14+ installed
2. Firebase project created at [Firebase Console](https://console.firebase.google.com/)
3. Firebase Admin SDK private key (JSON)
4. Existing PostgreSQL database with data to migrate

## Setup Instructions

### 1. Install Dependencies

```bash
npm install firebase firebase-admin
```

### 2. Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Update the Firebase configuration in `.env.local` with your Firebase project details.

### 3. Initialize Firebase Admin

1. Go to your Firebase Console
2. Navigate to Project Settings > Service Accounts
3. Click "Generate New Private Key"
4. Copy the contents of the downloaded JSON file into the corresponding environment variables in `.env.local`

### 4. Run the Migration Script

```bash
ts-node scripts/migrate-to-firestore.ts
```

This will migrate your data from PostgreSQL to Firestore while maintaining relationships.

## Service Architecture

### Services

- `userService`: Handles user-related operations
- `organizationService`: Manages organization data and relationships
- `subscriptionService`: Handles subscription management
- `postService`: Manages social posts and interactions
- `tradingService`: Handles trading operations and portfolio management

### Base Service

The `BaseService` class provides common CRUD operations that can be extended by other services.

## API Endpoints

All API endpoints have been updated to use Firestore. The API structure remains the same, but the implementation now uses Firebase services.

## Security Rules

Make sure to set up proper Firestore Security Rules to protect your data. Example rules are provided in `firestore.rules`.

## Deployment

1. Build your Next.js application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## Monitoring

Monitor your Firestore usage and set up alerts in the Firebase Console under the "Usage" section.

## Rollback Plan

In case of issues, you can rollback to the previous version by:

1. Reverting your Git changes
2. Updating the database connection string in your environment variables
3. Restarting your application

## Troubleshooting

### Common Issues

1. **Authentication Errors**: Make sure your Firebase Admin SDK credentials are correct
2. **Permission Denied**: Check your Firestore Security Rules
3. **Missing Data**: Verify that all collections and documents exist in Firestore

## Support

For support, please contact your development team or open an issue in the repository.
