'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatCurrency } from '@/lib/utils/currency'

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
  const [isMobile, setIsMobile] = useState(false)
  
  // Detect mobile screen size
  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 640)
    checkIfMobile()
    window.addEventListener('resize', checkIfMobile)
    return () => window.removeEventListener('resize', checkIfMobile)
  }, [])

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
    <Card className="p-3 sm:p-4 mobile-card mobile-spacing">
      <div className="flex justify-between items-start mb-3 sm:mb-4">
        <div>
          <h3 className="text-base sm:text-lg font-semibold mobile-text-base">{symbol}</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">Current Price: {formatCurrency(currentPrice)}</p>
        </div>
        <div className="text-right">
          <p className={`text-xs sm:text-sm ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {change >= 0 ? '+' : ''}{change.toFixed(2)}%
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground">Vol: {volume.toLocaleString()}</p>
        </div>
      </div>

      <Tabs defaultValue="market" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mobile-touch-target">
          <TabsTrigger value="market" className="h-10 sm:h-auto touch-manipulation">Market</TabsTrigger>
          <TabsTrigger value="limit" className="h-10 sm:h-auto touch-manipulation">Limit</TabsTrigger>
        </TabsList>

        <TabsContent value="market" className="space-y-3 sm:space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-sm sm:text-base">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter quantity"
              className="h-11 sm:h-10 text-base mobile-touch-target"
              inputMode="decimal"
            />
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground">
            Estimated Total: {formatCurrency(parseFloat(quantity) * currentPrice || 0)}
          </div>
        </TabsContent>

        <TabsContent value="limit" className="space-y-3 sm:space-y-4">
          <div className="space-y-2">
            <Label htmlFor="limitPrice" className="text-sm sm:text-base">Limit Price</Label>
            <Input
              id="limitPrice"
              type="number"
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
              placeholder="Enter limit price"
              className="h-11 sm:h-10 text-base mobile-touch-target"
              inputMode="decimal"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="limitQuantity" className="text-sm sm:text-base">Quantity</Label>
            <Input
              id="limitQuantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter quantity"
              className="h-11 sm:h-10 text-base mobile-touch-target"
              inputMode="decimal"
            />
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground">
            Total: ${(parseFloat(quantity) * (parseFloat(limitPrice) || currentPrice) || 0).toFixed(2)}
          </div>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-2 gap-2 mt-4">
        <Button
          onClick={() => handleSubmit('buy')}
          className="bg-green-500 hover:bg-green-600 h-11 sm:h-10 text-base mobile-touch-target touch-manipulation"
        >
          Buy
        </Button>
        <Button
          onClick={() => handleSubmit('sell')}
          className="bg-red-500 hover:bg-red-600 h-11 sm:h-10 text-base mobile-touch-target touch-manipulation"
        >
          Sell
        </Button>
      </div>
    </Card>
  )
}
