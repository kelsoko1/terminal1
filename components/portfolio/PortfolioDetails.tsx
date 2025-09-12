'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import PortfolioOverview from './PortfolioOverview'
import { Button } from '@/components/ui/button'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

const mockPerformanceData = [
  { date: '2024-01', value: 100000 },
  { date: '2024-02', value: 105000 },
  { date: '2024-03', value: 112500 },
  // Add more historical data
]

interface Transaction {
  id: string
  date: string
  type: string
  asset: string
  amount: number
  price: number
}

const mockTransactions: Transaction[] = [
  {
    id: '1',
    date: '2024-03-15',
    type: 'Buy',
    asset: 'AAPL',
    amount: 100,
    price: 150.25,
  },
  // Add more transactions
]

interface Position {
  asset: string
  shares: number
  avgPrice: number
  currentPrice: number
  value: number
  change: number
}

interface PortfolioDetailsProps {
  portfolioId: string;
  onTradeClick: (symbol: string) => void
}

export function PortfolioDetails({ portfolioId, onTradeClick }: PortfolioDetailsProps) {
  const positions: Position[] = [
    {
      asset: 'CRDB',
      shares: 100,
      avgPrice: 400,
      currentPrice: 410,
      value: 41000,
      change: 2.5
    },
    {
      asset: 'NMB',
      shares: 50,
      avgPrice: 3800,
      currentPrice: 3840,
      value: 192000,
      change: 1.2
    },
    {
      asset: 'TBL',
      shares: 25,
      avgPrice: 11000,
      currentPrice: 10900,
      value: 272500,
      change: -0.3
    }
  ]

  return (
    <div className="space-y-6">
      <PortfolioOverview />
      
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Portfolio Details</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left pb-2">Asset</th>
                <th className="text-right pb-2">Shares</th>
                <th className="text-right pb-2">Avg Price</th>
                <th className="text-right pb-2">Current Price</th>
                <th className="text-right pb-2">Value</th>
                <th className="text-right pb-2">Change</th>
                <th className="pb-2"></th>
              </tr>
            </thead>
            <tbody>
              {positions.map((position) => (
                <tr key={position.asset} className="border-b">
                  <td className="py-4 font-medium">{position.asset}</td>
                  <td className="py-4 text-right">{position.shares}</td>
                  <td className="py-4 text-right">TZS {position.avgPrice}</td>
                  <td className="py-4 text-right">TZS {position.currentPrice}</td>
                  <td className="py-4 text-right">TZS {position.value}</td>
                  <td className={`py-4 text-right ${position.change >= 0 ? 'investor-success' : 'investor-danger'}`}>
                    {position.change >= 0 ? (
                      <ArrowUpRight className="inline h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="inline h-4 w-4" />
                    )}
                    {Math.abs(position.change)}%
                  </td>
                  <td className="py-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onTradeClick(position.asset)}
                    >
                      Trade
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
} 