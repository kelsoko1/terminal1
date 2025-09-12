'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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

// Mock data for market insights
const marketTrends = [
  { month: 'Jan', dseIndex: 2100, volume: 75 },
  { month: 'Feb', dseIndex: 2150, volume: 80 },
  { month: 'Mar', dseIndex: 2200, volume: 85 },
  { month: 'Apr', dseIndex: 2180, volume: 82 },
  { month: 'May', dseIndex: 2230, volume: 88 },
  { month: 'Jun', dseIndex: 2250, volume: 90 }
]

const sectorPerformance = [
  { name: 'Banking', value: 8.5 },
  { name: 'Telecom', value: 5.2 },
  { name: 'Manufacturing', value: 3.8 },
  { name: 'Energy', value: 7.1 },
  { name: 'Consumer', value: 4.5 }
]

const marketBreadth = [
  { name: 'Advancing', value: 65 },
  { name: 'Declining', value: 25 },
  { name: 'Unchanged', value: 10 }
]

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']
const BREADTH_COLORS = ['#4CAF50', '#F44336', '#9E9E9E']

export function MarketInsights() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Market Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="trends">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="trends">Market Trends</TabsTrigger>
            <TabsTrigger value="sectors">Sector Performance</TabsTrigger>
            <TabsTrigger value="breadth">Market Breadth</TabsTrigger>
          </TabsList>
          
          <TabsContent value="trends" className="space-y-4">
            <div className="h-[300px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={marketTrends}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="dseIndex"
                    stroke="#8884d8"
                    name="DSE Index"
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="volume"
                    stroke="#82ca9d"
                    name="Trading Volume (Bn TZS)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <Card>
                <CardHeader className="py-2">
                  <CardTitle className="text-sm">DSE Index</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2,250</div>
                  <div className="text-xs text-green-600">+0.9% (20 points)</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="py-2">
                  <CardTitle className="text-sm">Market Cap</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">16.8T</div>
                  <div className="text-xs text-green-600">+1.2% (200B)</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="py-2">
                  <CardTitle className="text-sm">Daily Volume</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">90B</div>
                  <div className="text-xs text-green-600">+2.3% (2B)</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="sectors">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={sectorPerformance}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis label={{ value: 'Return (%)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="YTD Return (%)">
                      {sectorPerformance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-4">Sector Analysis</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Banking Sector</h4>
                    <p className="text-sm text-muted-foreground">
                      Leading the market with strong Q1 earnings. CRDB and NMB showing robust growth.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium">Telecom Sector</h4>
                    <p className="text-sm text-muted-foreground">
                      Stable performance with increasing data revenue offsetting voice decline.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium">Manufacturing Sector</h4>
                    <p className="text-sm text-muted-foreground">
                      Facing challenges with rising input costs but showing resilience.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium">Energy Sector</h4>
                    <p className="text-sm text-muted-foreground">
                      Strong performance driven by infrastructure development and increasing demand.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="breadth">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={marketBreadth}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {marketBreadth.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={BREADTH_COLORS[index % BREADTH_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-4">Market Breadth Indicators</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Advance-Decline Ratio</span>
                    <span className="font-medium text-green-600">2.6</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>New Highs</span>
                    <span className="font-medium">12</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>New Lows</span>
                    <span className="font-medium">3</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Stocks Above 50-Day MA</span>
                    <span className="font-medium text-green-600">72%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Stocks Above 200-Day MA</span>
                    <span className="font-medium text-green-600">68%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Market Sentiment</span>
                    <span className="font-medium text-green-600">Bullish</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
