import { NextApiRequest, NextApiResponse } from 'next';
import { prismaRemote } from '../../../lib/database/prismaClients';
import { verifyAuthToken } from '../../../lib/auth/authUtils';
import { UserRole } from '../../../lib/auth/types';
import { redis } from '../../../lib/redis/redisClient';
import { logger } from '../../../lib/logger';
import { performance } from 'perf_hooks';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const startTime = performance.now();
  
  // Set appropriate CORS headers for production
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify authentication and authorization
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const token = authHeader.split(' ')[1];
    const user = await verifyAuthToken(token);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid authentication token' });
    }
    
    // Check if user has admin permissions
    const allowedRoles: UserRole[] = ['admin', 'broker', 'kelsoko_admin'];
    if (!allowedRoles.includes(user.role as UserRole)) {
      logger.warn(`Unauthorized access attempt to admin dashboard by user ${user.id}`);
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    // Check cache first
    const cacheKey = `admin:dashboard:${user.id}`;
    const cachedData = await redis.get(cacheKey);
    
    if (cachedData) {
      logger.info(`Serving admin dashboard from cache for user ${user.id}`);
      return res.status(200).json(JSON.parse(cachedData));
    }
    
    // Get time range filter from query params
    const timeRange = req.query.timeRange as string || '30d';
    let timeFilter = '';
    
    switch (timeRange) {
      case '7d':
        timeFilter = `WHERE "createdAt" > NOW() - INTERVAL '7 days'`;
        break;
      case '30d':
        timeFilter = `WHERE "createdAt" > NOW() - INTERVAL '30 days'`;
        break;
      case '90d':
        timeFilter = `WHERE "createdAt" > NOW() - INTERVAL '90 days'`;
        break;
      case 'all':
      default:
        timeFilter = '';
        break;
    }
    
    // Get user statistics with time filter
    const userStatsQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN "status" = 'ACTIVE' THEN 1 END) as active,
        COUNT(CASE WHEN "status" = 'INACTIVE' THEN 1 END) as inactive,
        COUNT(CASE WHEN "status" = 'SUSPENDED' THEN 1 END) as suspended
      FROM "User"
      ${timeFilter}
    `;
    
    // Get organization statistics with time filter
    const orgStatsQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN "status" = 'ACTIVE' THEN 1 END) as active,
        COUNT(CASE WHEN "status" = 'INACTIVE' THEN 1 END) as inactive,
        COUNT(CASE WHEN "status" = 'SUSPENDED' THEN 1 END) as suspended
      FROM "Organization"
      ${timeFilter}
    `;
    
    // Get trade statistics with time filter
    const tradeStatsQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN "type" = 'BUY' THEN 1 END) as buys,
        COUNT(CASE WHEN "type" = 'SELL' THEN 1 END) as sells,
        SUM(price * quantity) as volume
      FROM "Trade"
      ${timeFilter}
    `;
    
    // Get subscription statistics with time filter
    const subStatsQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN "status" = 'ACTIVE' THEN 1 END) as active,
        COUNT(CASE WHEN "status" = 'CANCELED' THEN 1 END) as canceled,
        COUNT(CASE WHEN "status" = 'EXPIRED' THEN 1 END) as expired
      FROM "Subscription"
      ${timeFilter}
    `;
    
    // Execute all queries in parallel for better performance
    const [userStats, orgStats, tradeStats, subStats] = await Promise.all([
      prismaRemote.$queryRaw`${userStatsQuery}`,
      prismaRemote.$queryRaw`${orgStatsQuery}`,
      prismaRemote.$queryRaw`${tradeStatsQuery}`,
      prismaRemote.$queryRaw`${subStatsQuery}`
    ]);
    
    // Get recent users with pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;
    const offset = (page - 1) * limit;
    
    const recentUsersQuery = `
      SELECT id, name, email, status, "createdAt", "organizationId"
      FROM "User"
      ORDER BY "createdAt" DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    
    // Get recent trades with pagination
    const recentTradesQuery = `
      SELECT id, "userId", symbol, type, quantity, price, status, "createdAt"
      FROM "Trade"
      ORDER BY "createdAt" DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    
    // Execute recent activity queries in parallel
    const [recentUsers, recentTrades] = await Promise.all([
      prismaRemote.$queryRaw`${recentUsersQuery}`,
      prismaRemote.$queryRaw`${recentTradesQuery}`
    ]);
    
    // Get additional metrics for a more comprehensive dashboard
    const additionalMetricsQuery = `
      SELECT 
        (SELECT AVG(price * quantity) FROM "Trade" ${timeFilter}) as avg_trade_value,
        (SELECT COUNT(DISTINCT "userId") FROM "Trade" ${timeFilter}) as active_traders,
        (SELECT COUNT(*) FROM "User" WHERE "createdAt" > NOW() - INTERVAL '7 days') as new_users_7d,
        (SELECT SUM(amount) FROM "Transaction" WHERE type = 'DEPOSIT' ${timeFilter}) as total_deposits,
        (SELECT SUM(amount) FROM "Transaction" WHERE type = 'WITHDRAWAL' ${timeFilter}) as total_withdrawals
    `;
    
    const additionalMetrics = await prismaRemote.$queryRaw`${additionalMetricsQuery}`;
    
    // Prepare response data
    const responseData = {
      statistics: {
        users: userStats[0],
        organizations: orgStats[0],
        trades: tradeStats[0],
        subscriptions: subStats[0]
      },
      recentActivity: {
        users: recentUsers,
        trades: recentTrades
      },
      metrics: additionalMetrics[0],
      pagination: {
        currentPage: page,
        limit,
        hasMore: recentUsers.length === limit || recentTrades.length === limit
      },
      timeRange
    };
    
    // Cache the results (expire after 5 minutes)
    await redis.set(cacheKey, JSON.stringify(responseData), 'EX', 300);
    
    // Log performance metrics
    const endTime = performance.now();
    logger.info(`Admin dashboard API request completed in ${(endTime - startTime).toFixed(2)}ms`);
    
    return res.status(200).json(responseData);
  } catch (error: unknown) {
    logger.error('Error fetching admin dashboard data:', error);
    
    // Handle different types of errors appropriately
    if (error instanceof Error) {
      if (error.name === 'PrismaClientKnownRequestError') {
        // Database query error
        // Use a type assertion with unknown as intermediate step
        const prismaError = error as unknown as { code: string };
        return res.status(500).json({ 
          error: 'Database query failed',
          code: prismaError.code,
          message: 'There was an issue with the database query'
        });
      } else if (error.name === 'JsonWebTokenError') {
        // JWT validation error
        return res.status(401).json({ 
          error: 'Authentication failed',
          message: 'Invalid authentication token'
        });
      } else {
        // Known error with a message
        return res.status(500).json({ 
          error: 'Failed to fetch admin dashboard data',
          message: error.message || 'An unexpected error occurred while processing your request'
        });
      }
    } else {
      // Unknown error type
      return res.status(500).json({ 
        error: 'Failed to fetch admin dashboard data',
        message: 'An unexpected error occurred while processing your request'
      });
    }
  }
}
