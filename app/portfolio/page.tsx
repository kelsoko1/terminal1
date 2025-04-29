'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import PortfolioList from '@/components/portfolio/PortfolioList'
import PortfolioOverview from '@/components/portfolio/PortfolioOverview'
import { AssetAnalytics } from '@/components/portfolio/AssetAnalytics'
import { AccountingSummary } from '@/components/portfolio/AccountingSummary'
import { TradingChallenges } from '@/components/social/TradingChallenges'
import { CompetitionLeaderboard } from '@/components/social/CompetitionLeaderboard'

// Mock data for new components
const mockPortfolioData = {
  assetAllocation: [
    { name: 'DSE Stocks', value: 40 },
    { name: 'Government Bonds', value: 15 },
    { name: 'FX Positions', value: 20 },
    { name: 'Commodities', value: 15 },
    { name: 'Cash', value: 10 }
  ],
  sectorExposure: [
    { name: 'Banking', value: 35 },
    { name: 'Manufacturing', value: 25 },
    { name: 'Consumer Goods', value: 20 },
    { name: 'Telecommunications', value: 15 },
    { name: 'Energy', value: 5 }
  ],
  historicalPerformance: [
    { date: '2024-01', value: 1000000, dseIndex: 2100, return: 5.2 },
    { date: '2024-02', value: 1050000, dseIndex: 2150, return: 4.8 },
    { date: '2024-03', value: 1120000, dseIndex: 2200, return: 6.5 }
  ],
  riskMetrics: [
    { name: 'Volatility', value: 12.5, description: 'Portfolio price volatility over the last 30 days' },
    { name: 'Sharpe Ratio', value: 1.8, description: 'Risk-adjusted return relative to risk-free rate' },
    { name: 'Beta', value: 0.85, description: 'Portfolio sensitivity to DSE market movements' },
    { name: 'Alpha', value: 2.3, description: 'Excess return compared to DSE benchmark' },
    { name: 'Max Drawdown', value: -8.5, description: 'Largest peak-to-trough decline' },
    { name: 'Information Ratio', value: 1.2, description: 'Risk-adjusted excess returns vs benchmark' }
  ],
  dseMetrics: [
    { name: 'DSE All Share Index (DSEI)', value: 2200, change: 2.3 },
    { name: 'Market Capitalization', value: 15.8, change: 1.5 },
    { name: 'Average Daily Volume', value: 850000, change: 5.2 },
    { name: 'Market P/E Ratio', value: 12.5, change: -0.8 },
    { name: 'Market Dividend Yield', value: 4.2, change: 0.3 }
  ],
  performanceMetrics: [
    { name: 'DSE Stocks', value: 15.8, benchmark: 12.5 },
    { name: 'Government Bonds', value: 8.5, benchmark: 8.2 },
    { name: 'FX Portfolio', value: 9.2, benchmark: 7.5 },
    { name: 'Commodities', value: 11.3, benchmark: 10.2 },
    { name: 'Overall Portfolio', value: 12.8, benchmark: 10.5 }
  ]
}

const mockAccountingData = {
  cashBalance: 150000,
  totalAssets: 1120000,
  unrealizedGains: 85000,
  realizedGains: 35000,
  dividendIncome: 12000,
  totalFees: 7500,
  totalTax: 12000,
  roi: 12.8,
  transactions: [
    {
      date: '2024-03-15',
      type: 'Buy',
      description: 'CRDB Bank Shares',
      amount: -40000,
      balance: 150000,
      fees: 200,
      tax: 0
    },
    {
      date: '2024-03-14',
      type: 'Dividend',
      description: 'TBL Dividend Payment',
      amount: 5000,
      balance: 190000,
      fees: 0,
      tax: 750
    },
    {
      date: '2024-03-13',
      type: 'Sell',
      description: 'NMB Bank Shares',
      amount: 35000,
      balance: 185000,
      fees: 175,
      tax: 5250
    },
    {
      date: '2024-03-12',
      type: 'FX Trade',
      description: 'USD/TZS Exchange',
      amount: 25000,
      balance: 150000,
      fees: 125,
      tax: 0
    },
    {
      date: '2024-03-10',
      type: 'Buy',
      description: 'Gold Commodity',
      amount: -30000,
      balance: 125000,
      fees: 150,
      tax: 0
    }
  ],
  monthlyPnL: [
    {
      month: 'January 2024',
      realized: 25000,
      unrealized: 45000,
      dividends: 8000,
      fees: 2000,
      tax: 4950
    },
    {
      month: 'February 2024',
      realized: 35000,
      unrealized: 55000,
      dividends: 12000,
      fees: 2500,
      tax: 7050
    },
    {
      month: 'March 2024',
      realized: 35000,
      unrealized: 85000,
      dividends: 12000,
      fees: 3000,
      tax: 6000
    }
  ],
  taxMetrics: [
    { name: 'Capital Gains Tax', amount: 18000, rate: 15 },
    { name: 'Dividend Withholding Tax', amount: 4800, rate: 10 },
    { name: 'Transaction Levy', amount: 1200, rate: 0.5 }
  ],
  financialRatios: [
    { name: 'Portfolio Turnover', value: 0.45, description: 'Measures trading activity relative to portfolio size' },
    { name: 'Dividend Yield', value: 4.8, description: 'Annual dividend income as percentage of portfolio value' },
    { name: 'Cost Ratio', value: 1.2, description: 'Total costs as percentage of portfolio value' },
    { name: 'Cash Ratio', value: 15.0, description: 'Cash as percentage of total portfolio' },
    { name: 'Risk-Adjusted Return', value: 1.8, description: 'Return per unit of risk taken' },
    { name: 'DSE Correlation', value: 0.85, description: 'Correlation with DSE All Share Index' }
  ]
}

export default function PortfolioPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Portfolio Management</h1>
      
      <div className="grid gap-6">
        <div className="grid gap-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="accounting">Accounting</TabsTrigger>
              <TabsTrigger value="challenges">Challenges</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <PortfolioOverview data={mockPortfolioData} />
            </TabsContent>
            
            <TabsContent value="analytics">
              <AssetAnalytics portfolioData={mockPortfolioData} />
            </TabsContent>
            
            <TabsContent value="accounting">
              <AccountingSummary accountingData={mockAccountingData} />
            </TabsContent>

            <TabsContent value="challenges">
              <div className="grid gap-6">
                <TradingChallenges />
                <div className="mt-6">
                  <h2 className="text-xl font-semibold mb-4">Top Traders Leaderboard</h2>
                  <CompetitionLeaderboard />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

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