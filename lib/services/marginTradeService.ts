import { toast } from 'sonner'

export interface MarginTradeRequest {
  symbol: string
  type: 'long' | 'short'
  amount: number
  leverage: number
  stopLoss?: number
  takeProfit?: number
}

export interface MarginPosition {
  id: string
  symbol: string
  type: 'long' | 'short'
  entryPrice: number
  currentPrice: number
  size: number
  leverage: number
  pnl: number
  pnlPercentage: number
}

export interface TradeHistory {
  id: string
  symbol: string
  type: 'long' | 'short'
  entryPrice: number
  exitPrice: number
  size: number
  leverage: number
  pnl: number
  pnlPercentage: number
  date: string
}

class MarginTradeService {
  private positions: MarginPosition[] = []
  private history: TradeHistory[] = []

  async placeTrade(request: MarginTradeRequest): Promise<boolean> {
    try {
      // In a real app, this would make an API call
      const mockPrice = this.getMockPrice(request.symbol)
      
      const position: MarginPosition = {
        id: Math.random().toString(36).substring(7),
        symbol: request.symbol,
        type: request.type,
        entryPrice: mockPrice,
        currentPrice: mockPrice,
        size: request.amount,
        leverage: request.leverage,
        pnl: 0,
        pnlPercentage: 0
      }

      this.positions.push(position)
      toast.success('Trade placed successfully')
      return true
    } catch (error) {
      toast.error('Failed to place trade')
      return false
    }
  }

  async closePosition(positionId: string): Promise<boolean> {
    try {
      const position = this.positions.find(p => p.id === positionId)
      if (!position) {
        toast.error('Position not found')
        return false
      }

      const history: TradeHistory = {
        id: Math.random().toString(36).substring(7),
        symbol: position.symbol,
        type: position.type,
        entryPrice: position.entryPrice,
        exitPrice: position.currentPrice,
        size: position.size,
        leverage: position.leverage,
        pnl: position.pnl,
        pnlPercentage: position.pnlPercentage,
        date: new Date().toISOString()
      }

      this.history.push(history)
      this.positions = this.positions.filter(p => p.id !== positionId)
      toast.success('Position closed successfully')
      return true
    } catch (error) {
      toast.error('Failed to close position')
      return false
    }
  }

  async addMargin(positionId: string, amount: number): Promise<boolean> {
    try {
      const position = this.positions.find(p => p.id === positionId)
      if (!position) {
        toast.error('Position not found')
        return false
      }

      position.size += amount
      toast.success('Margin added successfully')
      return true
    } catch (error) {
      toast.error('Failed to add margin')
      return false
    }
  }

  getPositions(): MarginPosition[] {
    return this.positions
  }

  getHistory(): TradeHistory[] {
    return this.history
  }

  private getMockPrice(symbol: string): number {
    const prices: Record<string, number> = {
      'CRDB': 380,
      'TBL': 10900,
      'NMB': 3800
    }
    return prices[symbol] || 0
  }
}

export const marginTradeService = new MarginTradeService() 