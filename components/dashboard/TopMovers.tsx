'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { marketData } from '@/lib/data/markets'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function TopMovers() {
  const router = useRouter()
  const stocks = marketData
    .find(group => group.type === 'Stocks')
    ?.regions.flatMap(region => 
      region.exchanges.flatMap(exchange => exchange.instruments)
    ) || []

  const gainers = [...stocks]
    .sort((a, b) => b.change - a.change)
    .slice(0, 3)

  const losers = [...stocks]
    .sort((a, b) => a.change - b.change)
    .slice(0, 3)

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Top Gainers
          </h3>
          <div className="space-y-3">
            {gainers.map((stock) => (
              <Button
                key={stock.symbol}
                variant="ghost"
                className="w-full justify-between"
                onClick={() => router.push(`/trade?symbol=${stock.symbol}`)}
              >
                <div>
                  <div className="font-medium">{stock.symbol}</div>
                  <div className="text-sm text-muted-foreground">{stock.name}</div>
                </div>
                <div className="text-right">
                  <div>TZS {stock.price.toLocaleString()}</div>
                  <div className="text-green-600">+{stock.change}%</div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <TrendingDown className="h-5 w-5 text-red-600" />
            Top Losers
          </h3>
          <div className="space-y-3">
            {losers.map((stock) => (
              <Button
                key={stock.symbol}
                variant="ghost"
                className="w-full justify-between"
                onClick={() => router.push(`/trade?symbol=${stock.symbol}`)}
              >
                <div>
                  <div className="font-medium">{stock.symbol}</div>
                  <div className="text-sm text-muted-foreground">{stock.name}</div>
                </div>
                <div className="text-right">
                  <div>TZS {stock.price.toLocaleString()}</div>
                  <div className="text-red-600">{stock.change}%</div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
} 