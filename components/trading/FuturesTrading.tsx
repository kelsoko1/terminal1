import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useFuturesContracts } from '@/contexts/FuturesContractsContext'
import { useToast } from '@/components/ui/use-toast'
import { ArrowUpRight, ArrowDownRight, Star, UserCircle } from 'lucide-react'
import { ResponsiveContainer, LineChart, Line } from 'recharts'

const FUTURES_CATEGORIES = [
  { key: 'fx', label: 'FX' },
  { key: 'agriculture', label: 'Agriculture' },
  { key: 'metals', label: 'Metals' },
  { key: 'rates', label: 'Interest Rates' },
  { key: 'crypto', label: 'Cryptocurrency' },
]

const MOCK_FUTURES = {
  fx: [
    { symbol: 'USD/TZS-JUN24', name: 'USD/TZS Futures', expiry: '2024-06-30', price: 2550 },
    { symbol: 'EUR/USD-SEP24', name: 'EUR/USD Futures', expiry: '2024-09-30', price: 1.09 },
  ],
  agriculture: [
    { symbol: 'COFFEE-DEC24', name: 'Coffee Futures', expiry: '2024-12-15', price: 3200 },
    { symbol: 'COTTON-MAR25', name: 'Cotton Futures', expiry: '2025-03-20', price: 2100 },
  ],
  metals: [
    { symbol: 'GOLD-JUN24', name: 'Gold Futures', expiry: '2024-06-30', price: 2875000 },
    { symbol: 'SILVER-SEP24', name: 'Silver Futures', expiry: '2024-09-30', price: 35000 },
  ],
  rates: [
    { symbol: 'TBILL-1Y-DEC24', name: '1Y Treasury Bill Futures', expiry: '2024-12-31', price: 98.5 },
    { symbol: 'TBOND-10Y-JUN25', name: '10Y Treasury Bond Futures', expiry: '2025-06-30', price: 102.3 },
  ],
  crypto: [
    { symbol: 'BTC-USD-SEP24', name: 'Bitcoin Futures', expiry: '2024-09-30', price: 65000 },
    { symbol: 'ETH-USD-SEP24', name: 'Ethereum Futures', expiry: '2024-09-30', price: 3200 },
  ],
}

type FuturesCategory = keyof typeof MOCK_FUTURES

type FuturesContract = {
  symbol: string
  name: string
  expiry: string
  price: number
}

// Helper: get border color (for demo, green for FX, red for others)
const categoryBorderColor = (cat: string) => {
  switch (cat) {
    case 'fx': return 'border-green-600';
    case 'agriculture': return 'border-yellow-600';
    case 'metals': return 'border-orange-600';
    case 'rates': return 'border-blue-600';
    case 'crypto': return 'border-purple-600';
    default: return 'border-gray-500';
  }
}

// Helper: get badge color
const categoryBadgeColor = (cat: string) => {
  switch (cat) {
    case 'fx': return 'bg-green-600';
    case 'agriculture': return 'bg-yellow-600';
    case 'metals': return 'bg-orange-600';
    case 'rates': return 'bg-blue-600';
    case 'crypto': return 'bg-purple-600';
    default: return 'bg-gray-500';
  }
}

// Mini chart placeholder data
const miniChartData = [
  { date: '2024-01', price: 100 },
  { date: '2024-02', price: 110 },
  { date: '2024-03', price: 105 },
  { date: '2024-04', price: 120 },
]

// FuturesCard component
const FuturesCard = ({ contract, category, onClick }: { contract: FuturesContract, category: string, onClick: () => void }) => {
  const [favorite, setFavorite] = useState(false)
  return (
    <div
      className={`relative flex flex-col sm:flex-row items-center bg-card backdrop-blur-md rounded-2xl cursor-pointer border-l-8 ${categoryBorderColor(category)} hover:scale-[1.03] hover:shadow-2xl hover:bg-card/90 transition group px-6 py-4 shadow-lg mb-6 w-full max-w-3xl`}
      onClick={onClick}
      style={{ boxShadow: '0 4px 24px 0 rgba(0,0,0,0.18)', overflow: 'visible', position: 'relative' }}
    >
      {/* Avatar/Icon & Badge */}
      <div className="flex flex-col items-center mr-6">
        <span className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 border-2 border-white/30 shadow-lg text-2xl">
          <UserCircle className="w-8 h-8 text-gray-300" />
        </span>
        <span className={`mt-3 px-2 py-1 rounded text-xs text-white ${categoryBadgeColor(category)}`}>{category.charAt(0).toUpperCase() + category.slice(1)}</span>
      </div>
      {/* Main Info */}
      <div className="flex-1 flex flex-col justify-center min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-white text-lg leading-tight truncate max-w-[260px] drop-shadow-md">
            {contract.name}
          </h3>
          <div className="flex items-center gap-2">
            {/* Favorite star */}
            <button
              className="ml-1 p-1 rounded-full hover:bg-white/20 transition"
              onClick={e => { e.stopPropagation(); setFavorite(f => !f) }}
              aria-label="Add to watchlist"
              type="button"
            >
              <Star className={`w-5 h-5 ${favorite ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`} fill={favorite ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-2 text-gray-300 text-sm font-medium flex-wrap">
          <span>{contract.symbol}</span>
          <span>• Expiry: {contract.expiry}</span>
        </div>
      </div>
      {/* Price & Mini Chart */}
      <div className="flex flex-col items-end ml-6 min-w-[90px]">
        <span className="flex items-center font-bold text-base text-green-400">
          <ArrowUpRight className="w-4 h-4 mr-1" />
          {contract.price}
        </span>
        {/* Mini chart placeholder */}
        <div className="w-24 h-8 mt-3 bg-muted/40 rounded-md flex items-center justify-center text-[11px] text-gray-400">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={miniChartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <Line type="monotone" dataKey="price" stroke="#22c55e" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export function FuturesTrading() {
  const { contracts } = useFuturesContracts()
  const [selectedCategory, setSelectedCategory] = useState<FuturesCategory>('fx')
  const [selectedContract, setSelectedContract] = useState<FuturesContract | null>(null)
  const [showSheet, setShowSheet] = useState(false)
  const [quantity, setQuantity] = useState('')
  const [action, setAction] = useState<'buy' | 'sell'>('buy')
  const [orderBook, setOrderBook] = useState<any[]>([])
  const [trades, setTrades] = useState<any[]>([])
  const { toast } = useToast()
  const user = 'demo-user'

  // Fetch order book and trades
  const fetchOrders = async () => {
    const res = await fetch('/api/futures-orders')
    const data = await res.json()
    setOrderBook(data.orderBook)
    setTrades(data.trades)
  }

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 3000)
    return () => clearInterval(interval)
  }, [])

  const openSheet = (contract: FuturesContract, action: 'buy' | 'sell') => {
    setSelectedContract(contract)
    setAction(action)
    setShowSheet(true)
    setQuantity('')
  }

  const handleTrade = async () => {
    if (!selectedContract) return
    await fetch('/api/futures-orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user,
        symbol: selectedContract.symbol,
        side: action,
        quantity: parseFloat(quantity),
        price: selectedContract.price,
        type: 'limit',
      })
    })
    toast({ title: `Order placed`, description: `${action.toUpperCase()} ${quantity} ${selectedContract.symbol}` })
    setShowSheet(false)
    setQuantity('')
    fetchOrders()
  }

  // Filter orders/trades for this user
  const userOrders = orderBook.filter(o => o.user === user)
  const userTrades = trades.filter(t => t.buyUser === user || t.sellUser === user)

  // Render futures cards in a vertical flex layout
  const renderFuturesCards = (contracts: FuturesContract[], category: string) => (
    <div className="w-full flex flex-col items-center gap-4">
      {contracts.map(contract => (
        <FuturesCard
          key={contract.symbol}
          contract={contract}
          category={category}
          onClick={() => {
            setSelectedContract(contract)
            setAction('buy')
            setShowSheet(true)
          }}
        />
      ))}
    </div>
  )

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Futures Trading (Cash Settled)</h2>
            <p className="text-muted-foreground">Trade futures contracts across FX, commodities, rates, and crypto. Click a contract to view details and trade.</p>
          </div>
        </div>
        <Tabs value={selectedCategory} onValueChange={v => setSelectedCategory(v as FuturesCategory)}>
          <TabsList className="mb-4">
            {FUTURES_CATEGORIES.map(cat => (
              <TabsTrigger key={cat.key} value={cat.key}>{cat.label}</TabsTrigger>
            ))}
          </TabsList>
          {FUTURES_CATEGORIES.map(cat => (
            <TabsContent key={cat.key} value={cat.key} className="space-y-4">
              {renderFuturesCards(contracts[cat.key as FuturesCategory], cat.key)}
            </TabsContent>
          ))}
        </Tabs>
      </Card>
      {/* Buy/Sell Sheet */}
      <Sheet open={showSheet} onOpenChange={setShowSheet}>
        <SheetContent side="right" className="max-w-xl w-full bg-card backdrop-blur-xl rounded-2xl shadow-2xl border border-border overflow-hidden animate-slide-in-right px-2 sm:px-6 py-4 flex flex-col">
          <SheetHeader>
            <SheetTitle className="text-2xl font-extrabold text-foreground drop-shadow-lg tracking-tight truncate">
              {selectedContract ? `${action === 'buy' ? 'Buy' : 'Sell'} ${selectedContract.name}` : ''}
            </SheetTitle>
            <div className="text-muted-foreground mb-2 text-base font-medium drop-shadow-sm bg-muted/10 rounded-lg px-3 py-2" style={{ backdropFilter: 'blur(1px)' }}>
              {selectedContract ? selectedContract.symbol : ''}
            </div>
          </SheetHeader>
          {selectedContract && (
            <div className="space-y-4 py-4 flex flex-col">
              {/* Mini chart placeholder */}
              <div className="w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto mb-2">
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={miniChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <Line type="monotone" dataKey="price" stroke="#22c55e" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
                <div className="text-xs text-muted-foreground text-center mt-1">Price History</div>
              </div>
              <div className="flex flex-col gap-2 text-foreground text-base font-mono">
                <span>Expiry: {selectedContract.expiry}</span>
                <span>Price: {selectedContract.price.toLocaleString()}</span>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                  placeholder="Enter quantity"
                />
                {quantity && (
                  <div className="text-sm text-foreground">
                    Total: {(parseFloat(quantity) * selectedContract.price || 0).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          )}
          <SheetFooter className="flex flex-col sm:flex-row gap-3 p-4 border-t border-border bg-card/80 backdrop-blur-xl z-10 w-full">
            <Button variant="destructive" onClick={() => { setAction('sell'); handleTrade(); }} disabled={!selectedContract || !quantity} className="flex-1 py-3 rounded-xl text-lg shadow-lg hover:scale-105 hover:brightness-110 transition-all">Sell</Button>
            <Button onClick={() => { setAction('buy'); handleTrade(); }} disabled={!selectedContract || !quantity} className="flex-1 py-3 rounded-xl text-lg shadow-lg hover:scale-105 hover:brightness-110 transition-all">Buy</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}

export default FuturesTrading 