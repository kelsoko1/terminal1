'use client'

import { Card } from '@/components/ui/card'

interface RecentTradesProps {
  symbol: string
}

export function RecentTrades({ symbol }: RecentTradesProps) {
  // Mock recent trades data
  const trades = [
    { time: '14:30:25', price: 410, quantity: 500, side: 'buy' },
    { time: '14:29:15', price: 409, quantity: 1000, side: 'sell' },
    { time: '14:28:45', price: 410, quantity: 750, side: 'buy' },
    { time: '14:27:30', price: 411, quantity: 300, side: 'sell' },
  ]

  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-4">Recent Trades</h3>
      <div className="space-y-2">
        {trades.map((trade, i) => (
          <div key={i} className="grid grid-cols-4 text-sm">
            <div className="text-muted-foreground">{trade.time}</div>
            <div className={trade.side === 'buy' ? 'text-green-600' : 'text-red-600'}>
              {trade.price.toLocaleString()}
            </div>
            <div>{trade.quantity.toLocaleString()}</div>
            <div className="capitalize">{trade.side}</div>
          </div>
        ))}
      </div>
    </Card>
  )
} 