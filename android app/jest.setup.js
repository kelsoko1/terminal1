import 'react-native-gesture-handler/jestSetup';
import '@testing-library/jest-native/extend-expect';

// Mock Expo modules
jest.mock('expo-constants', () => ({
  expoConfig: {
    version: '1.0.0',
    ios: { buildNumber: '1' },
    android: { versionCode: 1 },
  },
}));

jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('expo-local-authentication', () => ({
  hasHardwareAsync: jest.fn(),
  isEnrolledAsync: jest.fn(),
  authenticateAsync: jest.fn(),
}));

jest.mock('expo-file-system', () => ({
  cacheDirectory: 'file://cache/',
  documentDirectory: 'file://documents/',
  downloadAsync: jest.fn(),
  getInfoAsync: jest.fn(),
  makeDirectoryAsync: jest.fn(),
  readDirectoryAsync: jest.fn(),
  deleteAsync: jest.fn(),
}));

// Mock Firebase Analytics
jest.mock('@react-native-firebase/analytics', () => ({
  __esModule: true,
  default: () => ({
    logEvent: jest.fn(),
    setUserProperty: jest.fn(),
    logScreenView: jest.fn(),
  }),
}));

// Mock Sentry
jest.mock('@sentry/react-native', () => ({
  init: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  multiSet: jest.fn(),
  multiGet: jest.fn(),
}));

// Mock NetInfo
jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
}));

// Mock react-native reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Silence the warning: Animated: `useNativeDriver` is not supported
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock platform specific code
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'ios',
  select: jest.fn(obj => obj.ios),
}));

// Global setup
global.fetch = jest.fn();
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
}; 