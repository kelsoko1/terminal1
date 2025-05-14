'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Search, TrendingUp, Star, Clock, ArrowUpRight, ArrowDownRight, ChevronRight } from 'lucide-react'
import { marketData } from '@/lib/data/markets'
import { Instrument } from '@/lib/types/market'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'

export default function MarketsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Instrument[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const selectedSymbol = searchParams?.get('symbol') || ''

  // Popular lists that users might be interested in
  const popularLists = [
    { name: 'Top Gainers', icon: <ArrowUpRight className="h-5 w-5 text-green-600" /> },
    { name: 'Top Losers', icon: <ArrowDownRight className="h-5 w-5 text-red-600" /> },
    { name: 'Most Active', icon: <TrendingUp className="h-5 w-5 text-blue-600" /> },
    { name: 'Banking Sector', icon: <span className="text-lg">🏦</span> },
    { name: 'Manufacturing', icon: <span className="text-lg">🏭</span> },
    { name: 'Consumer Goods', icon: <span className="text-lg">🛒</span> }
  ]

  // Categories for different types of investments
  const categories = [
    { name: 'Stocks', description: 'Company shares traded on exchanges', icon: '📈' },
    { name: 'Bonds', description: 'Fixed income securities', icon: '📋' },
    { name: 'REITs', description: 'Real Estate Investment Trusts', icon: '🏢' },
    { name: 'ETFs', description: 'Exchange Traded Funds', icon: '📊' },
    { name: 'Mutual Funds', description: 'Professionally managed investment funds', icon: '💼' }
  ]

  // Get trending stocks (using the highest volume stocks as a proxy for trending)
  const trendingStocks = marketData
    .find(group => group.type === 'stocks')
    ?.regions.flatMap(region => 
      region.exchanges.flatMap(exchange => exchange.instruments)
    )
    .filter(instrument => instrument.type === 'stocks')
    .sort((a, b) => (b as any).volume - (a as any).volume)
    .slice(0, 5) || []

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    
    if (query.trim()) {
      const results: Instrument[] = []
      const queryLower = query.toLowerCase()
      
      marketData.forEach(group => {
        group.regions.forEach(region => {
          region.exchanges.forEach(exchange => {
            const matches = exchange.instruments.filter(
              i => i.symbol.toLowerCase().includes(queryLower) || 
                   i.name.toLowerCase().includes(queryLower)
            )
            results.push(...matches)
          })
        })
      })
      
      setSearchResults(results)
    } else {
      setSearchResults([])
    }
  }

  const handleInstrumentClick = (symbol: string) => {
    // Save to recent searches
    setRecentSearches(prev => {
      const updated = [symbol, ...prev.filter(s => s !== symbol)].slice(0, 5)
      localStorage.setItem('recentSearches', JSON.stringify(updated))
      return updated
    })

    // Navigate to detail view
    router.push(`/markets?symbol=${symbol}`)
  }

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  return (
    <div className="container py-6 max-w-5xl">
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search companies, symbols, or keywords"
            className="pl-10 py-6 text-lg"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
      </div>

      {searchResults.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-1">
                {searchResults.map((instrument) => (
                  <Button
                    key={instrument.symbol}
                    variant="ghost"
                    className="w-full justify-between p-3 h-auto"
                    onClick={() => handleInstrumentClick(instrument.symbol)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-muted rounded-full w-10 h-10 flex items-center justify-center">
                        {instrument.symbol.charAt(0)}
                      </div>
                      <div className="text-left">
                        <div className="font-medium">{instrument.symbol}</div>
                        <div className="text-sm text-muted-foreground">{instrument.name}</div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div>TZS {instrument.price.toLocaleString()}</div>
                      <div className={instrument.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {instrument.change >= 0 ? '+' : ''}{instrument.change}%
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Searches
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  {recentSearches.map(symbol => {
                    const instrument = marketData
                      .flatMap(group => group.regions)
                      .flatMap(region => region.exchanges)
                      .flatMap(exchange => exchange.instruments)
                      .find(i => i.symbol === symbol)
                    
                    if (!instrument) return null
                    
                    return (
                      <Button
                        key={symbol}
                        variant="ghost"
                        className="w-full justify-between p-3 h-auto"
                        onClick={() => handleInstrumentClick(symbol)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-muted rounded-full w-10 h-10 flex items-center justify-center">
                            {symbol.charAt(0)}
                          </div>
                          <div className="text-left">
                            <div className="font-medium">{symbol}</div>
                            <div className="text-sm text-muted-foreground">{instrument.name}</div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <div>TZS {instrument.price.toLocaleString()}</div>
                          <div className={instrument.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {instrument.change >= 0 ? '+' : ''}{instrument.change}%
                          </div>
                        </div>
                      </Button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Popular Lists */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Popular Lists
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {popularLists.map((list, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="justify-between h-auto p-4"
                  >
                    <div className="flex items-center gap-2">
                      {list.icon}
                      <span>{list.name}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Categories */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {categories.map((category, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="justify-between h-auto p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{category.icon}</div>
                      <div className="text-left">
                        <div className="font-medium">{category.name}</div>
                        <div className="text-sm text-muted-foreground">{category.description}</div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Trending Stocks */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Trending Stocks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {trendingStocks.map((stock) => (
                  <Button
                    key={stock.symbol}
                    variant="ghost"
                    className="w-full justify-between p-3 h-auto"
                    onClick={() => handleInstrumentClick(stock.symbol)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-muted rounded-full w-10 h-10 flex items-center justify-center">
                        {stock.symbol.charAt(0)}
                      </div>
                      <div className="text-left">
                        <div className="font-medium">{stock.symbol}</div>
                        <div className="text-sm text-muted-foreground">{stock.name}</div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div>TZS {stock.price.toLocaleString()}</div>
                      <div className={stock.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {stock.change >= 0 ? '+' : ''}{stock.change}%
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}