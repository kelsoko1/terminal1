'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CommodityFutures } from './CommodityFutures'
import { FuturesTransactions } from './FuturesTransactions'
import { WarehouseManagement } from './WarehouseManagement'
import { CommodityPricing } from './CommodityPricing'
import { CommodityMatchingEngine } from './CommodityMatchingEngine'
import { CommodityClearingSettlement } from './CommodityClearingSettlement'
import { CommodityReports } from './CommodityReports'
import { Plus, Download, BarChart3, RefreshCw } from 'lucide-react'

export function CommodityManagement() {
  const [activeTab, setActiveTab] = useState('futures')

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-semibold">Commodity Futures Trading</h2>
            <p className="text-muted-foreground">
              Manage futures contracts, transactions, matching engine, clearing, and reporting
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Market Analytics
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export Data
            </Button>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Futures Contract
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-transparent border rounded-lg p-1 mb-6">
            <TabsTrigger 
              value="futures"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded"
            >
              Futures Contracts
            </TabsTrigger>
            <TabsTrigger 
              value="transactions"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded"
            >
              Transactions
            </TabsTrigger>
            <TabsTrigger 
              value="matching"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded"
            >
              Matching Engine
            </TabsTrigger>
            <TabsTrigger 
              value="clearing"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded"
            >
              Clearing & Settlement
            </TabsTrigger>
            <TabsTrigger 
              value="warehouses"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded"
            >
              Warehouses
            </TabsTrigger>
            <TabsTrigger 
              value="pricing"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded"
            >
              Pricing
            </TabsTrigger>
            <TabsTrigger 
              value="reports"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded"
            >
              Reports
            </TabsTrigger>
            <TabsTrigger 
              value="settings"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded"
            >
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="futures">
            <CommodityFutures />
          </TabsContent>

          <TabsContent value="transactions">
            <FuturesTransactions />
          </TabsContent>
          
          <TabsContent value="matching">
            <CommodityMatchingEngine />
          </TabsContent>
          
          <TabsContent value="clearing">
            <CommodityClearingSettlement />
          </TabsContent>

          <TabsContent value="warehouses">
            <WarehouseManagement />
          </TabsContent>

          <TabsContent value="pricing">
            <CommodityPricing />
          </TabsContent>
          
          <TabsContent value="reports">
            <CommodityReports />
          </TabsContent>

          <TabsContent value="settings">
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-medium mb-4">Futures Trading Settings</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="default-margin" className="text-sm font-medium">Default Initial Margin (%)</label>
                      <Input id="default-margin" type="number" defaultValue="10.0" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="maintenance-margin" className="text-sm font-medium">Default Maintenance Margin (%)</label>
                      <Input id="maintenance-margin" type="number" defaultValue="5.0" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="price-refresh" className="text-sm font-medium">Price Refresh Interval (minutes)</label>
                      <Input id="price-refresh" type="number" defaultValue="15" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="auto-approve" className="text-sm font-medium">Auto-approve Transactions</label>
                      <select 
                        id="auto-approve" 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="all">All transactions</option>
                        <option value="below">Below threshold</option>
                        <option value="none">None (manual approval)</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="approval-threshold" className="text-sm font-medium">Approval Threshold Amount (TZS)</label>
                    <Input id="approval-threshold" type="number" defaultValue="5000000" />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="max-leverage" className="text-sm font-medium">Maximum Leverage</label>
                    <Input id="max-leverage" type="number" defaultValue="10" />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="settlement-time" className="text-sm font-medium">Daily Settlement Time</label>
                    <Input id="settlement-time" type="time" defaultValue="16:00" />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="matching-algorithm" className="text-sm font-medium">Matching Algorithm</label>
                    <select 
                      id="matching-algorithm" 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="fifo">Price-Time Priority (FIFO)</option>
                      <option value="pro-rata">Pro-Rata</option>
                      <option value="hybrid">Hybrid (FIFO/Pro-Rata)</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="circuit-breaker" className="text-sm font-medium">Circuit Breaker Threshold (%)</label>
                    <Input id="circuit-breaker" type="number" defaultValue="7.0" />
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button>Save Settings</Button>
                </div>
              </Card>
              
              <Card className="p-6">
                <h3 className="text-lg font-medium mb-4">API Integration</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="api-source" className="text-sm font-medium">Price Data API Source</label>
                    <select 
                      id="api-source" 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="tmx">Tanzania Mercantile Exchange (TMX)</option>
                      <option value="cme">Chicago Mercantile Exchange (CME)</option>
                      <option value="internal">Internal (Manual)</option>
                      <option value="mixed">Mixed (External with Manual Override)</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="api-key" className="text-sm font-medium">API Key</label>
                    <Input id="api-key" type="password" placeholder="Enter API key" />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="api-endpoint" className="text-sm font-medium">API Endpoint</label>
                    <Input id="api-endpoint" placeholder="https://api.example.com/commodities/futures" />
                  </div>
                </div>
                
                <div className="mt-6 flex gap-2">
                  <Button>Save API Settings</Button>
                  <Button variant="outline" className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Test Connection
                  </Button>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
