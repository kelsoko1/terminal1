'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { marketData } from '@/lib/data/markets'

interface ChartProps {
  symbol: string
}

type TimeFrame = '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL'

export function Chart({ symbol }: ChartProps) {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('1D')
  const [chartData, setChartData] = useState<any[]>([])

  const instrument = marketData
    .flatMap(group => group.regions)
    .flatMap(region => region.exchanges)
    .flatMap(exchange => exchange.instruments)
    .find(i => i.symbol === symbol)

  useEffect(() => {
    // In production, this would fetch real data from your API
    // For now, we'll generate sample data
    const generateData = () => {
      const basePrice = instrument?.price || 100
      const points = timeFrame === '1D' ? 24 : 30
      const data = []
      
      for (let i = 0; i < points; i++) {
        const variation = (Math.random() - 0.5) * 2
        data.push({
          time: timeFrame === '1D' 
            ? `${String(i).padStart(2, '0')}:00`
            : `Day ${i + 1}`,
          price: (basePrice + variation * (basePrice * 0.02)).toFixed(2)
        })
      }
      
      return data
    }

    setChartData(generateData())
  }, [timeFrame, symbol, instrument?.price])

  if (!instrument) return null

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">{instrument.symbol}</h2>
          <p className="text-muted-foreground">{instrument.name}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">
            TZS {instrument.price.toLocaleString()}
          </div>
          <div className={instrument.change >= 0 ? 'text-green-600' : 'text-red-600'}>
            {instrument.change >= 0 ? '+' : ''}{instrument.change}%
          </div>
        </div>
      </div>

      <Tabs defaultValue="1D" className="w-full">
        <TabsList>
          {(['1D', '1W', '1M', '3M', '1Y', 'ALL'] as TimeFrame[]).map((tf) => (
            <TabsTrigger 
              key={tf} 
              value={tf}
              onClick={() => setTimeFrame(tf)}
            >
              {tf}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="h-[400px] mt-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="time"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              domain={['dataMin', 'dataMax']}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `TZS ${value}`}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'var(--background)',
                borderColor: 'var(--border)',
              }}
              formatter={(value: number) => [`TZS ${value}`, 'Price']}
            />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#8884d8" 
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
} 