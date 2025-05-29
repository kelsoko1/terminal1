'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts'

// Define benchmark indices
const benchmarks = [
  { id: 'dse', name: 'DSE All Share Index' },
  { id: 'tse', name: 'Tanzania Share Index' },
  { id: 'industry', name: 'Industry Average' }
]

// Mock data for comparison
const generateComparisonData = (timeframe: string) => {
  const now = new Date()
  const data = []
  
  // Generate data points based on the selected timeframe
  let points = 30 // Default for 1M
  let interval = 24 * 60 * 60 * 1000 // 1 day in milliseconds
  
  if (timeframe === '1W') {
    points = 7
    interval = 24 * 60 * 60 * 1000 // 1 day
  } else if (timeframe === '3M') {
    points = 90
    interval = 24 * 60 * 60 * 1000 // 1 day
  } else if (timeframe === '1Y') {
    points = 12
    interval = 30 * 24 * 60 * 60 * 1000 // 1 month
  } else if (timeframe === '5Y') {
    points = 20
    interval = 3 * 30 * 24 * 60 * 60 * 1000 // 3 months
  }
  
  // Start with base values
  let portfolioValue = 100 // Starting at 100 (percentage)
  let dseValue = 100
  let tseValue = 100
  let industryValue = 100
  
  for (let i = 0; i < points; i++) {
    const date = new Date(now.getTime() - ((points - i) * interval))
    
    // Random variations with slight bias
    // Portfolio slightly outperforms the market in this example
    portfolioValue = portfolioValue * (1 + (Math.random() * 0.04 - 0.015))
    dseValue = dseValue * (1 + (Math.random() * 0.035 - 0.015))
    tseValue = tseValue * (1 + (Math.random() * 0.03 - 0.015))
    industryValue = industryValue * (1 + (Math.random() * 0.025 - 0.01))
    
    data.push({
      date: date.toISOString().split('T')[0],
      portfolio: Math.round(portfolioValue * 100) / 100,
      dse: Math.round(dseValue * 100) / 100,
      tse: Math.round(tseValue * 100) / 100,
      industry: Math.round(industryValue * 100) / 100
    })
  }
  
  return data
}

// Generate performance metrics for comparison
const generatePerformanceMetrics = () => {
  return [
    { 
      name: 'Return', 
      portfolio: 12.5, 
      benchmark: 9.8,
      difference: 2.7
    },
    { 
      name: 'Volatility', 
      portfolio: 15.2, 
      benchmark: 14.5,
      difference: 0.7
    },
    { 
      name: 'Sharpe Ratio', 
      portfolio: 0.82, 
      benchmark: 0.68,
      difference: 0.14
    },
    { 
      name: 'Max Drawdown', 
      portfolio: -18.5, 
      benchmark: -22.3,
      difference: 3.8
    }
  ]
}

interface PortfolioComparisonProps {
  portfolioValue?: number
  portfolioReturn?: number
}

export default function PortfolioComparison({ portfolioValue, portfolioReturn }: PortfolioComparisonProps) {
  const [timeframe, setTimeframe] = useState('1Y')
  const [selectedBenchmark, setSelectedBenchmark] = useState('dse')
  const [comparisonData, setComparisonData] = useState<any[]>([])
  const [performanceMetrics, setPerformanceMetrics] = useState<any[]>([])
  
  useEffect(() => {
    // Generate comparison data based on timeframe
    setComparisonData(generateComparisonData(timeframe))
    setPerformanceMetrics(generatePerformanceMetrics())
  }, [timeframe, selectedBenchmark])
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Portfolio Comparison</CardTitle>
          <div className="flex items-center space-x-2">
            <Select value={selectedBenchmark} onValueChange={setSelectedBenchmark}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select benchmark" />
              </SelectTrigger>
              <SelectContent>
                {benchmarks.map((benchmark) => (
                  <SelectItem key={benchmark.id} value={benchmark.id}>
                    {benchmark.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="performance">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="performance">
            <div className="space-y-4">
              <div className="flex space-x-2 mb-4">
                {['1W', '1M', '3M', '1Y', '5Y'].map((tf) => (
                  <Button 
                    key={tf} 
                    variant={timeframe === tf ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTimeframe(tf)}
                  >
                    {tf}
                  </Button>
                ))}
              </div>
              
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      tickFormatter={(value) => `${value}%`}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      formatter={(value: any) => [`${value}%`, '']}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="portfolio" 
                      name="Your Portfolio"
                      stroke="#0088FE" 
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey={selectedBenchmark} 
                      name={benchmarks.find(b => b.id === selectedBenchmark)?.name || selectedBenchmark}
                      stroke="#FF8042" 
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="text-sm text-muted-foreground mt-2">
                <p>This chart shows the relative performance of your portfolio compared to the selected benchmark, normalized to 100 at the start of the period.</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="metrics">
            <div className="space-y-4">
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={performanceMetrics}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tickFormatter={(value) => `${value}%`} />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip formatter={(value: any) => [`${value}%`, '']} />
                    <Legend />
                    <Bar dataKey="portfolio" name="Your Portfolio" fill="#0088FE" />
                    <Bar dataKey="benchmark" name={benchmarks.find(b => b.id === selectedBenchmark)?.name || selectedBenchmark} fill="#FF8042" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="text-sm font-medium mb-4">Performance Analysis</h3>
                <div className="space-y-4">
                  {performanceMetrics.map((metric) => (
                    <div key={metric.name} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{metric.name}</span>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm">
                          Your Portfolio: <span className="font-medium">{metric.portfolio}%</span>
                        </span>
                        <span className="text-sm">
                          Benchmark: <span className="font-medium">{metric.benchmark}%</span>
                        </span>
                        <span className={`text-sm ${metric.difference > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          Difference: <span className="font-medium">{metric.difference > 0 ? '+' : ''}{metric.difference}%</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground mt-2">
                <p>This analysis compares key performance metrics between your portfolio and the selected benchmark over the {timeframe} period.</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
