import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';

// Biometric authentication
export async function authenticateUser(): Promise<boolean> {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) {
      return false;
    }

    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    if (!isEnrolled) {
      return false;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to access WebTrader',
      fallbackLabel: 'Use PIN/Pattern',
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
    });

    return result.success;
  } catch (error) {
    console.error('Authentication error:', error);
    return false;
  }
}

// Secure storage
export const secureStorage = {
  async save(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error('Error saving to secure storage:', error);
      throw error;
    }
  },

  async get(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('Error reading from secure storage:', error);
      throw error;
    }
  },

  async remove(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('Error removing from secure storage:', error);
      throw error;
    }
  }
};

// Session management
export class SessionManager {
  private static readonly SESSION_KEY = 'user_session';
  private static readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

  static async startSession(userData: any): Promise<void> {
    const session = {
      user: userData,
      timestamp: Date.now(),
      deviceInfo: {
        platform: Platform.OS,
        version: Platform.Version,
      }
    };
    await secureStorage.save(this.SESSION_KEY, JSON.stringify(session));
  }

  static async checkSession(): Promise<boolean> {
    const sessionData = await secureStorage.get(this.SESSION_KEY);
    if (!sessionData) return false;

    const session = JSON.parse(sessionData);
    const isValid = (Date.now() - session.timestamp) < this.SESSION_TIMEOUT;
    
    if (!isValid) {
      await this.endSession();
    }
    return isValid;
  }

  static async endSession(): Promise<void> {
    await secureStorage.remove(this.SESSION_KEY);
  }
}

// PIN management
export class PINManager {
  private static readonly PIN_KEY = 'user_pin';
  private static readonly MAX_ATTEMPTS = 3;
  private static readonly ATTEMPTS_KEY = 'pin_attempts';
  private static readonly LOCKOUT_TIME = 5 * 60 * 1000; // 5 minutes

  static async setPIN(pin: string): Promise<void> {
    if (!this.isValidPIN(pin)) {
      throw new Error('Invalid PIN format');
    }
    await secureStorage.save(this.PIN_KEY, pin);
  }

  static async verifyPIN(pin: string): Promise<boolean> {
    const storedPIN = await secureStorage.get(this.PIN_KEY);
    return storedPIN === pin;
  }

  static async resetPIN(): Promise<void> {
    await secureStorage.remove(this.PIN_KEY);
  }

  private static isValidPIN(pin: string): boolean {
    return /^\d{6}$/.test(pin);
  }

  static async handlePINAttempt(pin: string): Promise<boolean> {
    const attemptsStr = await secureStorage.get(this.ATTEMPTS_KEY);
    const attempts = attemptsStr ? JSON.parse(attemptsStr) : { count: 0, timestamp: 0 };

    if (attempts.count >= this.MAX_ATTEMPTS) {
      if (Date.now() - attempts.timestamp < this.LOCKOUT_TIME) {
        throw new Error('Account temporarily locked. Please try again later.');
      }
      attempts.count = 0;
    }

    const isCorrect = await this.verifyPIN(pin);
    if (!isCorrect) {
      attempts.count += 1;
      attempts.timestamp = Date.now();
      await secureStorage.save(this.ATTEMPTS_KEY, JSON.stringify(attempts));
    } else {
      await secureStorage.remove(this.ATTEMPTS_KEY);
    }

    return isCorrect;
  }
} 