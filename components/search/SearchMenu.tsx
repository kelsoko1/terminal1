'use client'

import { useState, useEffect } from 'react'
import { Search, Star, TrendingUp, History, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useRouter } from 'next/navigation'
import { useDebounce } from '@/lib/hooks/useDebounce'
import { marketData } from '@/lib/data/markets'
import { Instrument } from '@/lib/types/market'

interface SearchMenuProps {
  isOpen: boolean
  onClose: () => void
}

export function SearchMenu({ isOpen, onClose }: SearchMenuProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const router = useRouter()
  const [searchResults, setSearchResults] = useState<Instrument[]>([])
  const debouncedSearch = useDebounce(searchQuery, 300)

  const watchlist: Instrument[] = [
    { 
      symbol: 'CRDB',
      name: 'CRDB Bank Plc',
      type: 'stocks',
      exchange: 'DSE',
      price: 410,
      change: 2.5,
      volume: 15240,
      marketCap: '1.07T',
      sector: 'Banking'
    },
    { 
      symbol: 'NMB',
      name: 'NMB Bank Plc',
      type: 'stocks',
      exchange: 'DSE',
      price: 3840,
      change: 1.2,
      volume: 8750,
      marketCap: '1.92T',
      sector: 'Banking'
    },
    { 
      symbol: 'TBL',
      name: 'Tanzania Breweries Ltd',
      type: 'stocks',
      exchange: 'DSE',
      price: 10900,
      change: -0.3,
      volume: 3200,
      marketCap: '3.21T',
      sector: 'Consumer Goods'
    }
  ]

  const trending: Instrument[] = [
    { 
      symbol: 'TPCC',
      name: 'Tanzania Portland Cement Company Ltd',
      type: 'stocks',
      exchange: 'DSE',
      price: 4300,
      change: 0.8,
      volume: 5100,
      marketCap: '77.4B',
      sector: 'Manufacturing'
    },
    { 
      symbol: 'TOL',
      name: 'TOL Gases Limited',
      type: 'stocks',
      exchange: 'DSE',
      price: 500,
      change: -1.2,
      volume: 2300,
      marketCap: '45.8B',
      sector: 'Manufacturing'
    },
    { 
      symbol: 'SWIS',
      name: 'Swissport Tanzania Plc',
      type: 'stocks',
      exchange: 'DSE',
      price: 1280,
      change: 0.4,
      volume: 1800,
      marketCap: '46.1B',
      sector: 'Commercial Services'
    }
  ]

  const handleInstrumentClick = (symbol: string) => {
    // Save to recent searches
    setRecentSearches(prev => {
      const updated = [symbol, ...prev.filter(s => s !== symbol)].slice(0, 5)
      localStorage.setItem('recentSearches', JSON.stringify(updated))
      return updated
    })

    // Navigate to markets page with selected instrument
    router.push(`/markets?symbol=${symbol}`)
    onClose()
  }

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase()
      const results: Instrument[] = []
      
      marketData.forEach(group => {
        group.regions.forEach(region => {
          region.exchanges.forEach(exchange => {
            const matches = exchange.instruments.filter(
              i => i.symbol.toLowerCase().includes(searchLower) || 
                   i.name.toLowerCase().includes(searchLower)
            )
            results.push(...matches)
          })
        })
      })
      
      setSearchResults(results)
    } else {
      setSearchResults([])
    }
  }, [debouncedSearch])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Search Markets</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search markets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
        </div>

        <ScrollArea className="h-[400px]">
          {searchResults.length > 0 && (
            <div className="mb-6">
              <div className="grid gap-2">
                {searchResults.map((instrument) => (
                  <Button
                    key={instrument.symbol}
                    variant="ghost"
                    className="w-full justify-between"
                    onClick={() => handleInstrumentClick(instrument.symbol)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{instrument.symbol}</span>
                      <span className="text-sm text-muted-foreground">{instrument.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>TZS {instrument.price}</span>
                      <span className={instrument.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {instrument.change >= 0 ? '+' : ''}{instrument.change}%
                      </span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Show Recent, Watchlist, and Trending only when not searching */}
          {!searchQuery && (
            <>
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <History className="w-4 h-4 text-muted-foreground" />
                    <h3 className="text-sm font-medium">Recent Searches</h3>
                  </div>
                  <div className="grid gap-2">
                    {recentSearches.map((symbol) => (
                      <Button
                        key={symbol}
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => handleInstrumentClick(symbol)}
                      >
                        {symbol}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Watchlist */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-4 h-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium">Watchlist</h3>
                </div>
                <div className="grid gap-2">
                  {watchlist.map((instrument) => (
                    <Button
                      key={instrument.symbol}
                      variant="ghost"
                      className="w-full justify-between"
                      onClick={() => handleInstrumentClick(instrument.symbol)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{instrument.symbol}</span>
                        <span className="text-sm text-muted-foreground">{instrument.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>TZS {instrument.price}</span>
                        <span className={instrument.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {instrument.change >= 0 ? '+' : ''}{instrument.change}%
                        </span>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Trending */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium">Trending</h3>
                </div>
                <div className="grid gap-2">
                  {trending.map((instrument) => (
                    <Button
                      key={instrument.symbol}
                      variant="ghost"
                      className="w-full justify-between"
                      onClick={() => handleInstrumentClick(instrument.symbol)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{instrument.symbol}</span>
                        <span className="text-sm text-muted-foreground">{instrument.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>TZS {instrument.price}</span>
                        <span className={instrument.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {instrument.change >= 0 ? '+' : ''}{instrument.change}%
                        </span>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </>
          )}
        </ScrollArea>
      </div>
    </div>
  )
} 