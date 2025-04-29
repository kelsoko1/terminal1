'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface TradingWidgetProps {
  symbol: string
  currentPrice: number
  change: number
  volume: number
}

export function TradingWidget({ symbol, currentPrice, change, volume }: TradingWidgetProps) {
  const [quantity, setQuantity] = useState('')
  const [orderType, setOrderType] = useState('market')
  const [limitPrice, setLimitPrice] = useState('')

  const handleSubmit = (action: 'buy' | 'sell') => {
    // Handle order submission
    console.log('Order submitted:', {
      symbol,
      action,
      quantity,
      orderType,
      limitPrice: orderType === 'limit' ? limitPrice : undefined,
    })
  }

  return (
    <Card className="p-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">{symbol}</h3>
          <p className="text-sm text-muted-foreground">Current Price: ${currentPrice.toFixed(2)}</p>
        </div>
        <div className="text-right">
          <p className={`text-sm ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {change >= 0 ? '+' : ''}{change.toFixed(2)}%
          </p>
          <p className="text-sm text-muted-foreground">Vol: {volume.toLocaleString()}</p>
        </div>
      </div>

      <Tabs defaultValue="market" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="market">Market</TabsTrigger>
          <TabsTrigger value="limit">Limit</TabsTrigger>
        </TabsList>

        <TabsContent value="market" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter quantity"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            Estimated Total: ${(parseFloat(quantity) * currentPrice || 0).toFixed(2)}
          </div>
        </TabsContent>

        <TabsContent value="limit" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="limitPrice">Limit Price</Label>
            <Input
              id="limitPrice"
              type="number"
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
              placeholder="Enter limit price"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="limitQuantity">Quantity</Label>
            <Input
              id="limitQuantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter quantity"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            Total: ${(parseFloat(quantity) * (parseFloat(limitPrice) || currentPrice) || 0).toFixed(2)}
          </div>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-2 gap-2 mt-4">
        <Button
          onClick={() => handleSubmit('buy')}
          className="bg-green-500 hover:bg-green-600"
        >
          Buy
        </Button>
        <Button
          onClick={() => handleSubmit('sell')}
          className="bg-red-500 hover:bg-red-600"
        >
          Sell
        </Button>
      </div>
    </Card>
  )
}
