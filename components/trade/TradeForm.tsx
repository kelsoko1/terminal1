'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { marketData } from '@/lib/data/markets'
import { toast } from '@/components/ui/use-toast'
import { formatCurrency } from '@/lib/utils/currency'

interface TradeFormProps {
  type: 'market' | 'limit'
  symbol: string
}

export function TradeForm({ type, symbol }: TradeFormProps) {
  const [quantity, setQuantity] = useState('')
  const [price, setPrice] = useState('')
  const [side, setSide] = useState<'buy' | 'sell'>('buy')

  const instrument = marketData
    .flatMap(group => group.regions)
    .flatMap(region => region.exchanges)
    .flatMap(exchange => exchange.instruments)
    .find(i => i.symbol === symbol)

  if (!instrument) return null

  const handleTrade = () => {
    if (!quantity) {
      toast({
        title: "Error",
        description: "Please enter a quantity",
        variant: "destructive"
      })
      return
    }

    if (type === 'limit' && !price) {
      toast({
        title: "Error",
        description: "Please enter a price",
        variant: "destructive"
      })
      return
    }

    // Here you would integrate with your trading backend
    toast({
      title: "Order Submitted",
      description: `${side.toUpperCase()} ${quantity} ${symbol} @ ${type === 'market' ? 'MARKET' : formatCurrency(parseFloat(price))}`,
    })
  }

  return (
    <div className="p-6 space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <Button 
          variant={side === 'buy' ? 'default' : 'outline'}
          onClick={() => setSide('buy')}
          className="bg-green-600 hover:bg-green-700"
        >
          Buy
        </Button>
        <Button 
          variant={side === 'sell' ? 'default' : 'outline'}
          onClick={() => setSide('sell')}
          className="bg-red-600 hover:bg-red-700"
        >
          Sell
        </Button>
      </div>

      <div className="space-y-2">
        <Label>Quantity</Label>
        <Input
          type="number"
          placeholder="Enter quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
      </div>

      {type === 'limit' && (
        <div className="space-y-2">
          <Label>Price</Label>
          <Input
            type="number"
            placeholder="Enter price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label>Estimated Total</Label>
        <div className="text-lg font-bold">
          {formatCurrency(parseFloat(quantity || '0') * (parseFloat(price || String(instrument.price))))}
        </div>
      </div>

      <Button 
        className="w-full"
        onClick={handleTrade}
      >
        {side === 'buy' ? 'Buy' : 'Sell'} {symbol}
      </Button>
    </div>
  )
} 