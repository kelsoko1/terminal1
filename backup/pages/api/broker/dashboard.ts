import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth/auth-utils'
import { redis, getCache, setCache } from '@/lib/redis'
import { withApiMiddleware } from '@/lib/api-middleware'
import { PerformanceMonitor, memoize } from '@/lib/performance'
import { logger } from '@/lib/logger'

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
  alerts: Array<{
    type: 'warning' | 'success' | 'info' | 'error';
    title: string;
    message: string;
    time: string;
  }>;
  performanceData: PerformanceData[];
  stocksData: StockData[];
  clientDistribution: ClientDistribution[];
}

async function dashboardHandler(req: NextApiRequest, res: NextApiResponse) {
  // Create a performance monitor for this request
  const perfMonitor = new PerformanceMonitor('broker-dashboard-api')
  const requestId = Math.random().toString(36).substring(2, 15)
  
  // Create a request-specific logger
  const requestLogger = logger.child({ requestId, endpoint: '/api/broker/dashboard' })
  requestLogger.info('Processing broker dashboard request', { method: req.method, query: req.query })
  
  if (req.method !== 'GET') {
    requestLogger.warn('Method not allowed', { method: req.method })
    return res.status(405).json({ error: 'Method not allowed', requestId })
  }

  // Verify authentication and authorization
  perfMonitor.mark('auth-start')
  const authResult = await verifyAuth(req as any) // Type cast to bypass type checking
  perfMonitor.mark('auth-end')
  
  if (!authResult.success || !authResult.user) {
    requestLogger.warn('Authentication failed')
    return res.status(401).json({ error: 'Authentication required', requestId })
  }
  
  const { user } = authResult
  requestLogger.setContext({ userId: user.id, userRole: user.role })
  
  // Check if user has broker permissions
  const allowedRoles = ['admin', 'broker', 'kelsoko_admin']
  if (!allowedRoles.includes(user.role)) {
    requestLogger.warn('Unauthorized access attempt', { userId: user.id, role: user.role })
    return res.status(403).json({ error: 'Insufficient permissions', requestId })
  }
  
  // Get time range filter from query params
  const timeRange = req.query.timeRange as string || 'month'
  requestLogger.debug('Using time range', { timeRange })
  
  // Check if we should bypass cache
  const noCache = req.headers['cache-control'] === 'no-cache'
  
  // Generate cache key based on broker ID and time range
  const cacheKey = `broker:dashboard:${user.id}:${timeRange}`
  
  // Try to get data from cache first (if not bypassing cache)
  perfMonitor.mark('cache-check-start')
  if (!noCache) {
    const cachedData = await getCache<BrokerDashboardData>(cacheKey)
    if (cachedData) {
      perfMonitor.mark('cache-hit')
      requestLogger.info('Serving from cache', { userId: user.id, timeRange })
      
      // Log performance metrics before returning
      const cacheDuration = perfMonitor.getDuration('cache-check-start', 'cache-hit')
      const totalDuration = perfMonitor.getDuration()
      requestLogger.info('Request completed from cache', { 
        cacheDuration: `${cacheDuration.toFixed(2)}ms`,
        totalDuration: `${totalDuration.toFixed(2)}ms`
      })
      
      return res.status(200).json({
        ...cachedData,
        _meta: {
          cached: true,
          requestId
        }
      })
    }
  }
  perfMonitor.mark('cache-check-end')
  
  // Cache miss - need to fetch data
  requestLogger.debug('Cache miss, fetching fresh data')
  
  const timeFilter = getTimeFilter(timeRange)
  
  // Get broker organization ID (if applicable)
  const organizationId = user.organizationId || null
  
  // Fetch data from database
  perfMonitor.mark('data-fetch-start')
  const dashboardData = await fetchDashboardData(timeFilter, organizationId)
  perfMonitor.mark('data-fetch-end')
  
  // Store in cache with 5-minute expiration
  await setCache(cacheKey, dashboardData, 300)
  
  // Log performance metrics
  const fetchDuration = perfMonitor.getDuration('data-fetch-start', 'data-fetch-end')
  const totalDuration = perfMonitor.getDuration()
  requestLogger.info('Request completed with fresh data', { 
    fetchDuration: `${fetchDuration.toFixed(2)}ms`,
    totalDuration: `${totalDuration.toFixed(2)}ms`,
    dataPoints: Object.keys(dashboardData).length
  })
  
  return res.status(200).json({
    ...dashboardData,
    _meta: {
      cached: false,
      generated: new Date().toISOString(),
      requestId
    }
  })
}

// Apply middleware to the handler
export default withApiMiddleware(dashboardHandler)

// Helper function to get time filter based on timeRange
function getTimeFilter(timeRange: string): string {
  switch (timeRange) {
    case 'week':
      return `AND "createdAt" > NOW() - INTERVAL '7 days'`
    case 'month':
      return `AND "createdAt" > NOW() - INTERVAL '30 days'`
    case 'year':
      return `AND "createdAt" > NOW() - INTERVAL '365 days'`
    default:
      return `AND "createdAt" > NOW() - INTERVAL '30 days'`
  }
}

// Function to fetch all dashboard data
async function _fetchDashboardData(timeFilter: string, organizationId: string | null): Promise<BrokerDashboardData> {
  try {
    logger.debug('Fetching dashboard data', { timeFilter, organizationId })
    const perfMonitor = new PerformanceMonitor('fetch-dashboard-data')
    
    // In a production environment, we would fetch this data from the database
    // For now, we'll return realistic mock data that matches the component
    
    // Generate performance data based on the current month
    perfMonitor.mark('performance-data-start')
    const performanceData = generatePerformanceData()
    perfMonitor.mark('performance-data-end')
    
    // Calculate stats based on performance data
    perfMonitor.mark('stats-calculation-start')
    const currentMonth = performanceData[performanceData.length - 1]
    const previousMonth = performanceData[performanceData.length - 2]
    
    const clientsGrowth = calculateGrowthPercentage(currentMonth.clients, previousMonth.clients)
    const transactionsGrowth = calculateGrowthPercentage(currentMonth.transactions, previousMonth.transactions)
    const revenueGrowth = calculateGrowthPercentage(currentMonth.revenue, previousMonth.revenue)
    perfMonitor.mark('stats-calculation-end')
    
    // Get market status
    perfMonitor.mark('market-data-start')
    const marketStatus = isMarketOpen() ? 'OPEN' : 'CLOSED'
    
    // Get stock data
    const stocksData = [
      { name: 'CRDB', value: 385, change: 2.1, color: '#10b981' },
      { name: 'TBL', value: 1240, change: -0.8, color: '#ef4444' },
      { name: 'TCC', value: 2200, change: 1.5, color: '#10b981' },
      { name: 'TPCC', value: 4100, change: 3.2, color: '#10b981' },
      { name: 'NMB', value: 3750, change: -1.2, color: '#ef4444' },
    ]
    perfMonitor.mark('market-data-end')
    
    // Get client distribution
    perfMonitor.mark('client-distribution-start')
    const clientDistribution = [
      { name: 'Retail', value: 65, color: '#3b82f6' },
      { name: 'Institutional', value: 25, color: '#10b981' },
      { name: 'Foreign', value: 10, color: '#f59e0b' },
    ]
    perfMonitor.mark('client-distribution-end')
    
    // Get system alerts
    perfMonitor.mark('alerts-start')
    const alerts: Array<{
      type: 'warning' | 'success' | 'info' | 'error';
      title: string;
      message: string;
      time: string;
    }> = [
      {
        type: 'warning',
        title: 'Settlement Reminder',
        message: '18 trades pending settlement for T+3 cycle',
        time: '10:15 AM'
      },
      {
        type: 'success',
        title: 'System Update Complete',
        message: 'Trading platform updated to version 2.4.1',
        time: '09:30 AM'
      },
      {
        type: 'info',
        title: 'New Regulatory Notice',
        message: 'CMSA published new guidelines for broker reporting',
        time: 'Yesterday'
      }
    ]
    perfMonitor.mark('alerts-end')
    
    // Assemble the final dashboard data
    perfMonitor.mark('assembly-start')
    const result: BrokerDashboardData = {
      stats: {
        totalClients: currentMonth.clients,
        clientsGrowth,
        monthlyTransactions: currentMonth.transactions,
        transactionsGrowth,
        commissionRevenue: currentMonth.revenue,
        revenueGrowth,
        marketIndex: 2145.67,
        marketIndexChange: -0.8
      },
      marketOverview: {
        status: marketStatus,
        hours: '10:00 - 15:30 EAT',
        ordersToday: 125,
        ordersDiff: 12,
        pendingSettlements: 18,
        settlementsDiff: -3,
        tradeVolume: 325000000, // 325M
        tradeVolumeChange: 5.2,
        marketCap: 15200000000, // 15.2B
        marketCapChange: -0.3
      },
      alerts,
      performanceData,
      stocksData,
      clientDistribution
    }
    perfMonitor.mark('assembly-end')
    
    // Log performance metrics
    perfMonitor.logMetrics(true)
    
    return result
  } catch (error) {
    logger.error('Error generating dashboard data', error as Error, { timeFilter, organizationId })
    throw error
  }
}

// Apply memoization to the dashboard data fetching function
// This will cache results for 5 minutes (300000 ms) to improve performance
const fetchDashboardData = memoize(
  _fetchDashboardData,
  (timeFilter, organizationId) => `dashboard:${timeFilter}:${organizationId || 'null'}`,
  300000 // 5 minute cache
)

async function getPerformanceData(brokerId: string, timeRange: string) {
  try {
    // In a production environment, this would aggregate data from the database
    // For now, return realistic mock data
    return [
      { month: 'Jan', clients: 120, transactions: 450, revenue: 15000000 },
      { month: 'Feb', clients: 135, transactions: 520, revenue: 18200000 },
      { month: 'Mar', clients: 142, transactions: 610, revenue: 22400000 },
      { month: 'Apr', clients: 156, transactions: 580, revenue: 21100000 },
      { month: 'May', clients: 168, transactions: 650, revenue: 24200000 },
      { month: 'Jun', clients: 175, transactions: 720, revenue: 27500000 },
    ]
  } catch (error) {
    console.error('Error getting performance data:', error)
    return []
  }
}

async function getStockData() {
  try {
    // In a production environment, this would fetch from market data API
    // For now, return realistic mock data
    return [
      { name: 'CRDB', value: 385, change: 2.1, color: '#10b981' },
      { name: 'TBL', value: 1240, change: -0.8, color: '#ef4444' },
      { name: 'TCC', value: 2200, change: 1.5, color: '#10b981' },
      { name: 'TPCC', value: 4100, change: 3.2, color: '#10b981' },
      { name: 'NMB', value: 3750, change: -1.2, color: '#ef4444' },
    ]
  } catch (error) {
    console.error('Error getting stock data:', error)
    return []
  }
}

async function getClientDistribution(brokerId: string) {
  try {
    // In a production environment, this would aggregate from the database
    // For now, return realistic mock data
    return [
      { name: 'Retail', value: 65, color: '#3b82f6' },
      { name: 'Institutional', value: 25, color: '#10b981' },
      { name: 'Foreign', value: 10, color: '#f59e0b' },
    ]
  } catch (error) {
    console.error('Error getting client distribution:', error)
    return []
  }
}

async function getSystemAlerts(brokerId: string) {
  try {
    // In a production environment, this would fetch from notifications system
    // For now, return realistic mock data
    return [
      {
        type: 'warning',
        title: 'Settlement Reminder',
        message: '18 trades pending settlement for T+3 cycle',
        time: '10:15 AM'
      },
      {
        type: 'success',
        title: 'System Update Complete',
        message: 'Trading platform updated to version 2.4.1',
        time: '09:30 AM'
      },
      {
        type: 'info',
        title: 'New Regulatory Notice',
        message: 'CMSA published new guidelines for broker reporting',
        time: 'Yesterday'
      }
    ]
  } catch (error) {
    console.error('Error getting system alerts:', error)
    return []
  }
}

// Helper function to calculate growth percentage
function calculateGrowthPercentage(current: number, previous: number): number {
  if (previous === 0) return 0
  return parseFloat(((current - previous) / previous * 100).toFixed(1))
}

// Helper function to check if market is open
function isMarketOpen(): boolean {
  const now = new Date()
  const hours = now.getHours()
  const minutes = now.getMinutes()
  const day = now.getDay()
  
  // Market is closed on weekends (Saturday and Sunday)
  if (day === 0 || day === 6) {
    return false
  }
  
  // Market hours: 10:00 AM - 3:30 PM EAT
  const openTime = 10 * 60 // 10:00 AM in minutes
  const closeTime = 15 * 60 + 30 // 3:30 PM in minutes
  const currentTime = hours * 60 + minutes
  
  return currentTime >= openTime && currentTime <= closeTime
}

// Helper function to generate performance data
function generatePerformanceData(): PerformanceData[] {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  
  return [
    { month: 'Jan', clients: 120, transactions: 450, revenue: 15000000 },
    { month: 'Feb', clients: 135, transactions: 520, revenue: 18200000 },
    { month: 'Mar', clients: 142, transactions: 610, revenue: 22400000 },
    { month: 'Apr', clients: 156, transactions: 580, revenue: 21100000 },
    { month: 'May', clients: 168, transactions: 650, revenue: 24200000 },
    { month: 'Jun', clients: 175, transactions: 720, revenue: 27500000 }
  ]
}
