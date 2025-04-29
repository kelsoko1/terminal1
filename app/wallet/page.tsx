'use client'

import React from 'react'
import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import WalletOverview from '@/components/wallet/WalletOverview'
import DepositForm from '@/components/wallet/DepositForm'
import WithdrawForm from '@/components/wallet/WithdrawForm'
import TransactionHistory from '@/components/wallet/TransactionHistory'
import MarginTradingDashboard from '@/components/margin/MarginTradingDashboard'
import MarginPositions from '@/components/margin/MarginPositions'
import MarginTradeModal from '@/components/margin/MarginTradeModal'
import MarginTradeHistory from '@/components/margin/MarginTradeHistory'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DollarSign, TrendingUp, History, Settings } from 'lucide-react'

export default function WalletPage() {
  const [showMarginTradeModal, setShowMarginTradeModal] = useState(false)

  return (
    <div className="container mx-auto py-6">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Wallet</h1>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="margin">Margin Trading</TabsTrigger>
            <TabsTrigger value="deposit">Deposit</TabsTrigger>
            <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <WalletOverview />
          </TabsContent>

          <TabsContent value="margin">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-semibold">Margin Trading</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Trade with up to 3x buying power
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Margin Settings
                  </Button>
                  <Button onClick={() => setShowMarginTradeModal(true)}>
                    <DollarSign className="w-4 h-4 mr-2" />
                    New Trade
                  </Button>
                </div>
              </div>
              
              <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
                <div className="space-y-6">
                  <MarginTradingDashboard />
                  <MarginPositions />
                  <MarginTradeHistory />
                </div>

                <div className="space-y-6">
                  <Card className="p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="w-4 h-4" />
                      <h3 className="font-medium">Quick Actions</h3>
                    </div>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        <DollarSign className="w-4 h-4 mr-2" />
                        Adjust Margin
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <History className="w-4 h-4 mr-2" />
                        View History
                      </Button>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="deposit">
            <DepositForm />
          </TabsContent>

          <TabsContent value="withdraw">
            <WithdrawForm />
          </TabsContent>

          <TabsContent value="history">
            <TransactionHistory />
          </TabsContent>
        </Tabs>
      </div>

      <MarginTradeModal 
        isOpen={showMarginTradeModal} 
        onClose={() => setShowMarginTradeModal(false)} 
      />
    </div>
  )
} 