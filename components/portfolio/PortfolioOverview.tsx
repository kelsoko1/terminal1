'use client'

import { Card } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown } from 'lucide-react'

const assetData = [
  { name: 'Banking', value: 30 },
  { name: 'Manufacturing', value: 20 },
  { name: 'Consumer Goods', value: 15 },
  { name: 'FX Positions', value: 20 },
  { name: 'Commodities', value: 15 }
]

const fxData = [
  { name: 'USD/TZS', value: 12, change: 1.2 },
  { name: 'EUR/TZS', value: 5, change: -0.5 },
  { name: 'GBP/TZS', value: 3, change: 0.8 }
]

const commodityData = [
  { name: 'Gold', value: 6, change: 2.1 },
  { name: 'Coffee', value: 4, change: -0.7 },
  { name: 'Cashew Nuts', value: 3, change: 1.5 },
  { name: 'Tanzanite', value: 2, change: 3.2 }
]

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export default function PortfolioOverview() {
  return (
    <div className="space-y-4 md:space-y-6">
      <Card className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6">
          <div className="mb-2 sm:mb-0">
            <h2 className="text-base md:text-lg font-semibold">Portfolio Overview</h2>
            <p className="text-sm md:text-base text-muted-foreground">Total Value: TZS 505,500</p>
          </div>
          <div className="flex items-center sm:text-right bg-muted/20 px-3 py-1 rounded-full sm:bg-transparent sm:p-0">
            <div className="text-green-600 font-medium">+12%</div>
            <div className="text-xs md:text-sm text-muted-foreground ml-2">Today's Change</div>
          </div>
        </div>

        <div className="h-[220px] md:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={assetData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius="80%"
                innerRadius="0%"
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => {
                  // On small screens, only show percentage for smaller segments
                  const value = (percent * 100).toFixed(0);
                  return window.innerWidth < 768 && percent < 0.15 ? `${value}%` : `${name} ${value}%`;
                }}
              >
                {assetData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}%`, 'Allocation']} />
              <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Tabs defaultValue="fx" className="w-full">
        <div className="overflow-x-auto -mx-4 px-4">
          <TabsList className="w-auto min-w-fit">
            <TabsTrigger value="fx" className="px-3 md:px-4">FX Positions</TabsTrigger>
            <TabsTrigger value="commodities" className="px-3 md:px-4">Commodities</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="fx" className="mt-3 md:mt-4">
          <Card className="p-3 md:p-6">
            <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">FX Portfolio</h3>
            <div className="space-y-2 md:space-y-4">
              {fxData.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 md:p-3 border rounded-lg">
                  <div>
                    <h4 className="text-sm md:text-base font-medium">{item.name}</h4>
                    <p className="text-xs md:text-sm text-muted-foreground">{item.value}% of portfolio</p>
                  </div>
                  <div className="flex items-center">
                    <Badge className={`text-xs md:text-sm ${item.change >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {item.change >= 0 ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      {item.change >= 0 ? '+' : ''}{item.change}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="commodities" className="mt-3 md:mt-4">
          <Card className="p-3 md:p-6">
            <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Commodities Portfolio</h3>
            <div className="space-y-2 md:space-y-4">
              {commodityData.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 md:p-3 border rounded-lg">
                  <div>
                    <h4 className="text-sm md:text-base font-medium">{item.name}</h4>
                    <p className="text-xs md:text-sm text-muted-foreground">{item.value}% of portfolio</p>
                  </div>
                  <div className="flex items-center">
                    <Badge className={`text-xs md:text-sm ${item.change >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {item.change >= 0 ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      {item.change >= 0 ? '+' : ''}{item.change}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}