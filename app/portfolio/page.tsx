'use client'

import { useState, useEffect } from 'react'
import '@/styles/portfolio-mobile.css'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useStore } from '@/lib/store'
import { useAuth } from '@/lib/auth/auth-context'
import { Portfolio } from '@/components/Portfolio'
import { PortfolioDetails } from '@/components/portfolio/PortfolioDetails'
import PortfolioComparison from '@/components/portfolio/PortfolioComparison'
import { TradeModal } from '@/components/TradeModal'
import PortfolioList from '@/components/portfolio/PortfolioList'
import PortfolioOverview from '@/components/portfolio/PortfolioOverview'
import { AssetAnalytics } from '@/components/portfolio/AssetAnalytics'
import { AccountingSummary } from '@/components/portfolio/AccountingSummary'
import { TradingChallenges } from '@/components/social/TradingChallenges'
import { CompetitionLeaderboard } from '@/components/social/CompetitionLeaderboard'

// Create minimal data structures for components that require props
const portfolioData = {
  assetAllocation: [
    { name: 'Stocks', value: 60 },
    { name: 'Bonds', value: 20 },
    { name: 'Cash', value: 20 }
  ],
  sectorExposure: [
    { name: 'Banking', value: 40 },
    { name: 'Manufacturing', value: 30 },
    { name: 'Consumer Goods', value: 30 }
  ],
  historicalPerformance: [
    { date: '2024-01', value: 100000 },
    { date: '2024-02', value: 105000 },
    { date: '2024-03', value: 110000 }
  ],
  riskMetrics: [
    { name: 'Volatility', value: 12.5, description: 'Portfolio volatility' },
    { name: 'Sharpe Ratio', value: 1.2, description: 'Risk-adjusted return' }
  ],
  performanceMetrics: [
    { name: 'YTD Return', value: 8.5, benchmark: 7.2 }
  ]
}

const accountingData = {
  cashBalance: 50000,
  totalAssets: 500000,
  unrealizedGains: 30000,
  realizedGains: 15000,
  dividendIncome: 5000,
  totalFees: 2000,
  totalTax: 3000,
  roi: 10.5,
  transactions: [
    {
      date: '2024-03-15',
      type: 'Buy',
      description: 'Stock Purchase',
      amount: -10000,
      balance: 50000,
      fees: 100,
      tax: 0
    }
  ],
  monthlyPnL: [
    {
      month: 'March 2024',
      realized: 5000,
      unrealized: 10000,
      dividends: 1000,
      fees: 500,
      tax: 750
    }
  ],
  taxMetrics: [
    { name: 'Capital Gains Tax', amount: 2000, rate: 15 }
  ],
  financialRatios: [
    { name: 'Portfolio Turnover', value: 0.4, description: 'Trading activity relative to portfolio size' }
  ]
}

// TODO: Replace with real API data fetching

export default function PortfolioPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedStock, setSelectedStock] = useState<any>(null)
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy')
  const { stocks } = useStore()
  const { user } = useAuth()
  
  const handleTradeClick = (symbol: string) => {
    const stock = stocks.find(s => s.symbol === symbol)
    if (stock) {
      setSelectedStock(stock)
      setTradeType('buy')
    }
  }
  
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold mb-4">Portfolio Access</h2>
        <p className="text-muted-foreground mb-6">Please sign in to view your portfolio</p>
        <Button>Sign In</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-4 md:p-6 portfolio-page portfolio-container">
      <div className="mb-4 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Investment Portfolio</h1>
      </div>
      
      <div className="space-y-8">
        {/* Main Portfolio Component */}
        <Portfolio />
        
        <Tabs defaultValue="details" className="w-full">
          <div className="overflow-x-auto pb-2 mb-2 -mx-4 px-4">
            <TabsList className="inline-flex w-auto min-w-full md:grid md:grid-cols-4 mb-2 md:mb-6">
              <TabsTrigger value="details" className="whitespace-nowrap px-3 md:px-4">Portfolio Details</TabsTrigger>
              <TabsTrigger value="comparison" className="whitespace-nowrap px-3 md:px-4">Benchmark Comparison</TabsTrigger>
              <TabsTrigger value="analytics" className="whitespace-nowrap px-3 md:px-4">Analytics</TabsTrigger>
              <TabsTrigger value="accounting" className="whitespace-nowrap px-3 md:px-4">Accounting</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="details">
            <PortfolioDetails onTradeClick={handleTradeClick} />
          </TabsContent>
          
          <TabsContent value="comparison">
            <PortfolioComparison />
          </TabsContent>
          
          <TabsContent value="analytics">
            <AssetAnalytics portfolioData={portfolioData} />
          </TabsContent>
          
          <TabsContent value="accounting">
            <AccountingSummary accountingData={accountingData} />
          </TabsContent>


        </Tabs>
      </div>
      
      {/* Trade Modal */}
      {selectedStock && (
        <TradeModal 
          stock={selectedStock}
          type={tradeType}
          onClose={() => setSelectedStock(null)}
        />
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Asset</DialogTitle>
          </DialogHeader>
          {/* Add new asset form */}
        </DialogContent>
      </Dialog>
    </div>
  )
}
