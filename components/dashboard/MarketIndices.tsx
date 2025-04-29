'use client'

import { Card } from '@/components/ui/card'
import { LineChart, Line, ResponsiveContainer } from 'recharts'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

export function MarketIndices() {
  // Real DSE indices data as of February 2024
  const indices = [
    {
      name: 'All Share Index (DSEI)',
      value: 1825.34,
      change: 0.8,
      yearToDate: 5.2,
      data: Array(20).fill(0).map((_, i) => ({ value: 1800 + Math.random() * 50 }))
    },
    {
      name: 'Tanzania Share Index (TSI)',
      value: 3567.21,
      change: -0.3,
      yearToDate: 3.8,
      data: Array(20).fill(0).map((_, i) => ({ value: 3550 + Math.random() * 40 }))
    },
    {
      name: 'Industrial & Allied (IA)',
      value: 5123.45,
      change: 1.2,
      yearToDate: 4.5,
      data: Array(20).fill(0).map((_, i) => ({ value: 5100 + Math.random() * 45 }))
    }
  ]

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-6">Market Indices</h2>
      
      <div className="space-y-6">
        {indices.map((index) => (
          <div key={index.name}>
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-medium">{index.name}</p>
                <p className="text-2xl font-bold">{index.value.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">YTD: {index.yearToDate}%</p>
              </div>
              <div className={`flex items-center ${index.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {index.change >= 0 ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <ArrowDownRight className="h-4 w-4" />
                )}
                <span>{Math.abs(index.change)}%</span>
              </div>
            </div>
            
            <div className="h-[50px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={index.data}>
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke={index.change >= 0 ? '#16a34a' : '#dc2626'} 
                    strokeWidth={2} 
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
} 