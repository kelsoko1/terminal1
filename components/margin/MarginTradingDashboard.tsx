'use client'

import React from 'react';
import { Card } from '@/components/ui/card'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts'
import { AlertCircle, DollarSign, TrendingUp, ShieldAlert, AlertTriangle, BarChart2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import MarginTradeModal from './MarginTradeModal'

interface MarginStats {
  totalPositions: number;
  openProfit: number;
  marginUsed: number;
  availableMargin: number;
}

const stats: MarginStats = {
  totalPositions: 3,
  openProfit: 1250000,
  marginUsed: 5000000,
  availableMargin: 15000000,
};

const mockPerformanceData = [
  { date: '2024-01', pnl: 1000 },
  { date: '2024-02', pnl: 2500 },
  { date: '2024-03', pnl: 1800 },
  // Add more data points
]

export default function MarginTradingDashboard() {
  const [isTradeModalOpen, setIsTradeModalOpen] = React.useState(false)

  return (
    <div className="space-y-6">
      <MarginTradeModal 
        isOpen={isTradeModalOpen}
        onClose={() => setIsTradeModalOpen(false)}
      />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-medium">Total Positions</h3>
          </div>
          <p className="text-2xl font-bold mt-2">{stats.totalPositions}</p>
        </Card>

        <Card className={`p-4 bg-gradient-to-br ${stats.openProfit >= 0 ? 'from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50' : 'from-red-50 to-rose-50 dark:from-red-950/50 dark:to-rose-950/50'}`}>
          <div className="flex items-center gap-2">
            <DollarSign className={`h-4 w-4 ${stats.openProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
            <h3 className="text-sm font-medium">Open P/L</h3>
          </div>
          <p className={`text-2xl font-bold mt-2 ${stats.openProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {stats.openProfit >= 0 ? '+' : '-'}TZS {Math.abs(stats.openProfit).toLocaleString()}
          </p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/50 dark:to-violet-950/50">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <h3 className="text-sm font-medium">Margin Used</h3>
          </div>
          <p className="text-2xl font-bold mt-2">
            TZS {stats.marginUsed.toLocaleString()}
          </p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <h3 className="text-sm font-medium">Available Margin</h3>
          </div>
          <p className="text-2xl font-bold mt-2">
            TZS {stats.availableMargin.toLocaleString()}
          </p>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={() => setIsTradeModalOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
        >
          New Margin Trade
        </Button>
      </div>

      {/* Main Buying Power Card */}
      <Card className="p-6 bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-950/50 dark:to-gray-950/50">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Margin Buying Power
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Available Buying Power</p>
              <p className="text-4xl font-bold mt-1 bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-600">
                TZS 75,000
              </p>
              <p className="text-sm text-muted-foreground mt-2">3x Margin Available</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between p-2 rounded-lg bg-white/50 dark:bg-white/5">
                <span className="text-sm">Account Value</span>
                <span className="font-medium">TZS 25,000</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-white/50 dark:bg-white/5">
                <span className="text-sm">Maintenance Requirement</span>
                <span className="font-medium">TZS 5,000</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Risk Level Indicator */}
      <Card className="p-6 border-l-4 border-l-amber-500 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50">
        <div className="flex items-start gap-4">
          <ShieldAlert className="w-5 h-5 text-amber-500" />
          <div>
            <h3 className="font-semibold text-amber-900 dark:text-amber-100">Current Risk Level: Moderate</h3>
            <p className="text-sm text-amber-800/80 dark:text-amber-200/80 mt-1">
              Your account is using 40% of available margin. Consider your risk tolerance before taking on additional margin positions.
            </p>
          </div>
        </div>
      </Card>

      {/* Performance Overview */}
      <Card className="p-6 bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-950/50 dark:to-gray-950/50">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Margin Performance</h3>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-green-500 font-medium">+10.5% MTD</span>
          </div>
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockPerformanceData}>
              <defs>
                <linearGradient id="colorPnl" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="rgb(34, 197, 94)" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="rgb(34, 197, 94)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis 
                dataKey="date" 
                stroke="currentColor" 
                opacity={0.5}
                tickLine={false}
              />
              <YAxis 
                tickFormatter={(value) => `TZS ${value}`}
                stroke="currentColor"
                opacity={0.5}
                tickLine={false}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                }}
                formatter={(value: number) => [`TZS ${value}`, 'P&L']}
              />
              <Area 
                type="monotone" 
                dataKey="pnl" 
                stroke="rgb(34, 197, 94)"
                fillOpacity={1}
                fill="url(#colorPnl)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Educational Notice */}
      <Alert className="bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800">
        <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertDescription className="text-blue-800 dark:text-blue-200">
          Trading on margin involves greater risk, including potential losses in excess of your investment and margin calls. 
          <Button variant="link" className="h-auto p-0 ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
            Learn more about margin trading
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  )
} 