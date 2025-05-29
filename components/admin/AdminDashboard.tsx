'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { 
  BarChart, 
  Calendar, 
  DollarSign, 
  Download, 
  RefreshCcw, 
  Users, 
  Building, 
  TrendingUp, 
  CreditCard
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

// Types for dashboard data
interface DashboardData {
  statistics: {
    users: {
      total: number;
      active: number;
      inactive: number;
      suspended: number;
    };
    organizations: {
      total: number;
      active: number;
      inactive: number;
      suspended: number;
    };
    trades: {
      total: number;
      buys: number;
      sells: number;
      volume: number;
    };
    subscriptions: {
      total: number;
      active: number;
      canceled: number;
      expired: number;
    };
  };
  recentActivity: {
    users: any[];
    trades: any[];
  };
  metrics: {
    avg_trade_value: number;
    active_traders: number;
    new_users_7d: number;
    total_deposits: number;
    total_withdrawals: number;
  };
  pagination: {
    currentPage: number;
    limit: number;
    hasMore: boolean;
  };
  timeRange: string;
}

export function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState('30d')

  const fetchDashboardData = async (range = timeRange) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/admin/dashboard?timeRange=${range}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error(`Error fetching dashboard data: ${response.status}`)
      }

      const data = await response.json()
      setDashboardData(data)
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err)
      setError('Failed to load dashboard data. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [timeRange])

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value)
  }

  const handleRefresh = () => {
    fetchDashboardData()
  }

  if (loading && !dashboardData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  // If we have no data but we're not loading, show empty state
  if (!dashboardData) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <h3 className="text-xl font-semibold mb-2">No dashboard data available</h3>
        <p className="text-muted-foreground mb-6">
          This could be due to no data in the database or an issue with the connection.
        </p>
        <Button onClick={handleRefresh}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Refresh Dashboard
        </Button>
      </div>
    )
  }

  const { statistics, recentActivity, metrics, pagination } = dashboardData

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Dashboard Overview</h2>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleRefresh} variant="outline" size="icon">
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.users.total}</div>
            <p className="text-xs text-muted-foreground">
              {statistics.users.active} active users
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Organizations</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.organizations.total}</div>
            <p className="text-xs text-muted-foreground">
              {statistics.organizations.active} active organizations
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.trades.total}</div>
            <p className="text-xs text-muted-foreground">
              {statistics.trades.buys} buys, {statistics.trades.sells} sells
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Subscriptions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.subscriptions.total}</div>
            <p className="text-xs text-muted-foreground">
              {statistics.subscriptions.active} active subscriptions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Trade Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${metrics.avg_trade_value ? metrics.avg_trade_value.toFixed(2) : '0.00'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Traders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.active_traders || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">New Users (7d)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.new_users_7d || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Tabs */}
      <Tabs defaultValue="users" className="w-full">
        <TabsList>
          <TabsTrigger value="users">Recent Users</TabsTrigger>
          <TabsTrigger value="trades">Recent Trades</TabsTrigger>
        </TabsList>
        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Users</CardTitle>
              <CardDescription>
                Recently registered users in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivity.users && recentActivity.users.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentActivity.users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.status === 'ACTIVE' ? 'default' : 'secondary'}>
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No recent users found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="trades" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Trades</CardTitle>
              <CardDescription>
                Recently executed trades in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivity.trades && recentActivity.trades.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentActivity.trades.map((trade) => (
                      <TableRow key={trade.id}>
                        <TableCell>{trade.symbol}</TableCell>
                        <TableCell>
                          <Badge variant={trade.type === 'BUY' ? 'default' : 'destructive'}>
                            {trade.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{trade.quantity}</TableCell>
                        <TableCell>${parseFloat(trade.price).toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={trade.status === 'COMPLETED' ? 'default' : 'secondary'}>
                            {trade.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {formatDistanceToNow(new Date(trade.createdAt), { addSuffix: true })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No recent trades found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
