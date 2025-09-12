'use client'

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Plus, X } from 'lucide-react';
import { marginTradeService } from '@/lib/services/marginTradeService';
import type { MarginPosition } from '@/lib/services/marginTradeService';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function MarginPositions() {
  const [positions, setPositions] = React.useState<MarginPosition[]>([])
  const [selectedPosition, setSelectedPosition] = React.useState<MarginPosition | null>(null)
  const [isAddMarginOpen, setIsAddMarginOpen] = React.useState(false)
  const [additionalMargin, setAdditionalMargin] = React.useState('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    // In a real app, this would be a live subscription
    const interval = setInterval(() => {
      setPositions(marginTradeService.getPositions())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleClosePosition = async (position: MarginPosition) => {
    setIsSubmitting(true)
    try {
      await marginTradeService.closePosition(position.id)
      setPositions(marginTradeService.getPositions())
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddMargin = async () => {
    if (!selectedPosition || !additionalMargin) return

    setIsSubmitting(true)
    try {
      await marginTradeService.addMargin(selectedPosition.id, parseFloat(additionalMargin))
      setPositions(marginTradeService.getPositions())
      setIsAddMarginOpen(false)
      setSelectedPosition(null)
      setAdditionalMargin('')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Card className="p-6 bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-950/50 dark:to-gray-950/50">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Open Positions
          </h2>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.location.href = '/margin-history'}
            className="border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/50"
          >
            History
          </Button>
        </div>

        <div className="space-y-4">
            {positions.map((position) => (
            <div key={position.id} className="p-4 border rounded-lg bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{position.symbol}</h3>
                  <Badge 
                    variant={position.type === 'long' ? 'default' : 'destructive'}
                    className={position.type === 'long' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'}
                  >
                    {position.type === 'long' ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    {position.type.toUpperCase()}
                  </Badge>
                  <Badge 
                    variant="outline"
                    className="border-indigo-200 text-indigo-700 dark:border-indigo-800 dark:text-indigo-300"
                  >
                    {position.leverage}x
                  </Badge>
                </div>
                <div className={`text-sm font-medium ${position.pnl >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {position.pnl >= 0 ? '+' : '-'}TZS {Math.abs(position.pnl).toLocaleString()} ({position.pnlPercentage}%)
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                  <div className="text-muted-foreground">Size</div>
                  <div className="font-medium">TZS {position.size.toLocaleString()}</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                  <div className="text-muted-foreground">Entry Price</div>
                  <div className="font-medium">TZS {position.entryPrice.toLocaleString()}</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                  <div className="text-muted-foreground">Current Price</div>
                  <div className="font-medium">TZS {position.currentPrice.toLocaleString()}</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                  <div className="text-muted-foreground">Liquidation Price</div>
                  <div className="font-medium">TZS {(position.type === 'long' ? 
                    position.entryPrice * 0.8 : 
                    position.entryPrice * 1.2).toLocaleString()}</div>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/50"
                  onClick={() => {
                    setSelectedPosition(position)
                    setIsAddMarginOpen(true)
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Margin
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="flex-1 bg-red-500 hover:bg-red-600"
                  onClick={() => handleClosePosition(position)}
                  disabled={isSubmitting}
                >
                  <X className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Closing...' : 'Close Position'}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {positions.length === 0 && (
          <div className="text-center text-muted-foreground py-8 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
            No open positions
      </div>
        )}
    </Card>

      <Dialog open={isAddMarginOpen} onOpenChange={setIsAddMarginOpen}>
        <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-950/50 dark:to-gray-950/50">
          <DialogHeader>
            <DialogTitle className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              Add Margin
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label className="text-muted-foreground">Current Position Size</Label>
              <div className="text-sm p-2 rounded-lg bg-white/50 dark:bg-white/5">
                TZS {selectedPosition?.size.toLocaleString()}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="additionalMargin">Additional Margin (TZS)</Label>
              <Input
                id="additionalMargin"
                type="number"
                value={additionalMargin}
                onChange={(e) => setAdditionalMargin(e.target.value)}
                placeholder="Enter amount"
                min="0"
                className="bg-white/50 dark:bg-white/5"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => setIsAddMarginOpen(false)}
                className="border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/50"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddMargin} 
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              >
                {isSubmitting ? 'Adding...' : 'Add Margin'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 