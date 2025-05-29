// Simple in-memory cache implementation
class MemoryCache {
  private cache: Map<string, { data: any; expiry: number | null }> = new Map();

  async set(key: string, value: any, options?: { ex?: number }): Promise<'OK'> {
    const expiry = options?.ex ? Date.now() + options.ex * 1000 : null;
    this.cache.set(key, { data: value, expiry });
    return 'OK';
  }

  async get(key: string): Promise<any> {
    const item = this.cache.get(key);
    if (!item) return null;

    // Check if expired
    if (item.expiry && item.expiry < Date.now()) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  async del(...keys: string[]): Promise<number> {
    let count = 0;
    for (const key of keys) {
      if (this.cache.delete(key)) count++;
    }
    return count;
  }

  async keys(pattern: string): Promise<string[]> {
    // Simple pattern matching (only supports * wildcard at the end)
    const prefix = pattern.replace(/\*$/, '');
    return Array.from(this.cache.keys())
      .filter(key => pattern.endsWith('*') ? key.startsWith(prefix) : key === pattern);
  }
}

// Initialize memory cache client
export const redis = new MemoryCache();

// Helper function to set cache with expiration
export async function setCache(key: string, data: any, expirationSeconds = 300): Promise<void> {
  await redis.set(key, JSON.stringify(data), { ex: expirationSeconds });
}

// Helper function to get cache
export async function getCache<T>(key: string): Promise<T | null> {
  const data = await redis.get(key);
  return data ? JSON.parse(data as string) as T : null;
}

// Helper function to invalidate cache
export async function invalidateCache(key: string): Promise<void> {
  await redis.del(key);
}

// Helper function to invalidate cache with pattern
export async function invalidateCachePattern(pattern: string): Promise<void> {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}
