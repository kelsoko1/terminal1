import { NextResponse } from 'next/server';
import { userService, UserStatus } from '@/lib/firebase/services/userService';
import { organizationService, OrgStatus } from '@/lib/firebase/services/organizationService';
import { tradingService } from '@/lib/firebase/services/tradingService';
import { subscriptionService } from '@/lib/firebase/services/subscriptionService';
import { redis } from '@/lib/redis';
import { logger } from '@/lib/logger';
import { performance } from 'perf_hooks';

export async function GET(request: Request) {
  const startTime = performance.now();
  try {
    // TODO: Add Firebase Auth verification here if needed
    // Example: const user = await verifyFirebaseAuth(request);
    // if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    // TODO: Add role check if needed
    // Example: if (!['admin', 'broker', 'kelsoko_admin'].includes(user.role)) { ... }
    
    // Check cache first
    const cacheKey = `admin:dashboard:firebase`;
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      logger.info(`Serving admin dashboard from cache (Firebase)`);
      return NextResponse.json(typeof cachedData === 'string' ? JSON.parse(cachedData) : cachedData, { status: 200 });
    }
    
    // Get time range filter from query params
    const url = new URL(request.url);
    const timeRange = url.searchParams.get('timeRange') || '30d';
    // TODO: Implement time filtering logic for Firestore queries if needed

    // User statistics
    const users = await userService.list();
    const userStats = {
      total: users.length,
      active: users.filter(u => u.status === UserStatus.ACTIVE).length,
      inactive: users.filter(u => u.status === UserStatus.INACTIVE).length,
    };

    // Organization statistics
    const orgs = await organizationService.list();
    const orgStats = {
      total: orgs.length,
      active: orgs.filter(o => o.status === OrgStatus.ACTIVE).length,
      inactive: orgs.filter(o => o.status === OrgStatus.INACTIVE).length,
      pending: orgs.filter(o => o.status === OrgStatus.PENDING).length,
    };

    // Trade statistics
    const trades = await tradingService.list();
    const tradeStats = {
      total: trades.length,
      buys: trades.filter(t => t.type === 'BUY').length,
      sells: trades.filter(t => t.type === 'SELL').length,
      volume: trades.reduce((sum, t) => sum + (t.price * t.quantity), 0),
    };

    // Subscription statistics
    const subs = await subscriptionService.list();
    const subStats = {
      total: subs.length,
      active: subs.filter(s => String(s.status) === 'ACTIVE').length,
      canceled: subs.filter(s => String(s.status) === 'CANCELED').length,
      expired: subs.filter(s => String(s.status) === 'EXPIRED').length,
    };

    // Pagination for recent users/trades
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '5');
    const offset = (page - 1) * limit;
    const getDate = (val: any) => (val && typeof val.toDate === 'function') ? val.toDate() : new Date(val);
    const recentUsers = users
      .sort((a, b) => getDate(b.createdAt).getTime() - getDate(a.createdAt).getTime())
      .slice(offset, offset + limit);
    const recentTrades = trades
      .sort((a, b) => getDate(b.createdAt).getTime() - getDate(a.createdAt).getTime())
      .slice(offset, offset + limit);

    // Additional metrics (example, adjust as needed)
    const avgTradeValue = trades.length > 0
      ? trades.reduce((sum, t) => sum + (Number(t.price) * Number(t.quantity)), 0) / trades.length
      : 0;
    const activeTraders = new Set(trades.map(t => t.userId)).size;
    const newUsers7d = users.filter(u => {
      const created = getDate(u.createdAt);
      return created > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    }).length;
    // TODO: Implement totalDeposits and totalWithdrawals if you track transactions in Firestore

    const additionalMetrics = {
      avg_trade_value: avgTradeValue,
      active_traders: activeTraders,
      new_users_7d: newUsers7d,
      total_deposits: 0, // TODO
      total_withdrawals: 0, // TODO
    };

    const responseData = {
      statistics: {
        users: userStats,
        organizations: orgStats,
        trades: tradeStats,
        subscriptions: subStats
      },
      recentActivity: {
        users: recentUsers,
        trades: recentTrades
      },
      metrics: additionalMetrics,
      pagination: {
        currentPage: page,
        limit,
        hasMore: recentUsers.length === limit || recentTrades.length === limit
      },
      timeRange
    };
    
    await redis.set(cacheKey, JSON.stringify(responseData), { ex: 300 });
    const endTime = performance.now();
    logger.info(`Admin dashboard API request (Firebase) completed in ${(endTime - startTime).toFixed(2)}ms`);
    return NextResponse.json(responseData, { status: 200 });
  } catch (error: unknown) {
    logger.error('Error fetching admin dashboard data (Firebase):', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: 'Failed to fetch admin dashboard data (Firebase)' }, { status: 500 });
  }
}
