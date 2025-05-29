import { NextResponse } from 'next/server';
import { prismaRemote } from '@/lib/database/prismaClients';
import { verifyAuth } from '@/lib/auth/auth-utils';
import { UserRole } from '@/lib/auth/types';
import { redis } from '@/lib/redis';
import { logger } from '@/lib/logger';
import { performance } from 'perf_hooks';

export async function GET(request: Request) {
  const startTime = performance.now();
  
  try {
    // Verify authentication and authorization
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const { user } = authResult;
    
    // Check if user has admin permissions
    const allowedRoles: UserRole[] = ['admin', 'broker', 'kelsoko_admin'];
    if (!allowedRoles.includes(user.role as UserRole)) {
      logger.warn(`Unauthorized access attempt to admin dashboard by user ${user.id}`);
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }
    
    // Check cache first
    const cacheKey = `admin:dashboard:${user.id}`;
    const cachedData = await redis.get(cacheKey);
    
    if (cachedData) {
      logger.info(`Serving admin dashboard from cache for user ${user.id}`);
      return NextResponse.json(typeof cachedData === 'string' ? JSON.parse(cachedData) : cachedData, { status: 200 });
    }
    
    // Get time range filter from query params
    const url = new URL(request.url);
    const timeRange = url.searchParams.get('timeRange') || '30d';
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
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '5');
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
    await redis.set(cacheKey, JSON.stringify(responseData), { ex: 300 });
    
    // Log performance metrics
    const endTime = performance.now();
    logger.info(`Admin dashboard API request completed in ${(endTime - startTime).toFixed(2)}ms`);
    
    return NextResponse.json(responseData, { status: 200 });
  } catch (error: unknown) {
    logger.error('Error fetching admin dashboard data:', error instanceof Error ? error : new Error(String(error)));
    
    // Handle different types of errors appropriately
    if (error instanceof Error) {
      if (error.name === 'PrismaClientKnownRequestError') {
        // Database query error
        // Use a type assertion with unknown as intermediate step
        const prismaError = error as unknown as { code: string };
        return NextResponse.json({ 
          error: 'Database query failed',
          code: prismaError.code,
          message: 'There was an issue with the database query'
        }, { status: 500 });
      } else if (error.name === 'JsonWebTokenError') {
        // JWT validation error
        return NextResponse.json({ 
          error: 'Authentication failed',
          message: 'Invalid authentication token'
        }, { status: 401 });
      } else {
        // Known error with a message
        return NextResponse.json({ 
          error: 'Failed to fetch admin dashboard data',
          message: error.message || 'An unexpected error occurred while processing your request'
        }, { status: 500 });
      }
    } else {
      // Unknown error type
      return NextResponse.json({ 
        error: 'Failed to fetch admin dashboard data',
        message: 'An unexpected error occurred while processing your request'
      }, { status: 500 });
    }
  }
}
