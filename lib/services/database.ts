import { Pool } from 'pg';
import Redis from 'ioredis';
import { SecurityType, OrderType, OrderSide, OrderStatus, TimeInForce } from '../types';

// PostgreSQL connection
const pool = new Pool({
  user: process.env.POSTGRES_USER || 'webtrader',
  password: process.env.POSTGRES_PASSWORD || 'webtrader_secret',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'webtrader',
});

// Redis connection
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
});

export class DatabaseService {
  // Cache keys
  private static readonly MARKET_DATA_KEY = 'market_data';
  private static readonly USER_SESSION_KEY = 'user_session';
  private static readonly WATCHLIST_KEY = 'watchlist';

  // PostgreSQL queries
  async createUser(email: string, passwordHash: string, name: string, phone?: string) {
    const query = `
      INSERT INTO users (email, password_hash, name, phone)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `;
    const result = await pool.query(query, [email, passwordHash, name, phone]);
    return result.rows[0];
  }

  async createPortfolio(userId: string, name: string) {
    const query = `
      INSERT INTO portfolios (user_id, name)
      VALUES ($1, $2)
      RETURNING id
    `;
    const result = await pool.query(query, [userId, name]);
    return result.rows[0];
  }

  async getPortfolio(portfolioId: string) {
    const query = `
      SELECT p.*, json_agg(
        json_build_object(
          'security_id', h.security_id,
          'symbol', s.symbol,
          'quantity', h.quantity,
          'average_price', h.average_price
        )
      ) as holdings
      FROM portfolios p
      LEFT JOIN holdings h ON h.portfolio_id = p.id
      LEFT JOIN securities s ON s.id = h.security_id
      WHERE p.id = $1
      GROUP BY p.id
    `;
    const result = await pool.query(query, [portfolioId]);
    return result.rows[0];
  }

  async createOrder(
    userId: string,
    securityId: string,
    orderType: OrderType,
    side: OrderSide,
    quantity: number,
    price?: number,
    timeInForce: TimeInForce = 'day'
  ) {
    const query = `
      INSERT INTO orders (
        user_id, security_id, order_type, side,
        quantity, price, time_in_force,
        expires_at
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        CASE WHEN $7 = 'day' THEN CURRENT_DATE + INTERVAL '1 day' ELSE NULL END
      )
      RETURNING id
    `;
    const result = await pool.query(query, [
      userId, securityId, orderType, side,
      quantity, price, timeInForce
    ]);
    return result.rows[0];
  }

  // Redis operations
  async cacheMarketData(securityId: string, data: any) {
    const key = `${this.MARKET_DATA_KEY}:${securityId}`;
    await redis.set(key, JSON.stringify(data), 'EX', 60); // Cache for 1 minute
  }

  async getCachedMarketData(securityId: string) {
    const key = `${this.MARKET_DATA_KEY}:${securityId}`;
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  async cacheUserSession(userId: string, sessionData: any) {
    const key = `${this.USER_SESSION_KEY}:${userId}`;
    await redis.set(key, JSON.stringify(sessionData), 'EX', 3600); // Cache for 1 hour
  }

  async getCachedUserSession(userId: string) {
    const key = `${this.USER_SESSION_KEY}:${userId}`;
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  async addToWatchlist(userId: string, securityId: string) {
    const key = `${this.WATCHLIST_KEY}:${userId}`;
    await redis.sadd(key, securityId);
  }

  async removeFromWatchlist(userId: string, securityId: string) {
    const key = `${this.WATCHLIST_KEY}:${userId}`;
    await redis.srem(key, securityId);
  }

  async getWatchlist(userId: string) {
    const key = `${this.WATCHLIST_KEY}:${userId}`;
    return await redis.smembers(key);
  }

  // Market data operations
  async updateMarketData(securityId: string, price: number, volume: number) {
    // Update PostgreSQL
    const query = `
      INSERT INTO market_data (security_id, timestamp, price, volume)
      VALUES ($1, CURRENT_TIMESTAMP, $2, $3)
    `;
    await pool.query(query, [securityId, price, volume]);

    // Update Redis cache
    await this.cacheMarketData(securityId, { price, volume, timestamp: new Date() });
  }

  async getMarketDataHistory(securityId: string, startDate: Date, endDate: Date) {
    const query = `
      SELECT timestamp, price, volume, high, low, open, close
      FROM market_data
      WHERE security_id = $1
        AND timestamp BETWEEN $2 AND $3
      ORDER BY timestamp ASC
    `;
    const result = await pool.query(query, [securityId, startDate, endDate]);
    return result.rows;
  }

  // Portfolio performance
  async getPortfolioPerformance(portfolioId: string) {
    const query = `
      WITH portfolio_holdings AS (
        SELECT 
          h.security_id,
          h.quantity,
          h.average_price,
          s.symbol,
          md.price as current_price
        FROM holdings h
        JOIN securities s ON s.id = h.security_id
        LEFT JOIN (
          SELECT DISTINCT ON (security_id) 
            security_id, price
          FROM market_data
          ORDER BY security_id, timestamp DESC
        ) md ON md.security_id = h.security_id
        WHERE h.portfolio_id = $1
      )
      SELECT
        SUM(quantity * current_price) as total_value,
        SUM(quantity * (current_price - average_price)) as total_gain_loss,
        json_agg(
          json_build_object(
            'symbol', symbol,
            'quantity', quantity,
            'average_price', average_price,
            'current_price', current_price,
            'value', quantity * current_price,
            'gain_loss', quantity * (current_price - average_price)
          )
        ) as holdings
      FROM portfolio_holdings
    `;
    const result = await pool.query(query, [portfolioId]);
    return result.rows[0];
  }

  // Cleanup
  async cleanup() {
    await pool.end();
    await redis.quit();
  }
} 