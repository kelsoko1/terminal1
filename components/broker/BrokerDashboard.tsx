'use client'

import { Card } from '@/components/ui/card'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

const mockData = [
  { month: 'Jan', clients: 120, transactions: 450, revenue: 15000000 },
  { month: 'Feb', clients: 135, transactions: 520, revenue: 18200000 },
  { month: 'Mar', clients: 142, transactions: 610, revenue: 22400000 },
  { month: 'Apr', clients: 156, transactions: 580, revenue: 21100000 },
  { month: 'May', clients: 168, transactions: 650, revenue: 24200000 },
  { month: 'Jun', clients: 175, transactions: 720, revenue: 27500000 },
]

export default function BrokerDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Total DSE Clients</h3>
          <p className="text-3xl">175</p>
          <p className="text-sm text-muted-foreground">+7 this month</p>
        </Card>
        
        <Card className="p-4">
          <h3 className="font-semibold mb-2">DSE Monthly Transactions</h3>
          <p className="text-3xl">720</p>
          <p className="text-sm text-muted-foreground">85% execution rate</p>
        </Card>
        
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Commission Revenue</h3>
          <p className="text-3xl">TZS 27.5M</p>
          <p className="text-sm text-green-600">+13.6% from last month</p>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-4">
          <h3 className="font-semibold mb-4">DSE Market Activity</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Market Status</span>
              <span className="text-sm font-medium text-green-600">Open</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Orders Today</span>
              <span className="text-sm font-medium">125</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Pending Settlements</span>
              <span className="text-sm font-medium">18</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Trading Hours</span>
              <span className="text-sm font-medium">10:00 - 15:30 EAT</span>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-4">Top Traded DSE Stocks</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">CRDB</span>
              <span className="text-sm font-medium">TZS 85.2M</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">NMB</span>
              <span className="text-sm font-medium">TZS 62.8M</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">TBL</span>
              <span className="text-sm font-medium">TZS 48.5M</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">TPCC</span>
              <span className="text-sm font-medium">TZS 35.3M</span>
            </div>
          </div>
        </Card>
      </div>
      
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Performance Overview</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis 
                yAxisId="metrics"
                orientation="left"
                tickFormatter={(value) => value.toString()}
              />
              <YAxis 
                yAxisId="revenue"
                orientation="right"
                tickFormatter={(value) => `TZS ${(value / 1000000).toFixed(1)}M`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                }}
                formatter={(value: number, name: string) => [
                  name === 'revenue' ? `TZS ${(value / 1000000).toFixed(1)}M` : value,
                  name.charAt(0).toUpperCase() + name.slice(1)
                ]}
              />
              <Line 
                type="monotone" 
                dataKey="clients" 
                stroke="#8884d8" 
                yAxisId="metrics"
                name="DSE Clients"
              />
              <Line 
                type="monotone" 
                dataKey="transactions" 
                stroke="#82ca9d" 
                yAxisId="metrics"
                name="DSE Transactions"
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#ffc658" 
                yAxisId="revenue"
                name="Commission Revenue"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
} 