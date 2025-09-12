'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import {
  ArrowUpRight,
  ArrowDownRight,
  Users,
  CreditCard,
  DollarSign,
  Activity,
  BarChart2,
  Clock,
  AlertCircle,
  Calendar,
  RefreshCw,
  Download,
  Info
} from 'lucide-react'
import { useAuth } from '@/lib/auth/auth-context'

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

export default function BrokerDashboard() {
  const { token } = useAuth()
  const [timeRange, setTimeRange] = useState('month')
  const [dashboardData, setDashboardData] = useState<BrokerDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [chartType, setChartType] = useState('line')
  
  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) return
      
      setIsLoading(true)
      setError(null)
      
      try {
        const response = await fetch(`/api/broker/dashboard?timeRange=${timeRange}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Failed to fetch dashboard data')
        }
        
        const data = await response.json()
        setDashboardData(data)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        setError(error instanceof Error ? error.message : 'An unexpected error occurred')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchDashboardData()
  }, [token, timeRange])
  
  // Handle refresh data
  const handleRefreshData = () => {
    setIsLoading(true)
    setError(null)
    
    // Re-fetch data with the current timeRange
    const fetchDashboardData = async () => {
      if (!token) return
      
      try {
        const response = await fetch(`/api/broker/dashboard?timeRange=${timeRange}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Cache-Control': 'no-cache'
          },
          method: 'GET'
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Failed to refresh dashboard data')
        }
        
        const data = await response.json()
        setDashboardData(data)
      } catch (error) {
        console.error('Error refreshing dashboard data:', error)
        setError(error instanceof Error ? error.message : 'An unexpected error occurred while refreshing')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchDashboardData()
  }

  // Show error if there's an error fetching data
  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }
  
  // Show loading skeleton if data is loading
  if (isLoading && !dashboardData) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-[120px]" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[100px] mb-2" />
                <Skeleton className="h-4 w-[150px] mb-2" />
                <Skeleton className="h-2 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="grid gap-4 md:grid-cols-7">
          <Card className="md:col-span-4">
            <CardHeader>
              <Skeleton className="h-6 w-[150px] mb-2" />
              <Skeleton className="h-4 w-[200px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
          
          <Card className="md:col-span-3">
            <CardHeader>
              <Skeleton className="h-6 w-[120px] mb-2" />
              <Skeleton className="h-4 w-[180px]" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3 pb-3 border-b">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <div className="w-full">
                      <Skeleton className="h-4 w-[120px] mb-2" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-[80px] mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Top stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total DSE Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-[100px] mb-2" />
                <Skeleton className="h-4 w-[150px] mb-2" />
                <Skeleton className="h-2 w-full" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">{dashboardData?.stats.totalClients}</div>
                <div className={`flex items-center pt-1 text-xs ${dashboardData?.stats.clientsGrowth && dashboardData.stats.clientsGrowth > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {dashboardData?.stats.clientsGrowth && dashboardData.stats.clientsGrowth > 0 ? (
                    <ArrowUpRight className="mr-1 h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="mr-1 h-3 w-3" />
                  )}
                  <span>{dashboardData?.stats.clientsGrowth && dashboardData.stats.clientsGrowth > 0 ? '+' : ''}{dashboardData?.stats.clientsGrowth}%</span>
                  <span className="text-muted-foreground ml-1">from last month</span>
                </div>
                <Progress className="mt-3" value={75} />
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">DSE Monthly Transactions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-[100px] mb-2" />
                <Skeleton className="h-4 w-[150px] mb-2" />
                <Skeleton className="h-2 w-full" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">{dashboardData?.stats.monthlyTransactions}</div>
                <div className={`flex items-center pt-1 text-xs ${dashboardData?.stats.transactionsGrowth && dashboardData.stats.transactionsGrowth > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {dashboardData?.stats.transactionsGrowth && dashboardData.stats.transactionsGrowth > 0 ? (
                    <ArrowUpRight className="mr-1 h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="mr-1 h-3 w-3" />
                  )}
                  <span>{dashboardData?.stats.transactionsGrowth && dashboardData.stats.transactionsGrowth > 0 ? '+' : ''}{dashboardData?.stats.transactionsGrowth}%</span>
                  <span className="text-muted-foreground ml-1">from last month</span>
                </div>
                <div className="mt-3 text-xs text-muted-foreground">85% execution rate</div>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commission Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-[100px] mb-2" />
                <Skeleton className="h-4 w-[150px] mb-2" />
                <Skeleton className="h-2 w-full" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">TZS {(dashboardData?.stats.commissionRevenue || 0) / 1000000}M</div>
                <div className={`flex items-center pt-1 text-xs ${dashboardData?.stats.revenueGrowth && dashboardData.stats.revenueGrowth > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {dashboardData?.stats.revenueGrowth && dashboardData.stats.revenueGrowth > 0 ? (
                    <ArrowUpRight className="mr-1 h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="mr-1 h-3 w-3" />
                  )}
                  <span>{dashboardData?.stats.revenueGrowth && dashboardData.stats.revenueGrowth > 0 ? '+' : ''}{dashboardData?.stats.revenueGrowth}%</span>
                  <span className="text-muted-foreground ml-1">from last month</span>
                </div>
                <Progress className="mt-3" value={85} />
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Market Index</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-[100px] mb-2" />
                <Skeleton className="h-4 w-[150px] mb-2" />
                <Skeleton className="h-2 w-full" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">{dashboardData?.stats.marketIndex.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div className={`flex items-center pt-1 text-xs ${dashboardData?.stats.marketIndexChange && dashboardData.stats.marketIndexChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {dashboardData?.stats.marketIndexChange && dashboardData.stats.marketIndexChange > 0 ? (
                    <ArrowUpRight className="mr-1 h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="mr-1 h-3 w-3" />
                  )}
                  <span>{dashboardData?.stats.marketIndexChange && dashboardData.stats.marketIndexChange > 0 ? '+' : ''}{dashboardData?.stats.marketIndexChange}%</span>
                  <span className="text-muted-foreground ml-1">today</span>
                </div>
                <div className="mt-3 text-xs text-muted-foreground">DSE All Share Index (DSEI)</div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Market overview and alerts */}
      <div className="grid gap-4 md:grid-cols-7">
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Market Overview</CardTitle>
            <CardDescription>Real-time DSE market activity</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <div className="grid grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-[100px]" />
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-8 w-[80px]" />
                        <Skeleton className="h-5 w-[40px]" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={dashboardData?.marketOverview.status === 'OPEN' ? 
                        "bg-green-50 text-green-700 hover:bg-green-50 border-green-200" : 
                        "bg-red-50 text-red-700 hover:bg-red-50 border-red-200"}
                    >
                      {dashboardData?.marketOverview.status}
                    </Badge>
                    <span className="text-sm font-medium">DSE Market Status</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{dashboardData?.marketOverview.hours}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Orders Today</div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">{dashboardData?.marketOverview.ordersToday}</span>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${dashboardData?.marketOverview.ordersDiff && dashboardData.marketOverview.ordersDiff > 0 ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {dashboardData?.marketOverview.ordersDiff && dashboardData.marketOverview.ordersDiff > 0 ? '+' : ''}
                        {dashboardData?.marketOverview.ordersDiff}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Pending Settlements</div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">{dashboardData?.marketOverview.pendingSettlements}</span>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${dashboardData?.marketOverview.settlementsDiff && dashboardData.marketOverview.settlementsDiff > 0 ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {dashboardData?.marketOverview.settlementsDiff && dashboardData.marketOverview.settlementsDiff > 0 ? '+' : ''}
                        {dashboardData?.marketOverview.settlementsDiff}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Trade Volume</div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">TZS {(dashboardData?.marketOverview.tradeVolume || 0) / 1000000}M</span>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${dashboardData?.marketOverview.tradeVolumeChange && dashboardData.marketOverview.tradeVolumeChange > 0 ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {dashboardData?.marketOverview.tradeVolumeChange && dashboardData.marketOverview.tradeVolumeChange > 0 ? '+' : ''}
                        {dashboardData?.marketOverview.tradeVolumeChange}%
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Market Cap</div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">TZS {(dashboardData?.marketOverview.marketCap || 0) / 1000000000}B</span>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${dashboardData?.marketOverview.marketCapChange && dashboardData.marketOverview.marketCapChange > 0 ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {dashboardData?.marketOverview.marketCapChange && dashboardData.marketOverview.marketCapChange > 0 ? '+' : ''}
                        {dashboardData?.marketOverview.marketCapChange}%
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t pt-4 flex justify-between">
            <Button variant="outline" size="sm" className="gap-1">
              <Calendar className="h-4 w-4" />
              <span>Market Calendar</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1" 
              onClick={handleRefreshData}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Refreshing...' : 'Refresh Data'}</span>
            </Button>
          </CardFooter>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>System Alerts</CardTitle>
            <CardDescription>Recent notifications</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3 pb-3 border-b">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <div className="w-full">
                      <Skeleton className="h-4 w-[120px] mb-2" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-[80px] mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {dashboardData?.alerts.map((alert, index) => {
                  let iconColor = 'text-blue-500';
                  if (alert.type === 'warning') iconColor = 'text-yellow-500';
                  if (alert.type === 'success') iconColor = 'text-green-500';
                  if (alert.type === 'error') iconColor = 'text-red-500';
                  
                  return (
                    <div key={index} className={`flex items-start gap-3 ${index < dashboardData.alerts.length - 1 ? 'pb-3 border-b' : ''}`}>
                      <AlertCircle className={`h-5 w-5 ${iconColor} mt-0.5 flex-shrink-0`} />
                      <div>
                        <p className="text-sm font-medium">{alert.title}</p>
                        <p className="text-xs text-muted-foreground">{alert.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t pt-4">
            <Button variant="outline" size="sm" className="w-full gap-1">
              <span>View All Notifications</span>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Performance charts */}
      <div className="grid gap-4 md:grid-cols-7">
        <Card className="md:col-span-4">
          <CardHeader className="flex flex-row items-center">
            <div className="flex-1">
              <CardTitle>Performance Overview</CardTitle>
              <CardDescription>6-month broker performance metrics</CardDescription>
            </div>
            <Tabs defaultValue="line" className="w-[200px]">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="line">Line</TabsTrigger>
                <TabsTrigger value="bar">Bar</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <Tabs defaultValue="line" className="hidden">
                <TabsContent value="line">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} />
                      <YAxis 
                        yAxisId="metrics"
                        orientation="left"
                        tickFormatter={(value) => value.toString()}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis 
                        yAxisId="revenue"
                        orientation="right"
                        tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'var(--background)',
                          borderColor: 'var(--border)',
                          borderRadius: '6px',
                        }}
                        formatter={(value: number, name: string) => [
                          name === 'revenue' ? `TZS ${(value / 1000000).toFixed(1)}M` : value,
                          name.charAt(0).toUpperCase() + name.slice(1)
                        ]}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="clients" 
                        stroke="#8884d8" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                        yAxisId="metrics"
                        name="DSE Clients"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="transactions" 
                        stroke="#82ca9d" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                        yAxisId="metrics"
                        name="DSE Transactions"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#ffc658" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                        yAxisId="revenue"
                        name="Commission Revenue (TZS)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </TabsContent>
                <TabsContent value="bar">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'var(--background)',
                          borderColor: 'var(--border)',
                          borderRadius: '6px',
                        }}
                      />
                      <Legend />
                      <Bar dataKey="transactions" name="Transactions" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <div className="flex w-full justify-between">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className={timeRange === 'week' ? 'bg-muted' : ''} onClick={() => setTimeRange('week')}>Week</Button>
                <Button variant="outline" size="sm" className={timeRange === 'month' ? 'bg-muted' : ''} onClick={() => setTimeRange('month')}>Month</Button>
                <Button variant="outline" size="sm" className={timeRange === 'year' ? 'bg-muted' : ''} onClick={() => setTimeRange('year')}>Year</Button>
              </div>
              <Button variant="outline" size="sm" className="gap-1">
                <Download className="h-4 w-4" />
                <span>Export</span>
              </Button>
            </div>
          </CardFooter>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Top Traded Stocks</CardTitle>
            <CardDescription>By trading volume (TZS millions)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stocksData.map((stock, index) => (
                <div key={index} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                      <span className="text-xs font-bold">{stock.name.substring(0, 2)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{stock.name}</p>
                      <p className="text-xs text-muted-foreground">DSE Listed</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">TZS {stock.value}M</p>
                    <p className={`text-xs ${stock.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {stock.change > 0 ? '+' : ''}{stock.change}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={clientDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {clientDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--background)',
                      borderColor: 'var(--border)',
                      borderRadius: '6px',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
} 