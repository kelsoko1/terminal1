'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { StockListing } from './StockListing'
import { StockOrderBook } from './StockOrderBook'
import { StockTradeHistory } from './StockTradeHistory'
import { StockIPOManagement } from './StockIPOManagement'

export function StockManagement() {
  const [activeTab, setActiveTab] = useState('listing')
  
  return (
    <Card className="overflow-hidden">
      <div className="p-6 border-b">
        <h2 className="text-2xl font-semibold">DSE Stock Management</h2>
        <p className="text-muted-foreground mt-1">
          Manage equities, monitor market activity, and handle stock orders on the Dar es Salaam Stock Exchange.
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="px-6 border-b">
          <TabsList className="bg-transparent border rounded-lg p-1">
            <TabsTrigger 
              value="listing"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded"
            >
              Stock Listing
            </TabsTrigger>
            <TabsTrigger 
              value="orderbook"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded"
            >
              Order Book
            </TabsTrigger>
            <TabsTrigger 
              value="history"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded"
            >
              Trade History
            </TabsTrigger>
            <TabsTrigger 
              value="ipo"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded"
            >
              IPO Management
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="listing" className="p-6">
          <StockListing />
        </TabsContent>
        
        <TabsContent value="orderbook" className="p-6">
          <StockOrderBook />
        </TabsContent>
        
        <TabsContent value="history" className="p-6">
          <StockTradeHistory />
        </TabsContent>
        
        <TabsContent value="ipo" className="p-6">
          <StockIPOManagement />
        </TabsContent>
      </Tabs>
    </Card>
  )
}
