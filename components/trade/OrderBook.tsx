'use client'

import { Card } from '@/components/ui/card'

interface OrderBookProps {
  symbol: string
}

export function OrderBook({ symbol }: OrderBookProps) {
  // Mock order book data
  const bids = [
    { price: 410, quantity: 1000, total: 410000 },
    { price: 409, quantity: 1500, total: 613500 },
    { price: 408, quantity: 2000, total: 816000 },
  ]

  const asks = [
    { price: 411, quantity: 800, total: 328800 },
    { price: 412, quantity: 1200, total: 494400 },
    { price: 413, quantity: 1800, total: 743400 },
  ]

  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-4">Order Book</h3>
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <div className="font-medium mb-2">Price (TZS)</div>
          {bids.map((bid, i) => (
            <div key={i} className="text-green-600">
              {bid.price.toLocaleString()}
            </div>
          ))}
        </div>
        <div>
          <div className="font-medium mb-2">Quantity</div>
          {bids.map((bid, i) => (
            <div key={i}>{bid.quantity.toLocaleString()}</div>
          ))}
        </div>
        <div>
          <div className="font-medium mb-2">Total (TZS)</div>
          {bids.map((bid, i) => (
            <div key={i}>{bid.total.toLocaleString()}</div>
          ))}
        </div>
      </div>

      <div className="my-4 border-t" />

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          {asks.map((ask, i) => (
            <div key={i} className="text-red-600">
              {ask.price.toLocaleString()}
            </div>
          ))}
        </div>
        <div>
          {asks.map((ask, i) => (
            <div key={i}>{ask.quantity.toLocaleString()}</div>
          ))}
        </div>
        <div>
          {asks.map((ask, i) => (
            <div key={i}>{ask.total.toLocaleString()}</div>
          ))}
        </div>
      </div>
    </Card>
  )
} 