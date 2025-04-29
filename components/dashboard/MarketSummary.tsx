'use client'

import { Card } from '@/components/ui/card'
import { marketData } from '@/lib/data/markets'
import { ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react'

export function MarketSummary() {
  const stocks = marketData
    .find(group => group.type === 'Stocks')
    ?.regions.flatMap(region => 
      region.exchanges.flatMap(exchange => exchange.instruments)
    ) || []

  const totalMarketCap = stocks.reduce((sum, stock) => {
    const cap = parseFloat(stock.marketCap?.replace(/[TB]/g, '')) * 
      (stock.marketCap?.includes('T') ? 1000000000000 : 1000000000)
    return sum + cap
  }, 0)

  const totalVolume = stocks.reduce((sum, stock) => sum + (stock.volume || 0), 0)
  
  const averageChange = stocks.reduce((sum, stock) => sum + stock.change, 0) / stocks.length

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Market Summary</h2>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Total Market Cap</p>
          <p className="text-2xl font-bold">
            TZS {(totalMarketCap / 1000000000000).toFixed(2)}T
          </p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Trading Volume</p>
          <p className="text-2xl font-bold">
            {totalVolume.toLocaleString()}
          </p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Market Change</p>
          <div className={`text-2xl font-bold flex items-center gap-1 
            ${averageChange >= 0 ? 'text-green-600' : 'text-red-600'}`}
          >
            {averageChange >= 0 ? (
              <ArrowUpRight className="h-5 w-5" />
            ) : (
              <ArrowDownRight className="h-5 w-5" />
            )}
            {Math.abs(averageChange).toFixed(2)}%
          </div>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Trading Hours</p>
          <p className="text-lg">10:00 - 15:30 EAT</p>
          <p className="text-sm text-muted-foreground">Monday - Friday</p>
        </div>
      </div>
    </Card>
  )
} 