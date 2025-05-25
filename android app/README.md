# WebTrader Mobile App

A React Native mobile application for the WebTrader platform that integrates with the Next.js backend.

## Features

- User authentication (login, registration, password reset)
- Portfolio tracking and management
- Market watchlist
- Financial news feed
- Subscription management
- Payment processing
- Dark/Light theme support

## Prerequisites

- Node.js (v16 or newer)
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

## Getting Started

### Installation

1. Clone the repository
2. Install dependencies:

```bash
cd android\ app
npm install
# or
yarn install
```

### Configuration

1. Update the API base URL in `src/utils/apiUtils.ts` to point to your Next.js backend:

```typescript
export const getApiBaseUrl = (): string => {
  return __DEV__ 
    ? 'http://10.0.2.2:3000/api'  // Development - Android emulator accessing localhost
    : 'https://your-production-domain.com/api';  // Production
};
```

### Running the App

#### Development

```bash
# Start the Expo development server
npm start
# or
yarn start

# Run on Android
npm run android
# or
yarn android

# Run on iOS (macOS only)
npm run ios
# or
yarn ios
```

### Building for Production

#### Android

1. Generate a production build:

```bash
expo build:android
```

2. Follow the prompts to create an APK or Android App Bundle.

#### iOS (macOS only)

1. Generate a production build:

```bash
expo build:ios
```

2. Follow the prompts to create an iOS build.

## Integration with Next.js Backend

This mobile app is designed to work with the WebTrader Next.js backend. It connects to the following API endpoints:

- `/api/auth/*` - Authentication endpoints
- `/api/users/*` - User profile management
- `/api/social/*` - Social feed and interactions
- `/api/subscription-plans/*` - Subscription plan management
- `/api/subscriptions/*` - User subscription management
- `/api/research/*` - Research reports and market analysis
- `/api/market/*` - Market data and watchlist management
- `/api/portfolio/*` - Portfolio management and order placement

## Architecture

The app follows a modular architecture:

- `src/components` - Reusable UI components
- `src/screens` - App screens
- `src/navigation` - Navigation configuration
- `src/services` - API services and business logic
- `src/theme` - Theme configuration
- `src/utils` - Utility functions
- `src/database` - Local database configuration and models

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
