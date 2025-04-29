'use client'

import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  ResponsiveContainer,
  Legend
} from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658']

interface AssetAnalyticsProps {
  portfolioData: {
    assetAllocation: {
      name: string
      value: number
    }[]
    sectorExposure: {
      name: string
      value: number
    }[]
    historicalPerformance: {
      date: string
      value: number
      dseIndex?: number
      return?: number
    }[]
    riskMetrics: {
      name: string
      value: number
      description?: string
    }[]
    performanceMetrics?: {
      name: string
      value: number
      benchmark?: number
    }[]
  }
}

// Mock FX and commodity performance data
const fxPerformance = [
  { date: 'Jan', value: 100 },
  { date: 'Feb', value: 102 },
  { date: 'Mar', value: 105 },
  { date: 'Apr', value: 103 },
  { date: 'May', value: 107 },
  { date: 'Jun', value: 109 }
]

const commodityPerformance = [
  { date: 'Jan', value: 100 },
  { date: 'Feb', value: 103 },
  { date: 'Mar', value: 101 },
  { date: 'Apr', value: 104 },
  { date: 'May', value: 108 },
  { date: 'Jun', value: 112 }
]

export function AssetAnalytics({ portfolioData }: AssetAnalyticsProps) {
  // Provide default empty arrays if data is missing
  const assetAllocation = portfolioData?.assetAllocation || []
  const sectorExposure = portfolioData?.sectorExposure || []
  const historicalPerformance = portfolioData?.historicalPerformance || []
  const riskMetrics = portfolioData?.riskMetrics || []
  const performanceMetrics = portfolioData?.performanceMetrics || []

  return (
    <Card className="p-6">
      <Tabs defaultValue="allocation" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="allocation">Asset Allocation</TabsTrigger>
          <TabsTrigger value="sectors">Sector Exposure</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="fx-commodities">FX & Commodities</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="allocation">
          <div className="h-[400px]">
            <h3 className="text-lg font-semibold mb-4">Asset Allocation</h3>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={assetAllocation}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {assetAllocation.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        <TabsContent value="sectors">
          <div className="h-[400px]">
            <h3 className="text-lg font-semibold mb-4">Sector Exposure</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sectorExposure}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8">
                  {sectorExposure.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <div className="h-[400px]">
            <h3 className="text-lg font-semibold mb-4">Historical Performance</h3>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={historicalPerformance}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="value"
                  name="Portfolio"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
                <Line type="monotone" dataKey="dseIndex" name="DSE Index" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        <TabsContent value="fx-commodities">
          <div className="h-[400px]">
            <h3 className="text-lg font-semibold mb-4">FX & Commodity Performance (Indexed to 100)</h3>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" allowDuplicatedCategory={false} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line data={fxPerformance} type="monotone" dataKey="value" name="FX Portfolio" stroke="#8884d8" strokeWidth={2} />
                <Line data={commodityPerformance} type="monotone" dataKey="value" name="Commodity Portfolio" stroke="#82ca9d" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <Card className="p-4">
              <h4 className="text-sm font-medium text-muted-foreground">FX Holdings</h4>
              <div className="space-y-2 mt-2">
                <div className="flex justify-between">
                  <span>USD/TZS</span>
                  <span className="font-medium">60%</span>
                </div>
                <div className="flex justify-between">
                  <span>EUR/TZS</span>
                  <span className="font-medium">25%</span>
                </div>
                <div className="flex justify-between">
                  <span>GBP/TZS</span>
                  <span className="font-medium">15%</span>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h4 className="text-sm font-medium text-muted-foreground">Commodity Holdings</h4>
              <div className="space-y-2 mt-2">
                <div className="flex justify-between">
                  <span>Gold</span>
                  <span className="font-medium">40%</span>
                </div>
                <div className="flex justify-between">
                  <span>Coffee</span>
                  <span className="font-medium">25%</span>
                </div>
                <div className="flex justify-between">
                  <span>Cashew Nuts</span>
                  <span className="font-medium">20%</span>
                </div>
                <div className="flex justify-between">
                  <span>Tanzanite</span>
                  <span className="font-medium">15%</span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="risk">
          <div className="h-[400px]">
            <h3 className="text-lg font-semibold mb-4">Risk Metrics</h3>
            <div className="grid grid-cols-2 gap-4">
              {riskMetrics.map((metric, index) => (
                <Card key={index} className="p-4">
                  <h4 className="text-sm font-medium text-muted-foreground">{metric.name}</h4>
                  <p className="text-2xl font-bold">{metric.value.toFixed(2)}%</p>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  )
}