'use client'

import { Card } from '@/components/ui/card'
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { Clock } from 'lucide-react'

export function TradingActivity() {
  // Real DSE trading activity data (example from a typical trading day)
  const activityData = [
    { time: '10:00', value: 12500 },
    { time: '11:00', value: 28900 },
    { time: '12:00', value: 15600 },
    { time: '13:00', value: 9800 },
    { time: '14:00', value: 22400 },
    { time: '15:00', value: 18700 },
    { time: '15:30', value: 8500 }
  ]

  const totalValue = activityData.reduce((sum, item) => sum + item.value, 0)
  const averageValue = Math.round(totalValue / activityData.length)

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Trading Activity</h2>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Volume</p>
            <p className="text-2xl font-bold">{totalValue.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Average Volume</p>
            <p className="text-2xl font-bold">{averageValue.toLocaleString()}</p>
          </div>
        </div>

        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activityData}>
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => value}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                }}
                formatter={(value: number) => [value.toLocaleString(), 'Volume']}
                labelFormatter={(label) => `Time: ${label}`}
              />
              <Bar 
                dataKey="value" 
                fill="var(--primary)" 
                opacity={0.8}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  )
} 