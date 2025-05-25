import { Platform } from 'react-native';
import Constants from 'expo-constants';

type Environment = 'development' | 'staging' | 'production';

interface Config {
  apiUrl: string;
  wsUrl: string;
  environment: Environment;
  version: string;
  buildNumber: string;
  sentryDsn: string;
  firebaseConfig: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId: string;
  };
  features: {
    biometricAuth: boolean;
    pushNotifications: boolean;
    offlineMode: boolean;
    analytics: boolean;
    errorReporting: boolean;
  };
  cache: {
    defaultTTL: number;
    maxSize: number;
  };
  api: {
    timeout: number;
    retryAttempts: number;
    retryDelay: number;
  };
}

const development: Config = {
  apiUrl: 'http://localhost:3000',
  wsUrl: 'ws://localhost:3000',
  environment: 'development',
  version: Constants.expoConfig?.version || '1.0.0',
  buildNumber: Constants.expoConfig?.ios?.buildNumber || '1',
  sentryDsn: 'YOUR_SENTRY_DSN_DEV',
  firebaseConfig: {
    apiKey: 'YOUR_API_KEY_DEV',
    authDomain: 'your-app-dev.firebaseapp.com',
    projectId: 'your-app-dev',
    storageBucket: 'your-app-dev.appspot.com',
    messagingSenderId: 'YOUR_SENDER_ID_DEV',
    appId: 'YOUR_APP_ID_DEV',
    measurementId: 'YOUR_MEASUREMENT_ID_DEV'
  },
  features: {
    biometricAuth: true,
    pushNotifications: true,
    offlineMode: true,
    analytics: false,
    errorReporting: false
  },
  cache: {
    defaultTTL: 5 * 60 * 1000, // 5 minutes
    maxSize: 50 * 1024 * 1024 // 50MB
  },
  api: {
    timeout: 10000,
    retryAttempts: 3,
    retryDelay: 1000
  }
};

const staging: Config = {
  ...development,
  apiUrl: 'https://api-staging.webtrader.com',
  wsUrl: 'wss://ws-staging.webtrader.com',
  environment: 'staging',
  sentryDsn: 'YOUR_SENTRY_DSN_STAGING',
  firebaseConfig: {
    apiKey: 'YOUR_API_KEY_STAGING',
    authDomain: 'your-app-staging.firebaseapp.com',
    projectId: 'your-app-staging',
    storageBucket: 'your-app-staging.appspot.com',
    messagingSenderId: 'YOUR_SENDER_ID_STAGING',
    appId: 'YOUR_APP_ID_STAGING',
    measurementId: 'YOUR_MEASUREMENT_ID_STAGING'
  },
  features: {
    ...development.features,
    analytics: true,
    errorReporting: true
  }
};

const production: Config = {
  ...staging,
  apiUrl: 'https://api.webtrader.com',
  wsUrl: 'wss://ws.webtrader.com',
  environment: 'production',
  sentryDsn: 'YOUR_SENTRY_DSN_PROD',
  firebaseConfig: {
    apiKey: 'YOUR_API_KEY_PROD',
    authDomain: 'your-app.firebaseapp.com',
    projectId: 'your-app',
    storageBucket: 'your-app.appspot.com',
    messagingSenderId: 'YOUR_SENDER_ID_PROD',
    appId: 'YOUR_APP_ID_PROD',
    measurementId: 'YOUR_MEASUREMENT_ID_PROD'
  },
  cache: {
    defaultTTL: 15 * 60 * 1000, // 15 minutes
    maxSize: 100 * 1024 * 1024 // 100MB
  },
  api: {
    timeout: 30000,
    retryAttempts: 5,
    retryDelay: 2000
  }
};

function getEnvironment(): Environment {
  if (__DEV__) return 'development';
  if (Constants.expoConfig?.releaseChannel === 'staging') return 'staging';
  return 'production';
}

const configs = {
  development,
  staging,
  production
};

export default configs[getEnvironment()]; 