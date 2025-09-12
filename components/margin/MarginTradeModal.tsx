'use client'

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { marginTradeService } from '@/lib/services/marginTradeService'
import { TrendingUp, TrendingDown, DollarSign, Scale, Target, Shield } from 'lucide-react'

interface MarginTradeModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function MarginTradeModal({ isOpen, onClose }: MarginTradeModalProps) {
  const [symbol, setSymbol] = React.useState('')
  const [amount, setAmount] = React.useState('')
  const [leverage, setLeverage] = React.useState('2')
  const [type, setType] = React.useState<'long' | 'short'>('long')
  const [stopLoss, setStopLoss] = React.useState('')
  const [takeProfit, setTakeProfit] = React.useState('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!symbol || !amount || !leverage || !type) {
        toast.error('Please fill in all required fields')
        return
      }

      const success = await marginTradeService.placeTrade({
        symbol,
        type,
        amount: parseFloat(amount),
        leverage: parseFloat(leverage),
        stopLoss: stopLoss ? parseFloat(stopLoss) : undefined,
        takeProfit: takeProfit ? parseFloat(takeProfit) : undefined
      })

      if (success) {
        onClose()
        // Reset form
        setSymbol('')
        setAmount('')
        setLeverage('2')
        setType('long')
        setStopLoss('')
        setTakeProfit('')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-950/50 dark:to-gray-950/50">
        <DialogHeader>
          <DialogTitle className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Place Margin Trade
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="symbol" className="text-muted-foreground">Symbol</Label>
            <Select value={symbol} onValueChange={setSymbol}>
              <SelectTrigger className="bg-white/50 dark:bg-white/5">
                <SelectValue placeholder="Select stock" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CRDB">CRDB Bank Plc</SelectItem>
                <SelectItem value="TBL">Tanzania Breweries</SelectItem>
                <SelectItem value="NMB">NMB Bank</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="type" className="text-muted-foreground">Order Type</Label>
            <Select value={type} onValueChange={(value: 'long' | 'short') => setType(value)}>
              <SelectTrigger className={`bg-white/50 dark:bg-white/5 ${type === 'long' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="long" className="text-green-600 dark:text-green-400">
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Buy Long
                  </div>
                </SelectItem>
                <SelectItem value="short" className="text-red-600 dark:text-red-400">
                  <div className="flex items-center">
                    <TrendingDown className="h-4 w-4 mr-2" />
                    Sell Short
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="amount" className="text-muted-foreground">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Amount (TZS)
              </div>
            </Label>
            <Input 
              id="amount" 
              type="number" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)} 
              placeholder="Enter amount"
              min="0"
              className="bg-white/50 dark:bg-white/5"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="leverage" className="text-muted-foreground">
              <div className="flex items-center gap-2">
                <Scale className="h-4 w-4" />
                Leverage
              </div>
            </Label>
            <Select value={leverage} onValueChange={setLeverage}>
              <SelectTrigger className="bg-white/50 dark:bg-white/5">
                <SelectValue placeholder="Select leverage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2x</SelectItem>
                <SelectItem value="5">5x</SelectItem>
                <SelectItem value="10">10x</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="stopLoss" className="text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Stop Loss (Optional)
              </div>
            </Label>
            <Input 
              id="stopLoss" 
              type="number" 
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
              placeholder="Enter stop loss price" 
              min="0"
              className="bg-white/50 dark:bg-white/5"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="takeProfit" className="text-muted-foreground">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Take Profit (Optional)
              </div>
            </Label>
            <Input 
              id="takeProfit" 
              type="number" 
              value={takeProfit}
              onChange={(e) => setTakeProfit(e.target.value)}
              placeholder="Enter take profit price" 
              min="0"
              className="bg-white/50 dark:bg-white/5"
            />
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/50"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            >
              {isSubmitting ? 'Placing Trade...' : 'Place Trade'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 