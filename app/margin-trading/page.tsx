'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import MarginTradingDashboard from '@/components/margin/MarginTradingDashboard'
import MarginPositions from '@/components/margin/MarginPositions'
import MarginTradeModal from '@/components/margin/MarginTradeModal'
import MarginTradeHistory from '@/components/margin/MarginTradeHistory'

export default function MarginTradingPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Margin Trading</h1>
        <MarginTradeModal />
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="positions">Open Positions</TabsTrigger>
          <TabsTrigger value="history">Trade History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <MarginTradingDashboard />
        </TabsContent>

        <TabsContent value="positions">
          <MarginPositions />
        </TabsContent>

        <TabsContent value="history">
          <MarginTradeHistory />
        </TabsContent>
      </Tabs>
    </div>
  )
} 