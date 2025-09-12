'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { marketData } from '@/lib/data/markets'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface MarketOverviewProps {
  onSymbolSelect: (symbol: string) => void
}

export function MarketOverview({ onSymbolSelect }: MarketOverviewProps) {
  const stocks = marketData
    .find(group => group.type === 'stocks')
    ?.regions.flatMap(region => 
      region.exchanges.flatMap(exchange => exchange.instruments)
    ) || []

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">DSE Market Overview</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b">
              <th className="pb-2">Symbol</th>
              <th className="pb-2">Name</th>
              <th className="pb-2 text-right">Price</th>
              <th className="pb-2 text-right">Change</th>
              <th className="pb-2 text-right">Volume</th>
              <th className="pb-2 text-right">Market Cap</th>
              <th className="pb-2"></th>
            </tr>
          </thead>
          <tbody>
            {stocks.slice(0, 5).map((stock) => (
              <tr key={stock.symbol} className="border-b">
                <td className="py-2">
                  <button 
                    className="hover:underline"
                    onClick={() => onSymbolSelect?.(stock.symbol)}
                  >
                    {stock.symbol}
                  </button>
                </td>
                <td className="py-2 text-muted-foreground">{stock.name}</td>
                <td className="py-2 text-right">TZS {stock.price}</td>
                <td className={`py-2 text-right ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stock.change >= 0 ? '+' : ''}{stock.change}%
                </td>
                <td className="py-2 text-right">{stock.volume?.toLocaleString()}</td>
                <td className="py-2 text-right">{stock.marketCap}</td>
                <td className="py-2 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSymbolSelect?.(stock.symbol)}
                  >
                    Trade
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
} 