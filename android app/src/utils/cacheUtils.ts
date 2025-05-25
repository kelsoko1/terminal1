import AsyncStorage from '@react-native-async-storage/async-storage';

// Cache expiration times in milliseconds
const CACHE_EXPIRATION = {
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 30 * 60 * 1000, // 30 minutes
  LONG: 24 * 60 * 60 * 1000, // 1 day
  VERY_LONG: 7 * 24 * 60 * 60 * 1000, // 1 week
};

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiration: number;
}

/**
 * Save data to cache with expiration
 * @param key - Cache key
 * @param data - Data to cache
 * @param expiration - Cache expiration time in milliseconds
 */
export async function saveToCache<T>(
  key: string,
  data: T,
  expiration: number = CACHE_EXPIRATION.MEDIUM
): Promise<void> {
  try {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiration,
    };
    
    await AsyncStorage.setItem(`cache_${key}`, JSON.stringify(item));
  } catch (error) {
    console.error('Error saving to cache:', error);
  }
}

/**
 * Get data from cache if not expired
 * @param key - Cache key
 * @returns The cached data or null if expired or not found
 */
export async function getFromCache<T>(key: string): Promise<T | null> {
  try {
    const cachedItem = await AsyncStorage.getItem(`cache_${key}`);
    
    if (!cachedItem) {
      return null;
    }
    
    const item: CacheItem<T> = JSON.parse(cachedItem);
    const now = Date.now();
    
    // Check if cache is expired
    if (now - item.timestamp > item.expiration) {
      // Cache expired, remove it
      await AsyncStorage.removeItem(`cache_${key}`);
      return null;
    }
    
    return item.data;
  } catch (error) {
    console.error('Error getting from cache:', error);
    return null;
  }
}

/**
 * Remove item from cache
 * @param key - Cache key
 */
export async function removeFromCache(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(`cache_${key}`);
  } catch (error) {
    console.error('Error removing from cache:', error);
  }
}

/**
 * Clear all cached data
 */
export async function clearCache(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(key => key.startsWith('cache_'));
    
    if (cacheKeys.length > 0) {
      await AsyncStorage.multiRemove(cacheKeys);
    }
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}

/**
 * Get cache statistics
 * @returns Cache statistics including count, size, and expiration info
 */
export async function getCacheStats(): Promise<{
  count: number;
  size: number;
  oldestItem: Date | null;
  newestItem: Date | null;
}> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(key => key.startsWith('cache_'));
    
    if (cacheKeys.length === 0) {
      return {
        count: 0,
        size: 0,
        oldestItem: null,
        newestItem: null,
      };
    }
    
    let totalSize = 0;
    let oldestTimestamp = Date.now();
    let newestTimestamp = 0;
    
    for (const key of cacheKeys) {
      const item = await AsyncStorage.getItem(key);
      
      if (item) {
        totalSize += item.length;
        
        try {
          const parsedItem = JSON.parse(item);
          const timestamp = parsedItem.timestamp || 0;
          
          if (timestamp < oldestTimestamp) {
            oldestTimestamp = timestamp;
          }
          
          if (timestamp > newestTimestamp) {
            newestTimestamp = timestamp;
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }
    }
    
    return {
      count: cacheKeys.length,
      size: totalSize,
      oldestItem: oldestTimestamp !== Date.now() ? new Date(oldestTimestamp) : null,
      newestItem: newestTimestamp !== 0 ? new Date(newestTimestamp) : null,
    };
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return {
      count: 0,
      size: 0,
      oldestItem: null,
      newestItem: null,
    };
  }
}

// Export cache expiration constants
export { CACHE_EXPIRATION };
