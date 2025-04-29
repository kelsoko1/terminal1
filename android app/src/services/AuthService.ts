import { database } from '../database/config';
import { databaseService } from './DatabaseService';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthCredentials {
  dsexId: string;
  password: string;
}

interface UserSession {
  userId: string;
  dsexId: string;
  token: string;
  expiresAt: number;
}

class AuthService {
  private static readonly AUTH_KEY = 'auth_session';
  private currentSession: UserSession | null = null;

  constructor() {
    this.loadSession();
  }

  private async loadSession() {
    try {
      const sessionData = await AsyncStorage.getItem(AuthService.AUTH_KEY);
      if (sessionData) {
        const session: UserSession = JSON.parse(sessionData);
        if (session.expiresAt > Date.now()) {
          this.currentSession = session;
        } else {
          await this.logout(); // Session expired
        }
      }
    } catch (error) {
      console.error('Error loading session:', error);
    }
  }

  private async saveSession(session: UserSession) {
    try {
      await AsyncStorage.setItem(AuthService.AUTH_KEY, JSON.stringify(session));
      this.currentSession = session;
    } catch (error) {
      console.error('Error saving session:', error);
      throw new Error('Failed to save session');
    }
  }

  public async login(credentials: AuthCredentials): Promise<UserSession> {
    try {
      // Authenticate with DSE Avvento API
      const response = await fetch('https://api.dse.com.bd/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error('Authentication failed');
      }

      const { userId, token, expiresIn } = await response.json();

      const session: UserSession = {
        userId,
        dsexId: credentials.dsexId,
        token,
        expiresAt: Date.now() + expiresIn * 1000,
      };

      await this.saveSession(session);

      // Initialize database for the user
      await this.initializeUserData(userId);

      // Start database synchronization
      databaseService.startSync();

      return session;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Login failed');
    }
  }

  public async logout(): Promise<void> {
    try {
      // Stop database synchronization
      databaseService.stopSync();

      // Clear session
      await AsyncStorage.removeItem(AuthService.AUTH_KEY);
      this.currentSession = null;

      // Clear sensitive data from database
      await this.clearUserData();
    } catch (error) {
      console.error('Logout error:', error);
      throw new Error('Logout failed');
    }
  }

  public async refreshToken(): Promise<void> {
    if (!this.currentSession) {
      throw new Error('No active session');
    }

    try {
      const response = await fetch('https://api.dse.com.bd/auth/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.currentSession.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const { token, expiresIn } = await response.json();

      const session: UserSession = {
        ...this.currentSession,
        token,
        expiresAt: Date.now() + expiresIn * 1000,
      };

      await this.saveSession(session);
    } catch (error) {
      console.error('Token refresh error:', error);
      await this.logout(); // Force logout on refresh failure
      throw new Error('Session expired');
    }
  }

  public async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    if (!this.currentSession) {
      throw new Error('No active session');
    }

    try {
      const response = await fetch('https://api.dse.com.bd/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.currentSession.token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (!response.ok) {
        throw new Error('Password change failed');
      }
    } catch (error) {
      console.error('Password change error:', error);
      throw new Error('Failed to change password');
    }
  }

  public getAuthHeaders(): Record<string, string> {
    if (!this.currentSession) {
      throw new Error('No active session');
    }

    return {
      'Authorization': `Bearer ${this.currentSession.token}`,
    };
  }

  public isAuthenticated(): boolean {
    return this.currentSession !== null && this.currentSession.expiresAt > Date.now();
  }

  public getCurrentUser(): { userId: string; dsexId: string } | null {
    if (!this.currentSession) {
      return null;
    }

    return {
      userId: this.currentSession.userId,
      dsexId: this.currentSession.dsexId,
    };
  }

  private async initializeUserData(userId: string) {
    try {
      // Create initial portfolio if doesn't exist
      const portfolios = await database.get('portfolios')
        .query(Q.where('user_id', userId))
        .fetch();

      if (portfolios.length === 0) {
        await database.write(async () => {
          await database.get('portfolios').create(portfolio => {
            portfolio.userId = userId;
            portfolio.name = 'Main Portfolio';
            portfolio.cashBalance = 0;
            portfolio.marketValue = 0;
          });
        });
      }

      // Create default watchlist if doesn't exist
      const watchlists = await database.get('watchlists')
        .query(Q.where('user_id', userId))
        .fetch();

      if (watchlists.length === 0) {
        await database.write(async () => {
          await database.get('watchlists').create(watchlist => {
            watchlist.userId = userId;
            watchlist.name = 'My Watchlist';
          });
        });
      }
    } catch (error) {
      console.error('Error initializing user data:', error);
      throw new Error('Failed to initialize user data');
    }
  }

  private async clearUserData() {
    if (!this.currentSession) {
      return;
    }

    const userId = this.currentSession.userId;

    try {
      await database.write(async () => {
        // Clear user-specific data
        await Promise.all([
          database.get('portfolios').query(Q.where('user_id', userId)).destroyAllPermanently(),
          database.get('watchlists').query(Q.where('user_id', userId)).destroyAllPermanently(),
          database.get('orders').query(Q.where('user_id', userId)).destroyAllPermanently(),
          database.get('transactions').query(Q.where('user_id', userId)).destroyAllPermanently(),
        ]);
      });
    } catch (error) {
      console.error('Error clearing user data:', error);
    }
  }
}

export const authService = new AuthService(); 