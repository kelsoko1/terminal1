'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
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
  Download
} from 'lucide-react'

const performanceData = [
  { month: 'Jan', clients: 120, transactions: 450, revenue: 15000000 },
  { month: 'Feb', clients: 135, transactions: 520, revenue: 18200000 },
  { month: 'Mar', clients: 142, transactions: 610, revenue: 22400000 },
  { month: 'Apr', clients: 156, transactions: 580, revenue: 21100000 },
  { month: 'May', clients: 168, transactions: 650, revenue: 24200000 },
  { month: 'Jun', clients: 175, transactions: 720, revenue: 27500000 },
]

const stocksData = [
  { name: 'CRDB', value: 85.2, change: 2.3, color: '#10b981' },
  { name: 'NMB', value: 62.8, change: 1.5, color: '#10b981' },
  { name: 'TBL', value: 48.5, change: -0.8, color: '#ef4444' },
  { name: 'TPCC', value: 35.3, change: 0.5, color: '#10b981' },
  { name: 'EABL', value: 28.7, change: -1.2, color: '#ef4444' },
]

const clientDistribution = [
  { name: 'Retail', value: 120, color: '#8884d8' },
  { name: 'Institutional', value: 35, color: '#82ca9d' },
  { name: 'Foreign', value: 20, color: '#ffc658' },
]

export default function BrokerDashboard() {
  const [timeRange, setTimeRange] = useState('month')

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
            <div className="text-2xl font-bold">175</div>
            <div className="flex items-center pt-1 text-xs text-green-500">
              <ArrowUpRight className="mr-1 h-3 w-3" />
              <span>+4.1%</span>
              <span className="text-muted-foreground ml-1">from last month</span>
            </div>
            <Progress className="mt-3" value={75} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">DSE Monthly Transactions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">720</div>
            <div className="flex items-center pt-1 text-xs text-green-500">
              <ArrowUpRight className="mr-1 h-3 w-3" />
              <span>+10.8%</span>
              <span className="text-muted-foreground ml-1">from last month</span>
            </div>
            <div className="mt-3 text-xs text-muted-foreground">85% execution rate</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commission Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">TZS 27.5M</div>
            <div className="flex items-center pt-1 text-xs text-green-500">
              <ArrowUpRight className="mr-1 h-3 w-3" />
              <span>+13.6%</span>
              <span className="text-muted-foreground ml-1">from last month</span>
            </div>
            <Progress className="mt-3" value={85} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Market Index</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,842.56</div>
            <div className="flex items-center pt-1 text-xs text-red-500">
              <ArrowDownRight className="mr-1 h-3 w-3" />
              <span>-0.8%</span>
              <span className="text-muted-foreground ml-1">today</span>
            </div>
            <div className="mt-3 text-xs text-muted-foreground">DSE All Share Index (DSEI)</div>
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
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50 border-green-200">
                    OPEN
                  </Badge>
                  <span className="text-sm font-medium">DSE Market Status</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>10:00 - 15:30 EAT</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Orders Today</div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">125</span>
                    <Badge variant="outline" className="text-xs">+12</Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium">Pending Settlements</div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">18</span>
                    <Badge variant="outline" className="text-xs">-3</Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium">Trade Volume</div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">TZS 325M</span>
                    <Badge variant="outline" className="text-green-600 text-xs">+5.2%</Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium">Market Cap</div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">TZS 15.2B</span>
                    <Badge variant="outline" className="text-red-600 text-xs">-0.3%</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4 flex justify-between">
            <Button variant="outline" size="sm" className="gap-1">
              <Calendar className="h-4 w-4" />
              <span>Market Calendar</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-1">
              <RefreshCw className="h-4 w-4" />
              <span>Refresh Data</span>
            </Button>
          </CardFooter>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>System Alerts</CardTitle>
            <CardDescription>Recent notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3 pb-3 border-b">
                <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Settlement Reminder</p>
                  <p className="text-xs text-muted-foreground">18 trades pending settlement for T+3 cycle</p>
                  <p className="text-xs text-muted-foreground mt-1">10:15 AM</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 pb-3 border-b">
                <AlertCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">System Update Complete</p>
                  <p className="text-xs text-muted-foreground">Trading platform updated to version 2.4.1</p>
                  <p className="text-xs text-muted-foreground mt-1">09:30 AM</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">New Regulatory Notice</p>
                  <p className="text-xs text-muted-foreground">CMSA published new guidelines for broker reporting</p>
                  <p className="text-xs text-muted-foreground mt-1">Yesterday</p>
                </div>
              </div>
            </div>
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