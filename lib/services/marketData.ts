import Redis from 'ioredis';
import { DatabaseService } from './database';
import { MarketData } from '../types';

export class MarketDataService {
  private publisher: Redis;
  private subscriber: Redis;
  private db: DatabaseService;
  private handlers: Map<string, Set<(data: MarketData) => void>>;

  constructor(databaseService: DatabaseService) {
    this.publisher = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    });

    this.subscriber = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    });

    this.db = databaseService;
    this.handlers = new Map();

    // Set up subscriber
    this.subscriber.on('message', (channel, message) => {
      const data = JSON.parse(message) as MarketData;
      const handlers = this.handlers.get(channel);
      if (handlers) {
        handlers.forEach(handler => handler(data));
      }
    });
  }

  // Subscribe to market data for a security
  async subscribe(securityId: string, handler: (data: MarketData) => void) {
    const channel = `market_data:${securityId}`;
    
    // Add handler
    if (!this.handlers.has(channel)) {
      this.handlers.set(channel, new Set());
      await this.subscriber.subscribe(channel);
    }
    this.handlers.get(channel)!.add(handler);

    // Send initial data from cache
    const cachedData = await this.db.getCachedMarketData(securityId);
    if (cachedData) {
      handler(cachedData);
    }
  }

  // Unsubscribe from market data
  async unsubscribe(securityId: string, handler: (data: MarketData) => void) {
    const channel = `market_data:${securityId}`;
    const handlers = this.handlers.get(channel);
    
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.handlers.delete(channel);
        await this.subscriber.unsubscribe(channel);
      }
    }
  }

  // Publish market data update
  async publishUpdate(data: MarketData) {
    const channel = `market_data:${data.securityId}`;
    
    // Store in PostgreSQL
    await this.db.updateMarketData(
      data.securityId,
      data.price,
      data.volume || 0
    );

    // Publish to Redis
    await this.publisher.publish(channel, JSON.stringify(data));
  }

  // Get historical market data
  async getHistoricalData(
    securityId: string,
    startDate: Date,
    endDate: Date
  ) {
    return await this.db.getMarketDataHistory(securityId, startDate, endDate);
  }

  // Cleanup connections
  async cleanup() {
    await this.publisher.quit();
    await this.subscriber.quit();
  }
} 