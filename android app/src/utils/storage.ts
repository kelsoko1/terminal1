import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

// Storage keys
const STORAGE_KEYS = {
  PORTFOLIO_DATA: 'portfolio_data',
  WATCHLIST_DATA: 'watchlist_data',
  NEWS_DATA: 'news_data',
  USER_PREFERENCES: 'user_preferences',
  CACHED_IMAGES: 'cached_images',
  LAST_SYNC: 'last_sync',
};

// Storage manager
export class StorageManager {
  // Basic storage operations
  static async save(key: string, data: any): Promise<void> {
    try {
      const jsonValue = JSON.stringify(data);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error('Error saving data:', error);
      throw error;
    }
  }

  static async get(key: string): Promise<any> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Error reading data:', error);
      throw error;
    }
  }

  static async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing data:', error);
      throw error;
    }
  }

  // Batch operations
  static async multiSave(keyValuePairs: [string, any][]): Promise<void> {
    try {
      const pairs = keyValuePairs.map(([key, value]) => [
        key,
        JSON.stringify(value),
      ]);
      await AsyncStorage.multiSet(pairs);
    } catch (error) {
      console.error('Error in batch save:', error);
      throw error;
    }
  }

  static async multiGet(keys: string[]): Promise<{ [key: string]: any }> {
    try {
      const pairs = await AsyncStorage.multiGet(keys);
      return pairs.reduce((acc, [key, value]) => {
        acc[key] = value ? JSON.parse(value) : null;
        return acc;
      }, {});
    } catch (error) {
      console.error('Error in batch get:', error);
      throw error;
    }
  }
}

// Offline data manager
export class OfflineManager {
  private static readonly SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes

  static async shouldSync(): Promise<boolean> {
    const lastSync = await StorageManager.get(STORAGE_KEYS.LAST_SYNC);
    return !lastSync || Date.now() - lastSync > this.SYNC_INTERVAL;
  }

  static async markSynced(): Promise<void> {
    await StorageManager.save(STORAGE_KEYS.LAST_SYNC, Date.now());
  }

  static async isOnline(): Promise<boolean> {
    const netInfo = await NetInfo.fetch();
    return netInfo.isConnected === true;
  }

  static async syncData(): Promise<void> {
    if (!(await this.isOnline())) {
      throw new Error('No internet connection');
    }

    if (await this.shouldSync()) {
      // Implement your sync logic here
      await this.markSynced();
    }
  }
}

// Image cache manager
export class ImageCacheManager {
  private static readonly CACHE_FOLDER = `${FileSystem.cacheDirectory}images/`;
  private static readonly MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB
  private static readonly MAX_CACHE_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

  static async initialize(): Promise<void> {
    try {
      const cacheFolder = await FileSystem.getInfoAsync(this.CACHE_FOLDER);
      if (!cacheFolder.exists) {
        await FileSystem.makeDirectoryAsync(this.CACHE_FOLDER);
      }
    } catch (error) {
      console.error('Error initializing image cache:', error);
    }
  }

  static async cacheImage(url: string): Promise<string> {
    try {
      const filename = this.getCacheFileName(url);
      const filePath = this.CACHE_FOLDER + filename;

      const fileInfo = await FileSystem.getInfoAsync(filePath);
      if (!fileInfo.exists) {
        await FileSystem.downloadAsync(url, filePath);
      }

      return filePath;
    } catch (error) {
      console.error('Error caching image:', error);
      return url;
    }
  }

  static async clearOldCache(): Promise<void> {
    try {
      const now = Date.now();
      const cacheContents = await FileSystem.readDirectoryAsync(this.CACHE_FOLDER);

      for (const filename of cacheContents) {
        const filePath = this.CACHE_FOLDER + filename;
        const fileInfo = await FileSystem.getInfoAsync(filePath);

        if (fileInfo.exists && now - fileInfo.modificationTime > this.MAX_CACHE_AGE) {
          await FileSystem.deleteAsync(filePath);
        }
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  private static getCacheFileName(url: string): string {
    return url.replace(/[^a-zA-Z0-9]/g, '') + '.jpg';
  }
}

// Data versioning
export class DataVersioning {
  private static readonly VERSION_KEY = 'data_version';
  private static readonly CURRENT_VERSION = 1;

  static async checkVersion(): Promise<boolean> {
    const storedVersion = await StorageManager.get(this.VERSION_KEY) || 0;
    return storedVersion === this.CURRENT_VERSION;
  }

  static async updateVersion(): Promise<void> {
    await StorageManager.save(this.VERSION_KEY, this.CURRENT_VERSION);
  }

  static async migrateIfNeeded(): Promise<void> {
    if (!(await this.checkVersion())) {
      // Implement your migration logic here
      await this.updateVersion();
    }
  }
}

// Initialize storage
export async function initializeStorage(): Promise<void> {
  await ImageCacheManager.initialize();
  await DataVersioning.migrateIfNeeded();
  await OfflineManager.syncData().catch(console.error);
} 