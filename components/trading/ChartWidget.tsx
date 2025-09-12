'use client'

import { useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

// Mock data for the chart
const generateMockData = (days: number) => {
  const data = []
  let price = 100
  for (let i = 0; i < days; i++) {
    price = price + (Math.random() - 0.5) * 5
    data.push({
      date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
      price: price.toFixed(2),
      volume: Math.floor(Math.random() * 1000000)
    })
  }
  return data
}

export function ChartWidget({ symbol }: { symbol?: string }) {
  const [timeframe, setTimeframe] = useState('1D')
  const [data, setData] = useState(() => generateMockData(30))

  const handleTimeframeChange = (newTimeframe: string) => {
    setTimeframe(newTimeframe)
    // Generate new data based on timeframe
    const days = newTimeframe === '1D' ? 1 : 
                newTimeframe === '1W' ? 7 : 
                newTimeframe === '1M' ? 30 : 
                newTimeframe === '3M' ? 90 : 180
    setData(generateMockData(days))
  }

  return (
    <Card className="h-full p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold">{symbol || 'CRDB'}</h2>
          <p className="text-sm text-muted-foreground">Last Price: TZS {data[data.length - 1]?.price}</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={timeframe === '1D' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => handleTimeframeChange('1D')}
          >
            1D
          </Button>
          <Button 
            variant={timeframe === '1W' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => handleTimeframeChange('1W')}
          >
            1W
          </Button>
          <Button 
            variant={timeframe === '1M' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => handleTimeframeChange('1M')}
          >
            1M
          </Button>
          <Button 
            variant={timeframe === '3M' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => handleTimeframeChange('3M')}
          >
            3M
          </Button>
          <Button 
            variant={timeframe === '6M' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => handleTimeframeChange('6M')}
          >
            6M
          </Button>
        </div>
      </div>

      <div className="h-[calc(100%-60px)]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              domain={['auto', 'auto']}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--background)',
                borderColor: 'var(--border)',
                borderRadius: '6px',
              }}
              formatter={(value: number) => [`TZS ${value}`, 'Price']}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#8884d8" 
              dot={false}
              name="Price"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
} 