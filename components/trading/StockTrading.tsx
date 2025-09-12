'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet'
import { ArrowUpRight, ArrowDownRight, Star, UserCircle, Search } from 'lucide-react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip } from 'recharts'

// Mock data for stocks
const mockStocks = [
  {
    id: 's1',
    name: 'CRDB Bank',
    ticker: 'CRDB',
    sector: 'Banking',
    price: 420.5,
    change: 1.2,
    marketCap: '2.1T TZS',
    description: 'Leading Tanzanian bank with a strong retail presence.',
    priceHistory: [
      { date: '2023-01', price: 390 },
      { date: '2023-04', price: 400 },
      { date: '2023-07', price: 410 },
      { date: '2023-10', price: 420.5 },
    ]
  },
  {
    id: 's2',
    name: 'Vodacom Tanzania',
    ticker: 'VODA',
    sector: 'Telecom',
    price: 850.0,
    change: -0.8,
    marketCap: '1.5T TZS',
    description: 'Major telecom operator in Tanzania.',
    priceHistory: [
      { date: '2023-01', price: 900 },
      { date: '2023-04', price: 880 },
      { date: '2023-07', price: 860 },
      { date: '2023-10', price: 850 },
    ]
  },
  {
    id: 's3',
    name: 'Tanzania Breweries',
    ticker: 'TBL',
    sector: 'Consumer Goods',
    price: 11200,
    change: 0.5,
    marketCap: '4.3T TZS',
    description: 'Largest beverage company in Tanzania.',
    priceHistory: [
      { date: '2023-01', price: 11000 },
      { date: '2023-04', price: 11100 },
      { date: '2023-07', price: 11250 },
      { date: '2023-10', price: 11200 },
    ]
  },
  {
    id: 's4',
    name: 'NMB Bank',
    ticker: 'NMB',
    sector: 'Banking',
    price: 3400,
    change: 2.1,
    marketCap: '3.2T TZS',
    description: 'Top commercial bank in Tanzania.',
    priceHistory: [
      { date: '2023-01', price: 3200 },
      { date: '2023-04', price: 3300 },
      { date: '2023-07', price: 3350 },
      { date: '2023-10', price: 3400 },
    ]
  },
]

const sectorColors: Record<string, string> = {
  'Banking': 'bg-blue-600',
  'Telecom': 'bg-yellow-600',
  'Consumer Goods': 'bg-green-600',
  'Energy': 'bg-purple-600',
  'Industrial': 'bg-pink-600',
  'Other': 'bg-gray-500',
}

const StockCard = ({ stock, onClick }: { stock: typeof mockStocks[0], onClick: () => void }) => {
  const [favorite, setFavorite] = useState(false)
  return (
    <div
      className={`relative flex flex-col sm:flex-row items-center bg-card backdrop-blur-md rounded-2xl cursor-pointer border-l-8 ${stock.change > 0 ? 'border-green-600' : 'border-red-600'} hover:scale-[1.03] hover:shadow-2xl hover:bg-card/90 transition group px-6 py-4 shadow-lg mb-6 w-full max-w-3xl`}
      onClick={onClick}
      style={{ boxShadow: '0 4px 24px 0 rgba(0,0,0,0.18)', overflow: 'visible', position: 'relative' }}
    >
      {/* Company Avatar/Icon */}
      <div className="flex flex-col items-center mr-6">
        <span className="w-12 h-12 flex items-center justify-center rounded-full bg-background border-2 border-border text-2xl">
          <UserCircle className="w-8 h-8 text-foreground" />
        </span>
        <span className={`mt-3 px-2 py-1 rounded text-xs text-foreground ${sectorColors[stock.sector] || sectorColors['Other']}`}>{stock.sector}</span>
      </div>
      {/* Main Info */}
      <div className="flex-1 flex flex-col justify-center min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-foreground text-lg leading-tight truncate max-w-[260px] drop-shadow-md">
            {stock.name}
          </h3>
          <div className="flex items-center gap-2">
            {/* Favorite star */}
            <button
              className="ml-1 p-1 rounded-full hover:bg-background/20 transition"
              onClick={e => { e.stopPropagation(); setFavorite(f => !f) }}
              aria-label="Add to watchlist"
              type="button"
            >
              <Star className={`w-5 h-5 ${favorite ? 'text-yellow-400 fill-yellow-400' : 'text-foreground'}`} fill={favorite ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-2 text-muted-foreground text-sm font-medium flex-wrap">
          <span>{stock.ticker}</span>
          <span>• {stock.marketCap}</span>
        </div>
        {/* Short description */}
        {stock.description && <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{stock.description}</div>}
      </div>
      {/* Price/Performance & Mini Chart */}
      <div className="flex flex-col items-end ml-6 min-w-[90px]">
        <span className={`flex items-center font-bold text-base ${stock.change > 0 ? 'text-green-400' : stock.change < 0 ? 'text-red-400' : 'text-foreground'}`}>
          {stock.change > 0 ? <ArrowUpRight className="w-4 h-4 mr-1" /> : stock.change < 0 ? <ArrowDownRight className="w-4 h-4 mr-1" /> : null}
          {stock.change}%
        </span>
        {/* Mini chart */}
        <div className="w-24 h-8 mt-3 bg-muted/40 rounded-md flex items-center justify-center text-[11px] text-foreground">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stock.priceHistory} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <Line type="monotone" dataKey="price" stroke="#22c55e" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export function StockTrading() {
  const [selectedStock, setSelectedStock] = useState<typeof mockStocks[0] | null>(null)
  const [showSheet, setShowSheet] = useState(false)
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy')
  const [quantity, setQuantity] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [sectorFilter, setSectorFilter] = useState('All')

  // Filter stocks by search and sector
  const filteredStocks = mockStocks.filter(stock => {
    const matchesSearch =
      stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.ticker.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSector = sectorFilter === 'All' || stock.sector === sectorFilter
    return matchesSearch && matchesSector
  })

  // Helper to render stock cards list
  const renderStockCards = (stocks: typeof mockStocks) => (
    <div className="w-full flex flex-col items-center gap-4">
      {stocks.map(stock => (
        <StockCard key={stock.id} stock={stock} onClick={() => {
          setSelectedStock(stock)
          setShowSheet(true)
        }} />
      ))}
    </div>
  )

  // Handle trade submission
  const handleTrade = () => {
    if (!selectedStock || !quantity) return
    setShowSheet(false)
    setQuantity('')
  }

  // Unique sector list for filter
  const sectorList = ['All', ...Array.from(new Set(mockStocks.map(s => s.sector)))]

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Shares Trading</h2>
            <p className="text-muted-foreground">Trade shares of top Tanzanian companies. Search, filter, and invest easily.</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search shares..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <select
              className="ml-2 rounded border px-2 py-1 bg-background text-foreground"
              value={sectorFilter}
              onChange={e => setSectorFilter(e.target.value)}
            >
              {sectorList.map(sector => (
                <option key={sector} value={sector}>{sector}</option>
              ))}
            </select>
          </div>
        </div>
        {renderStockCards(filteredStocks)}
      </Card>
      {/* Stock Details Sheet */}
      <Sheet open={showSheet} onOpenChange={setShowSheet}>
        <SheetContent side="right" className="max-w-xl w-full bg-card/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-border overflow-hidden animate-slide-in-right px-2 sm:px-6 py-4 flex flex-col">
          <SheetHeader>
            <SheetTitle className="text-2xl font-extrabold text-foreground drop-shadow-lg tracking-tight truncate">
              {selectedStock ? selectedStock.name : ''}
            </SheetTitle>
            <SheetDescription className="text-muted-foreground mb-2 text-base font-medium drop-shadow-sm bg-background/10 rounded-lg px-3 py-2" style={{ backdropFilter: 'blur(1px)' }}>
              {selectedStock ? selectedStock.ticker : ''}
            </SheetDescription>
          </SheetHeader>
          {selectedStock && (
            <div className="space-y-4 py-4 flex flex-col">
              {/* Responsive Chart */}
              <div className="w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto mb-2">
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={selectedStock.priceHistory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <XAxis dataKey="date" tick={{ fill: '#aaa', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis domain={['auto', 'auto']} tick={{ fill: '#aaa', fontSize: 10 }} axisLine={false} tickLine={false} width={30} />
                    <RechartsTooltip contentStyle={{ background: 'hsl(var(--background))', border: 'none', color: 'hsl(var(--foreground))', fontSize: 12 }} />
                    <Line type="monotone" dataKey="price" stroke="#22c55e" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
                <div className="text-xs text-muted-foreground text-center mt-1">Price History</div>
              </div>
              <div className="flex flex-col gap-2 text-foreground text-base font-mono">
                <span>Sector: {selectedStock.sector}</span>
                <span>Market Cap: {selectedStock.marketCap}</span>
                <span>Price: {selectedStock.price.toLocaleString()} TZS</span>
                <span>Change: <span className={selectedStock.change >= 0 ? 'text-green-400' : 'text-red-400'}>{selectedStock.change}%</span></span>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min={1}
                  step={1}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
                {quantity && (
                  <div className="text-sm text-foreground">
                    Total: {(parseFloat(quantity) * selectedStock.price).toLocaleString()} TZS
                  </div>
                )}
              </div>
            </div>
          )}
          <SheetFooter className="flex flex-col sm:flex-row gap-3 p-4 border-t border-border bg-card/80 backdrop-blur-xl z-10 w-full">
            <Button variant="destructive" onClick={() => setTradeType('sell')} className="flex-1 py-3 rounded-xl text-lg shadow-lg hover:scale-105 hover:brightness-110 transition-all">Sell</Button>
            <Button onClick={handleTrade} disabled={!selectedStock || !quantity || parseFloat(quantity) < 1} className="flex-1 py-3 rounded-xl text-lg shadow-lg hover:scale-105 hover:brightness-110 transition-all">Buy</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
} 