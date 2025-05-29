import { NextResponse } from 'next/server';
import { prismaRemote } from '@/lib/database/prismaClients';
import { verifyAuth } from '@/lib/auth/auth-utils';
import { redis, getCache, setCache } from '@/lib/redis';
import { PerformanceMonitor, memoize } from '@/lib/performance';
import { logger } from '@/lib/logger';

// Define interfaces for the dashboard data
interface StockData {
  name: string;
  value: number;
  change: number;
  color: string;
}

interface ClientDistribution {
  name: string;
  value: number;
  color: string;
}

interface PerformanceData {
  month: string;
  clients: number;
  transactions: number;
  revenue: number;
}

interface BrokerDashboardData {
  stats: {
    totalClients: number;
    clientsGrowth: number;
    monthlyTransactions: number;
    transactionsGrowth: number;
    commissionRevenue: number;
    revenueGrowth: number;
    marketIndex: number;
    marketIndexChange: number;
  };
  marketOverview: {
    status: 'OPEN' | 'CLOSED';
    hours: string;
    ordersToday: number;
    ordersDiff: number;
    pendingSettlements: number;
    settlementsDiff: number;
    tradeVolume: number;
    tradeVolumeChange: number;
    marketCap: number;
    marketCapChange: number;
  };
  performanceData: PerformanceData[];
  stocksData: StockData[];
  systemAlerts: {
    title: string;
    message: string;
    type: string;
    timestamp: Date;
  }[];
  clientDistribution: ClientDistribution[];
}

export async function GET(request: Request) {
  // Create a performance monitor for this request
  const perfMonitor = new PerformanceMonitor('broker-dashboard-api');
  const requestId = Math.random().toString(36).substring(2, 15);
  
  // Create a request-specific logger
  const requestLogger = logger.child({ requestId, endpoint: '/api/broker/dashboard' });
  requestLogger.info('Processing broker dashboard request');
  
  try {
    // Verify authentication and authorization
    perfMonitor.mark('auth-start');
    const authResult = await verifyAuth(request);
    perfMonitor.mark('auth-end');
    
    if (!authResult.success || !authResult.user) {
      requestLogger.warn('Authentication failed');
      return NextResponse.json({ error: 'Authentication required', requestId }, { status: 401 });
    }
    
    const { user } = authResult;
    requestLogger.setContext({ userId: user.id, userRole: user.role });
    
    // Check if user has broker permissions
    const allowedRoles = ['admin', 'broker', 'kelsoko_admin'];
    if (!allowedRoles.includes(user.role)) {
      requestLogger.warn('Unauthorized access attempt', { userId: user.id, role: user.role });
      return NextResponse.json({ error: 'Insufficient permissions', requestId }, { status: 403 });
    }
    
    // Get time range filter from query params
    const url = new URL(request.url);
    const timeRange = url.searchParams.get('timeRange') || 'month';
    requestLogger.debug('Using time range', { timeRange });
    
    // Check if we should bypass cache
    const noCache = request.headers.get('cache-control') === 'no-cache';
    
    // Generate cache key based on broker ID and time range
    const cacheKey = `broker:dashboard:${user.id}:${timeRange}`;
    
    // Try to get data from cache first (if not bypassing cache)
    perfMonitor.mark('cache-check-start');
    if (!noCache) {
      const cachedData = await getCache<BrokerDashboardData>(cacheKey);
      if (cachedData) {
        perfMonitor.mark('cache-hit');
        requestLogger.info('Serving from cache', { userId: user.id, timeRange });
        
        // Log performance metrics before returning
        const cacheDuration = perfMonitor.getDuration('cache-check-start', 'cache-hit');
        const totalDuration = perfMonitor.getDuration();
        requestLogger.info('Request completed from cache', { 
          cacheDuration: `${cacheDuration.toFixed(2)}ms`,
          totalDuration: `${totalDuration.toFixed(2)}ms`
        });
        
        return NextResponse.json({
          ...cachedData,
          _meta: {
            cached: true,
            requestId
          }
        }, { status: 200 });
      }
    }
    perfMonitor.mark('cache-check-end');
    
    // Cache miss - need to fetch data
    requestLogger.debug('Cache miss, fetching fresh data');
    
    const timeFilter = getTimeFilter(timeRange);
    
    // Get broker organization ID (if applicable)
    const organizationId = user.organizationId || null;
    
    // Fetch data from database
    perfMonitor.mark('data-fetch-start');
    const dashboardData = await fetchDashboardData(timeFilter, organizationId);
    perfMonitor.mark('data-fetch-end');
    
    // Store in cache with 5-minute expiration
    await setCache(cacheKey, dashboardData, 300);
    
    // Log performance metrics
    const fetchDuration = perfMonitor.getDuration('data-fetch-start', 'data-fetch-end');
    const totalDuration = perfMonitor.getDuration();
    requestLogger.info('Request completed with fresh data', { 
      fetchDuration: `${fetchDuration.toFixed(2)}ms`,
      totalDuration: `${totalDuration.toFixed(2)}ms`,
      dataPoints: Object.keys(dashboardData).length
    });
    
    return NextResponse.json({
      ...dashboardData,
      _meta: {
        cached: false,
        requestId
      }
    }, { status: 200 });
  } catch (error) {
    // Log the error
    const errorMessage = error instanceof Error ? error.message : String(error);
    requestLogger.error('Error processing broker dashboard request', error instanceof Error ? error : new Error(errorMessage));
    
    // Return appropriate error response
    return NextResponse.json({ 
      error: 'Failed to fetch broker dashboard data',
      message: errorMessage,
      requestId
    }, { status: 500 });
  }
}

// Helper function to get time filter based on timeRange
function getTimeFilter(timeRange: string): string {
  switch (timeRange) {
    case 'week':
      return `WHERE "createdAt" > NOW() - INTERVAL '7 days'`;
    case 'month':
      return `WHERE "createdAt" > NOW() - INTERVAL '30 days'`;
    case 'quarter':
      return `WHERE "createdAt" > NOW() - INTERVAL '90 days'`;
    case 'year':
      return `WHERE "createdAt" > NOW() - INTERVAL '365 days'`;
    case 'all':
    default:
      return '';
  }
}

// Function to fetch all dashboard data
async function _fetchDashboardData(timeFilter: string, organizationId: string | null): Promise<BrokerDashboardData> {
  // Create a performance monitor for data fetching
  const perfMonitor = new PerformanceMonitor('dashboard-data-fetch');
  
  // Start tracking overall fetch time
  perfMonitor.mark('fetch-start');
  
  // Fetch clients count and growth
  perfMonitor.mark('clients-start');
  const clientsQuery = `
    SELECT COUNT(*) as total
    FROM "User"
    WHERE role = 'client'
    ${organizationId ? `AND "organizationId" = '${organizationId}'` : ''}
    ${timeFilter ? timeFilter : ''}
  `;
  
  const previousClientsQuery = `
    SELECT COUNT(*) as total
    FROM "User"
    WHERE role = 'client'
    ${organizationId ? `AND "organizationId" = '${organizationId}'` : ''}
    AND "createdAt" < (NOW() - INTERVAL '30 days')
  `;
  
  // Fetch transactions count and growth
  const transactionsQuery = `
    SELECT COUNT(*) as total
    FROM "Trade"
    ${organizationId ? `WHERE "organizationId" = '${organizationId}'` : ''}
    ${timeFilter ? timeFilter.replace('WHERE', organizationId ? 'AND' : 'WHERE') : ''}
  `;
  
  const previousTransactionsQuery = `
    SELECT COUNT(*) as total
    FROM "Trade"
    ${organizationId ? `WHERE "organizationId" = '${organizationId}'` : ''}
    AND "createdAt" < (NOW() - INTERVAL '30 days')
  `;
  
  // Fetch revenue and growth
  const revenueQuery = `
    SELECT SUM(fee) as total
    FROM "Trade"
    ${organizationId ? `WHERE "organizationId" = '${organizationId}'` : ''}
    ${timeFilter ? timeFilter.replace('WHERE', organizationId ? 'AND' : 'WHERE') : ''}
  `;
  
  const previousRevenueQuery = `
    SELECT SUM(fee) as total
    FROM "Trade"
    ${organizationId ? `WHERE "organizationId" = '${organizationId}'` : ''}
    AND "createdAt" < (NOW() - INTERVAL '30 days')
  `;
  
  // Execute all queries in parallel for better performance
  const [
    clientsResult,
    previousClientsResult,
    transactionsResult,
    previousTransactionsResult,
    revenueResult,
    previousRevenueResult
  ] = await Promise.all([
    prismaRemote.$queryRaw`${clientsQuery}`,
    prismaRemote.$queryRaw`${previousClientsQuery}`,
    prismaRemote.$queryRaw`${transactionsQuery}`,
    prismaRemote.$queryRaw`${previousTransactionsQuery}`,
    prismaRemote.$queryRaw`${revenueQuery}`,
    prismaRemote.$queryRaw`${previousRevenueQuery}`
  ]);
  perfMonitor.mark('clients-end');
  
  // Extract values from results
  const totalClients = Number(clientsResult[0]?.total || 0);
  const previousClients = Number(previousClientsResult[0]?.total || 0);
  const clientsGrowth = calculateGrowthPercentage(totalClients, previousClients);
  
  const monthlyTransactions = Number(transactionsResult[0]?.total || 0);
  const previousTransactions = Number(previousTransactionsResult[0]?.total || 0);
  const transactionsGrowth = calculateGrowthPercentage(monthlyTransactions, previousTransactions);
  
  const commissionRevenue = Number(revenueResult[0]?.total || 0);
  const previousRevenue = Number(previousRevenueResult[0]?.total || 0);
  const revenueGrowth = calculateGrowthPercentage(commissionRevenue, previousRevenue);
  
  // Get market index and change (simulated for demo)
  const marketIndex = 12834.56;
  const marketIndexChange = 2.35;
  
  // Get market overview data
  perfMonitor.mark('market-start');
  const marketOpen = isMarketOpen();
  const marketHours = marketOpen ? 'Open until 4:00 PM EST' : 'Opens at 9:30 AM EST';
  
  // Simulated market data (would be fetched from a real API in production)
  const ordersToday = 1245;
  const ordersDiff = 5.2;
  const pendingSettlements = 87;
  const settlementsDiff = -2.1;
  const tradeVolume = 3245678.90;
  const tradeVolumeChange = 7.8;
  const marketCap = 28456789012.34;
  const marketCapChange = 1.2;
  perfMonitor.mark('market-end');
  
  // Get performance data
  perfMonitor.mark('performance-start');
  const performanceData = generatePerformanceData();
  perfMonitor.mark('performance-end');
  
  // Get stocks data
  perfMonitor.mark('stocks-start');
  const stocksData = getStockData();
  perfMonitor.mark('stocks-end');
  
  // Get client distribution
  perfMonitor.mark('distribution-start');
  const clientDistribution = getClientDistribution(organizationId || 'default');
  perfMonitor.mark('distribution-end');
  
  // Get system alerts
  perfMonitor.mark('alerts-start');
  const systemAlerts = getSystemAlerts(organizationId || 'default');
  perfMonitor.mark('alerts-end');
  
  // Complete the performance tracking
  perfMonitor.mark('fetch-end');
  
  // Log performance metrics for data fetching
  const fetchDuration = perfMonitor.getDuration('fetch-start', 'fetch-end');
  logger.debug('Dashboard data fetch completed', { 
    duration: `${fetchDuration.toFixed(2)}ms`,
    clientsTime: perfMonitor.getDuration('clients-start', 'clients-end'),
    marketTime: perfMonitor.getDuration('market-start', 'market-end'),
    performanceTime: perfMonitor.getDuration('performance-start', 'performance-end')
  });
  
  // Return the complete dashboard data
  return {
    stats: {
      totalClients,
      clientsGrowth,
      monthlyTransactions,
      transactionsGrowth,
      commissionRevenue,
      revenueGrowth,
      marketIndex,
      marketIndexChange
    },
    marketOverview: {
      status: marketOpen ? 'OPEN' : 'CLOSED',
      hours: marketHours,
      ordersToday,
      ordersDiff,
      pendingSettlements,
      settlementsDiff,
      tradeVolume,
      tradeVolumeChange,
      marketCap,
      marketCapChange
    },
    performanceData,
    stocksData,
    systemAlerts,
    clientDistribution
  };
}

// Apply memoization to the dashboard data fetching function
// This will cache results for 5 minutes (300000 ms) to improve performance
const fetchDashboardData = memoize(
  _fetchDashboardData,
  (timeFilter, organizationId) => `${timeFilter}:${organizationId}`,
  300000
);

// Helper function to generate performance data
function generatePerformanceData(): PerformanceData[] {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months.map(month => ({
    month,
    clients: Math.floor(Math.random() * 100) + 50,
    transactions: Math.floor(Math.random() * 500) + 200,
    revenue: Math.floor(Math.random() * 10000) + 5000
  }));
}

// Helper function to get stock data
function getStockData(): StockData[] {
  return [
    { name: 'AAPL', value: 178.72, change: 1.45, color: '#4CAF50' },
    { name: 'MSFT', value: 337.50, change: 0.87, color: '#4CAF50' },
    { name: 'GOOGL', value: 131.86, change: -0.23, color: '#F44336' },
    { name: 'AMZN', value: 178.15, change: 1.21, color: '#4CAF50' },
    { name: 'TSLA', value: 237.49, change: -1.54, color: '#F44336' }
  ];
}

// Helper function to get client distribution
function getClientDistribution(brokerId: string): ClientDistribution[] {
  // In a real implementation, this would fetch actual data from the database
  return [
    { name: 'Retail', value: 45, color: '#4CAF50' },
    { name: 'Institutional', value: 30, color: '#2196F3' },
    { name: 'Corporate', value: 15, color: '#FFC107' },
    { name: 'Other', value: 10, color: '#9E9E9E' }
  ];
}

// Helper function to get system alerts
function getSystemAlerts(brokerId: string) {
  // In a real implementation, this would fetch actual alerts from the database
  return [
    {
      title: 'System Maintenance',
      message: 'Scheduled maintenance on Sunday, 2:00 AM EST',
      type: 'info',
      timestamp: new Date()
    },
    {
      title: 'New Regulations',
      message: 'Updated compliance requirements effective next month',
      type: 'warning',
      timestamp: new Date(Date.now() - 86400000) // 1 day ago
    },
    {
      title: 'Market Volatility',
      message: 'Unusual market activity detected in tech sector',
      type: 'alert',
      timestamp: new Date(Date.now() - 172800000) // 2 days ago
    }
  ];
}

// Helper function to calculate growth percentage
function calculateGrowthPercentage(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

// Helper function to check if market is open
function isMarketOpen(): boolean {
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();
  const minute = now.getMinutes();
  
  // Convert to Eastern Time (approximation)
  const estHour = (hour + 21) % 24; // Assuming UTC, adjust for your timezone
  
  // Check if it's a weekday (1-5) and between 9:30 AM and 4:00 PM EST
  return (
    day >= 1 && day <= 5 && // Monday to Friday
    ((estHour === 9 && minute >= 30) || estHour > 9) && // After 9:30 AM
    estHour < 16 // Before 4:00 PM
  );
}
