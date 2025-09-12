'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import '@/styles/portfolio-mobile.css'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3, Target } from 'lucide-react'

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
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isChartsDialogOpen, setIsChartsDialogOpen] = useState(false)
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [selectedStock, setSelectedStock] = useState<any>(null)
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy')
  const [isExporting, setIsExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState('csv')
  const [isAddingInvestment, setIsAddingInvestment] = useState(false)
  const { stocks } = useStore()
  const { user } = useAuth()
  const [holdings, setHoldings] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Futures orders/trades state
  const [futuresOrderBook, setFuturesOrderBook] = useState<any[]>([])
  const [futuresTrades, setFuturesTrades] = useState<any[]>([])
  const futuresUser = 'demo-user'
  
  const handleTradeClick = (symbol: string) => {
    const stock = stocks.find(s => s.symbol === symbol)
    if (stock) {
      setSelectedStock(stock)
      setTradeType('buy')
    }
  }

  const handleAddInvestment = () => {
    try {
      setIsAddingInvestment(true)
      router.push('/markets')
    } catch (error) {
      console.error('Navigation error:', error)
      setIsAddingInvestment(false)
    }
  }

  const handleViewCharts = () => {
    setIsChartsDialogOpen(true)
  }

  const handleExport = () => {
    setIsExportDialogOpen(true)
  }

  const handleExportConfirm = async () => {
    setIsExporting(true)
    try {
      // Check if browser supports downloads
      if (!window.document || !window.URL) {
        throw new Error('Download not supported in this environment')
      }

      // Validate holdings data
      if (!holdings || holdings.length === 0) {
        throw new Error('No holdings data to export')
      }

      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Generate export data with safe fallbacks
      const exportData = holdings.map(h => ({
        Symbol: h.symbol || 'N/A',
        Name: h.name || 'Unknown',
        Quantity: h.quantity || 0,
        'Average Price': h.averagePrice || 0,
        'Current Price': h.currentPrice || 0,
        'Total Value': h.value || 0,
        'Gain/Loss': h.gainLoss || 0,
        'Percentage': h.gainLoss && h.value ? ((h.gainLoss / (h.value - h.gainLoss)) * 100).toFixed(2) + '%' : '0.00%'
      }))

      if (exportFormat === 'csv') {
        downloadCSV(exportData, 'portfolio_holdings.csv')
      } else {
        downloadJSON(exportData, 'portfolio_holdings.json')
      }
      
      setIsExportDialogOpen(false)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const downloadCSV = (data: any[], filename: string) => {
    try {
      if (!data || data.length === 0) {
        throw new Error('No data to export')
      }

      const headers = Object.keys(data[0] || {})
      const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => {
          const value = row[header]
          // Escape commas and quotes in CSV
          return typeof value === 'string' && (value.includes(',') || value.includes('"')) 
            ? `"${value.replace(/"/g, '""')}"` 
            : value
        }).join(','))
      ].join('\n')
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('CSV download failed:', error)
      throw error
    }
  }

  const downloadJSON = (data: any[], filename: string) => {
    try {
      if (!data || data.length === 0) {
        throw new Error('No data to export')
      }

      const jsonContent = JSON.stringify(data, null, 2)
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('JSON download failed:', error)
      throw error
    }
  }

  const handleCancelAllOrders = async () => {
    // Implement cancel all orders functionality
    console.log('Canceling all orders...')
  }

  const handleNewOrder = () => {
    try {
      router.push('/trade')
    } catch (error) {
      console.error('Navigation error:', error)
    }
  }

  const handleExportHistory = () => {
    try {
      if (!userFuturesTrades || userFuturesTrades.length === 0) {
        alert('No trading history to export')
        return
      }

      // Export trading history
      const historyData = userFuturesTrades.map(t => ({
        Symbol: t.symbol || 'N/A',
        Side: t.buyUser === futuresUser ? 'Buy' : 'Sell',
        Quantity: t.quantity || 0,
        Price: t.price || 0,
        Counterparty: t.buyUser === futuresUser ? t.sellUser : t.buyUser,
        Time: new Date(t.timestamp).toLocaleString()
      }))
      
      downloadCSV(historyData, 'trading_history.csv')
    } catch (error) {
      console.error('Export history failed:', error)
      alert('Failed to export trading history. Please try again.')
    }
  }

  const handleStockDetails = (symbol: string) => {
    try {
      if (!symbol) {
        console.error('Invalid symbol for details view')
        return
      }
      router.push(`/markets/${symbol}`)
    } catch (error) {
      console.error('Navigation error:', error)
    }
  }
  
  useEffect(() => {
    if (!user) return
    setLoading(true)
    setError(null)
    fetch(`/api/trading/portfolio?userId=${user.id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to fetch portfolio')
        const data = await res.json()
        setHoldings(data.performance?.holdings || [])
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [user])
  
  // Fetch futures orders and trades
  useEffect(() => {
    const fetchFuturesOrders = async () => {
      const res = await fetch('/api/futures-orders')
      const data = await res.json()
      setFuturesOrderBook(data.orderBook)
      setFuturesTrades(data.trades)
    }
    fetchFuturesOrders()
    const interval = setInterval(fetchFuturesOrders, 3000)
    return () => clearInterval(interval)
  }, [])
  
  const userFuturesOrders = futuresOrderBook.filter(o => o.user === futuresUser)
  const userFuturesTrades = futuresTrades.filter(t => t.buyUser === futuresUser || t.sellUser === futuresUser)

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
      {/* Enhanced Portfolio Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Portfolio Dashboard</h1>
            <p className="text-muted-foreground">Track your investments and performance</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button 
              className="w-full sm:w-auto"
              onClick={handleAddInvestment}
              disabled={isAddingInvestment}
            >
              <Target className="mr-2 h-4 w-4" />
              {isAddingInvestment ? 'Redirecting...' : 'Add Investment'}
            </Button>
          </div>
        </div>
        
        {/* Portfolio Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-bold">TZS 2,545,690</p>
                </div>
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                <span className="text-xs text-green-600 font-medium">+12.5%</span>
                <span className="text-xs text-muted-foreground ml-1">vs last month</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Today's Change</p>
                  <p className="text-2xl font-bold text-green-600">+TZS 45,200</p>
                </div>
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <div className="flex items-center mt-2">
                <span className="text-xs text-green-600 font-medium">+1.8%</span>
                <span className="text-xs text-muted-foreground ml-1">from yesterday</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Positions</p>
                  <p className="text-2xl font-bold">{holdings.length}</p>
                </div>
                <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <PieChart className="h-4 w-4 text-purple-600" />
                </div>
              </div>
              <div className="flex items-center mt-2">
                <span className="text-xs text-muted-foreground">Across {holdings.length > 0 ? new Set(holdings.map(h => h.symbol)).size : 0} assets</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Performance</p>
                  <p className="text-2xl font-bold">+24.3%</p>
                </div>
                <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-orange-600" />
                </div>
              </div>
              <div className="flex items-center mt-2">
                <span className="text-xs text-muted-foreground">Year to date</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Portfolio Overview Section */}
      {holdings.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl md:text-2xl font-bold mb-6">Portfolio Analysis</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Asset Allocation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Asset Allocation
                </CardTitle>
                <CardDescription>Distribution of your investments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Equity Stocks</span>
                      <span className="font-medium">65%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{width: '65%'}}></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Futures Positions</span>
                      <span className="font-medium">25%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{width: '25%'}}></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Cash & Equivalents</span>
                      <span className="font-medium">10%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gray-600 h-2 rounded-full" style={{width: '10%'}}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
                <CardDescription>Key portfolio indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Return</span>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">+24.3%</div>
                      <div className="text-xs text-muted-foreground">+TZS 495,200</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Sharpe Ratio</span>
                    <div className="text-right">
                      <div className="font-semibold">1.42</div>
                      <div className="text-xs text-muted-foreground">Excellent</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Max Drawdown</span>
                    <div className="text-right">
                      <div className="font-semibold text-red-600">-8.2%</div>
                      <div className="text-xs text-muted-foreground">Low risk</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Volatility</span>
                    <div className="text-right">
                      <div className="font-semibold">12.5%</div>
                      <div className="text-xs text-muted-foreground">Moderate</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Market Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Market Insights
              </CardTitle>
              <CardDescription>Recent market performance and recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-700">Strong Performance</span>
                  </div>
                  <p className="text-sm text-green-600">Your portfolio outperformed the DSE index by 8.3% this quarter.</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <PieChart className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-700">Diversification</span>
                  </div>
                  <p className="text-sm text-blue-600">Good sector diversification across banking, manufacturing, and commodities.</p>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-orange-600" />
                    <span className="font-medium text-orange-700">Opportunity</span>
                  </div>
                  <p className="text-sm text-orange-600">Consider adding consumer goods exposure for better balance.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Holdings Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl md:text-2xl font-bold">My Holdings</h2>
          {holdings.length > 0 && (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleViewCharts}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                View Charts
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleExport}
              >
                Export
              </Button>
            </div>
          )}
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6 text-center">
              <div className="text-red-600 mb-2">⚠️</div>
              <h3 className="font-semibold text-red-800 mb-2">Error Loading Portfolio</h3>
              <p className="text-red-600 text-sm">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : holdings.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="p-12 text-center">
              <div className="mb-6 text-6xl opacity-50">📈</div>
              <h3 className="text-xl font-semibold mb-2">Your portfolio is empty</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Start your investment journey by exploring available markets and making your first trade.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild>
                  <a href="/markets">
                    <Target className="mr-2 h-4 w-4" />
                    Browse Markets
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/learn">Learn to Invest</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {holdings.map((h) => (
              <Card key={h.symbol} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{h.symbol}</CardTitle>
                      <CardDescription className="text-sm">{h.name || 'Stock Investment'}</CardDescription>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      (h.gainLoss || 0) > 0 
                        ? 'bg-green-100 text-green-700' 
                        : (h.gainLoss || 0) < 0 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {(h.gainLoss || 0) > 0 ? '+' : ''}{
                        h.gainLoss && h.value && (h.value - h.gainLoss) !== 0 
                          ? ((h.gainLoss / (h.value - h.gainLoss)) * 100).toFixed(1)
                          : '0.0'
                      }%
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Quantity</p>
                      <p className="font-semibold">{h.quantity?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Avg. Price</p>
                      <p className="font-semibold">TZS {h.averagePrice?.toLocaleString?.() ?? h.averagePrice}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Current Price</p>
                      <p className="font-semibold">TZS {h.currentPrice?.toLocaleString?.() ?? h.currentPrice}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Value</p>
                      <p className="font-semibold">TZS {h.value?.toLocaleString?.() ?? h.value}</p>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Gain/Loss</span>
                      <div className="flex items-center gap-1">
                        {(h.gainLoss || 0) > 0 ? (
                          <TrendingUp className="h-3 w-3 text-green-600" />
                        ) : (h.gainLoss || 0) < 0 ? (
                          <TrendingDown className="h-3 w-3 text-red-600" />
                        ) : null}
                        <span className={`font-bold ${
                          (h.gainLoss || 0) > 0 ? 'text-green-600' : (h.gainLoss || 0) < 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {(h.gainLoss || 0) > 0 ? '+' : ''}TZS {(h.gainLoss || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleTradeClick(h.symbol)}
                    >
                      Trade
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="flex-1"
                      onClick={() => handleStockDetails(h.symbol)}
                    >
                      Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      {/* Futures Trading Section */}
      <div className="space-y-6">
        <Tabs defaultValue="orders" className="w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl md:text-2xl font-bold">Futures Trading</h2>
            <TabsList className="grid w-[200px] grid-cols-2">
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="trades">Trades</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Open Orders</CardTitle>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleCancelAllOrders}
                      disabled={userFuturesOrders.length === 0}
                    >
                      Cancel All
                    </Button>
                    <Button 
                      size="sm"
                      onClick={handleNewOrder}
                    >
                      New Order
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {userFuturesOrders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <div className="mb-2">📋</div>
                    <p>No open orders</p>
                    <p className="text-sm">Your pending orders will appear here</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-3 font-medium">Symbol</th>
                          <th className="text-left py-2 px-3 font-medium">Side</th>
                          <th className="text-left py-2 px-3 font-medium">Quantity</th>
                          <th className="text-left py-2 px-3 font-medium">Price</th>
                          <th className="text-left py-2 px-3 font-medium">Time</th>
                          <th className="text-left py-2 px-3 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userFuturesOrders.map((o, i) => (
                          <tr key={i} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-3 font-medium">{o.symbol}</td>
                            <td className="py-3 px-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                o.side === 'Buy' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}>
                                {o.side}
                              </span>
                            </td>
                            <td className="py-3 px-3">{o.quantity?.toLocaleString()}</td>
                            <td className="py-3 px-3">TZS {o.price?.toLocaleString()}</td>
                            <td className="py-3 px-3 text-muted-foreground">
                              {new Date(o.timestamp).toLocaleTimeString()}
                            </td>
                            <td className="py-3 px-3">
                              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                Cancel
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="trades" className="space-y-4">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Recent Trades</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleExportHistory}
                    disabled={userFuturesTrades.length === 0}
                  >
                    Export History
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {userFuturesTrades.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <div className="mb-2">📊</div>
                    <p>No trades yet</p>
                    <p className="text-sm">Your trading history will appear here</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-3 font-medium">Symbol</th>
                          <th className="text-left py-2 px-3 font-medium">Side</th>
                          <th className="text-left py-2 px-3 font-medium">Quantity</th>
                          <th className="text-left py-2 px-3 font-medium">Price</th>
                          <th className="text-left py-2 px-3 font-medium">Counterparty</th>
                          <th className="text-left py-2 px-3 font-medium">Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userFuturesTrades.map((t, i) => (
                          <tr key={i} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-3 font-medium">{t.symbol}</td>
                            <td className="py-3 px-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                t.buyUser === futuresUser ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}>
                                {t.buyUser === futuresUser ? 'Buy' : 'Sell'}
                              </span>
                            </td>
                            <td className="py-3 px-3">{t.quantity?.toLocaleString()}</td>
                            <td className="py-3 px-3">TZS {t.price?.toLocaleString()}</td>
                            <td className="py-3 px-3 text-muted-foreground">
                              {t.buyUser === futuresUser ? t.sellUser : t.buyUser}
                            </td>
                            <td className="py-3 px-3 text-muted-foreground">
                              {new Date(t.timestamp).toLocaleTimeString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
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
      {/* Export Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Portfolio Data</DialogTitle>
            <DialogDescription>
              Choose the format for exporting your portfolio data.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="export-format">Export Format</Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select export format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV (Excel Compatible)</SelectItem>
                  <SelectItem value="json">JSON (Raw Data)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">
              The export will include all your holdings with current values, gains/losses, and performance metrics.
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsExportDialogOpen(false)}
              disabled={isExporting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleExportConfirm}
              disabled={isExporting}
            >
              {isExporting ? 'Exporting...' : 'Export'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Charts Dialog */}
      <Dialog open={isChartsDialogOpen} onOpenChange={setIsChartsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Portfolio Charts & Analytics</DialogTitle>
            <DialogDescription>
              Detailed charts and analysis of your portfolio performance.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Asset Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {holdings.slice(0, 5).map((h, i) => (
                      <div key={h.symbol} className="flex justify-between items-center">
                        <span className="text-sm">{h.symbol}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{
                                width: `${Math.min(
                                  holdings.length > 0 && holdings.reduce((sum, holding) => sum + (holding.value || 0), 0) > 0
                                    ? ((h.value || 0) / holdings.reduce((sum, holding) => sum + (holding.value || 0), 0)) * 100
                                    : 0,
                                  100
                                )}%`
                              }}
                            ></div>
                          </div>
                          <span className="text-xs text-muted-foreground w-12">
                            {holdings.length > 0 && holdings.reduce((sum, holding) => sum + (holding.value || 0), 0) > 0
                              ? (((h.value || 0) / holdings.reduce((sum, holding) => sum + (holding.value || 0), 0)) * 100).toFixed(1)
                              : '0.0'
                            }%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Performance Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Total Gain/Loss</span>
                      <span className={`font-medium ${
                        holdings.length > 0 && holdings.reduce((sum, h) => sum + (h.gainLoss || 0), 0) > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        TZS {holdings.length > 0 ? holdings.reduce((sum, h) => sum + (h.gainLoss || 0), 0).toLocaleString() : '0'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Best Performer</span>
                      <span className="font-medium text-green-600">
                        {holdings.length > 0 
                          ? holdings.reduce((best, h) => (h.gainLoss || 0) > (best.gainLoss || 0) ? h : best, holdings[0])?.symbol || 'N/A'
                          : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Total Positions</span>
                      <span className="font-medium">{holdings.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsChartsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
