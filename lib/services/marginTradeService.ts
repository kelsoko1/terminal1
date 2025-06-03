import { toast } from 'sonner'
import { PrismaClientExtension, createExtendedPrismaClient } from '../prisma-extensions'
import { getDatabase } from '../database/localDatabase'
import { logger as winstonLogger } from '../logger'
import { ApiError } from '../errors/ApiError'

// Create a typed logger wrapper to handle error objects properly
const logger = {
  info: (message: string, meta?: Record<string, any>) => winstonLogger.info(message, meta),
  warn: (message: string, meta?: Record<string, any>) => winstonLogger.warn(message, meta),
  error: (message: string, errorMeta?: Record<string, any>) => {
    // Winston logger expects an Error object or undefined
    // We're passing a structured object with error details instead
    winstonLogger.error(message, errorMeta as any)
  },
  debug: (message: string, meta?: Record<string, any>) => winstonLogger.debug(message, meta)
}

// Using enums from Prisma schema
export type MarginPositionType = 'LONG' | 'SHORT'
export type MarginPositionStatus = 'OPEN' | 'CLOSED' | 'LIQUIDATED'

// Define interfaces for our models
export interface MarginPosition {
  id: string;
  userId: string;
  symbol: string;
  type: MarginPositionType;
  status: MarginPositionStatus;
  entryPrice: number;
  currentPrice: number;
  size: number;
  leverage: number;
  stopLoss?: number | null;
  takeProfit?: number | null;
  liquidationPrice?: number | null;
  pnl: number;
  pnlPercentage: number;
  marginUsed: number;
  trades?: MarginTrade[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MarginTrade {
  id: string;
  positionId: string;
  position?: MarginPosition;
  type: string; // OPEN, CLOSE, ADD_MARGIN, REDUCE_MARGIN, LIQUIDATION
  price: number;
  size: number;
  pnl?: number | null;
  createdAt: Date;
}

export interface MarginTradeRequest {
  userId: string
  symbol: string
  type: MarginPositionType
  amount: number
  leverage: number
  stopLoss?: number | null
  takeProfit?: number | null
}

export interface MarginPosition {
  id: string
  userId: string
  symbol: string
  type: MarginPositionType
  status: MarginPositionStatus
  entryPrice: number
  currentPrice: number
  size: number
  leverage: number
  stopLoss?: number | null
  takeProfit?: number | null
  liquidationPrice?: number | null
  pnl: number
  pnlPercentage: number
  marginUsed: number
  trades?: MarginTrade[]
  createdAt: Date
  updatedAt: Date
}

export interface MarginTradeHistory {
  id: string
  positionId: string
  type: string
  price: number
  size: number
  pnl?: number
  createdAt: Date
}

export class MarginTradeService {
  private prisma: PrismaClientExtension;

  constructor() {
    this.prisma = createExtendedPrismaClient();
  }

  async placeTrade(request: MarginTradeRequest): Promise<boolean> {
    try {
      // Get current price from price service
      const currentPrice = await this.getCurrentPrice(request.symbol)
      
      // Calculate liquidation price
      const liquidationPrice = this.calculateLiquidationPrice(
        request.type, 
        currentPrice, 
        request.leverage
      )
      
      // Calculate margin used
      const marginUsed = request.amount / request.leverage
      
      // Use Prisma transaction to ensure data consistency
      const result = await this.prisma.$transaction(async (tx: any) => {
        // Check if user has sufficient balance
        const user = await tx.user.findUnique({
          where: { id: request.userId }
        })
        
        if (!user) {
          throw new ApiError('User not found', 404)
        }
        
        // Create position in database
        const position = await tx.marginPosition.create({
          data: {
            userId: request.userId,
            symbol: request.symbol,
            type: request.type,
            status: 'OPEN',
            entryPrice: currentPrice,
            currentPrice: currentPrice,
            size: request.amount,
            leverage: request.leverage,
            stopLoss: request.stopLoss,
            takeProfit: request.takeProfit,
            liquidationPrice: liquidationPrice,
            pnl: 0,
            pnlPercentage: 0,
            marginUsed: marginUsed,
            trades: {
              create: {
                type: 'OPEN',
                price: currentPrice,
                size: request.amount
              }
            }
          },
          include: {
            trades: true
          }
        })
        
        return position
      })
      
      logger.info('Trade placed successfully', { 
        userId: request.userId, 
        symbol: request.symbol,
        positionId: result.id
      })
      
      toast.success('Trade placed successfully')
      return true
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      logger.error('Failed to place trade', { 
        errorDetails: errorMessage,
        requestSymbol: request.symbol,
        requestType: request.type
      })
      toast.error('Failed to place trade')
      return false
    }
  }

  async closePosition(positionId: string): Promise<boolean> {
    try {
      // Use Prisma transaction to ensure data consistency
      await this.prisma.$transaction(async (tx: any) => {
        // Find position in database
        const position = await tx.marginPosition.findUnique({
          where: { id: positionId }
        })
        
        if (!position) {
          throw new ApiError('Position not found', 404)
        }
        
        if (position.status !== 'OPEN') {
          throw new ApiError('Position is already closed or liquidated', 400)
        }
        
        // Get current price
        const currentPrice = await this.getCurrentPrice(position.symbol)
        
        // Calculate PNL
        const pnl = this.calculatePnl(
          position.type as MarginPositionType,
          position.entryPrice,
          currentPrice,
          position.size,
          position.leverage
        )
        
        const pnlPercentage = (pnl / position.marginUsed) * 100
        
        // Update position in database
        await tx.marginPosition.update({
          where: { id: positionId },
          data: {
            status: 'CLOSED',
            currentPrice: currentPrice,
            pnl: pnl,
            pnlPercentage: pnlPercentage,
            trades: {
              create: {
                type: 'CLOSE',
                price: currentPrice,
                size: position.size,
                pnl: pnl
              }
            }
          }
        })
        
        // Create transaction record for the profit/loss
        if (pnl !== 0) {
          await tx.transaction.create({
            data: {
              userId: position.userId,
              amount: pnl,
              type: pnl > 0 ? 'MARGIN_PROFIT' : 'MARGIN_LOSS',
              description: `${position.type} position ${positionId} on ${position.symbol}`,
              status: 'COMPLETED'
            }
          })
        }
      })
      
      logger.info('Position closed successfully', { positionId })
      toast.success('Position closed successfully')
      return true
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      logger.error('Failed to close position', { 
        errorDetails: errorMessage,
        positionId 
      })
      
      if (error instanceof ApiError) {
        toast.error(error.message)
      } else {
        toast.error('Failed to close position')
      }
      
      return false
    }
  }

  async addMargin(positionId: string, amount: number): Promise<boolean> {
    try {
      // Use Prisma transaction to ensure data consistency
      await this.prisma.$transaction(async (tx: any) => {
        // Find position in database
        const position = await tx.marginPosition.findUnique({
          where: { id: positionId }
        })
        
        if (!position) {
          throw new ApiError('Position not found', 404)
        }
        
        if (position.status !== 'OPEN') {
          throw new ApiError('Position is already closed or liquidated', 400)
        }
        
        // Update position with additional margin
        const newMarginUsed = position.marginUsed + amount
        const newLeverage = position.size / newMarginUsed
        
        // Recalculate liquidation price with new leverage
        const liquidationPrice = this.calculateLiquidationPrice(
          position.type as MarginPositionType,
          position.entryPrice,
          newLeverage
        )
        
        await tx.marginPosition.update({
          where: { id: positionId },
          data: {
            marginUsed: newMarginUsed,
            leverage: newLeverage,
            liquidationPrice,
            trades: {
              create: {
                type: 'ADD_MARGIN',
                price: position.currentPrice,
                size: amount
              }
            }
          }
        })
      })
      
      logger.info('Margin added successfully', { positionId, amount })
      toast.success('Margin added successfully')
      return true
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      logger.error('Failed to add margin', { 
        errorDetails: errorMessage,
        positionId,
        amount
      })
      
      if (error instanceof ApiError) {
        toast.error(error.message)
      } else {
        toast.error('Failed to add margin')
      }
      
      return false
    }
  }

  async getPositions(userId: string): Promise<MarginPosition[]> {
    try {
      const positions = await this.prisma.marginPosition.findMany({
        where: { userId, status: 'OPEN' },
        include: { trades: true }
      }) as unknown as MarginPosition[]
      
      return positions
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      logger.error('Failed to get positions', { errorDetails: errorMessage })
      return []
    }
  }

  async getTradeHistory(userId: string): Promise<MarginTrade[]> {
    try {
      const trades = await this.prisma.marginTrade.findMany({
        where: {
          position: {
            userId
          }
        },
        orderBy: { createdAt: 'desc' },
        include: { position: true }
      })
      
      return trades
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      logger.error('Failed to get trade history', { 
        errorDetails: errorMessage,
        userId 
      })
      return []
    }
  }
  
  async getPositionTrades(positionId: string): Promise<MarginTradeHistory[]> {
    try {
      const trades = await this.prisma.marginTrade.findMany({
        where: { positionId },
        orderBy: { createdAt: 'desc' }
      }) as unknown as MarginTradeHistory[]
      
      return trades
    } catch (error) {
      logger.error('Failed to get position trades', { 
        error: error instanceof Error ? error.message : String(error),
        positionId 
      })
      return []
    }
  }

  async updatePositions(): Promise<void> {
    try {
      // Get all open positions
      const openPositions = await this.prisma.marginPosition.findMany({
        where: { status: 'OPEN' }
      })
      
      for (const position of openPositions) {
        try {
          // Get current price
          const currentPrice = await this.getCurrentPrice(position.symbol)
          
          // Calculate PNL
          const pnl = this.calculatePnl(
            position.type as MarginPositionType,
            position.entryPrice,
            currentPrice,
            position.size,
            position.leverage
          )
          
          const pnlPercentage = (pnl / position.marginUsed) * 100
          
          // Use transaction for atomic updates
          await this.prisma.$transaction(async (tx: any) => {
            // Update position with current price and PNL
            await tx.marginPosition.update({
              where: { id: position.id },
              data: {
                currentPrice,
                pnl,
                pnlPercentage
              }
            })
            
            // Check for liquidation
            if (
              (position.type === 'LONG' && currentPrice <= (position.liquidationPrice || 0)) ||
              (position.type === 'SHORT' && currentPrice >= (position.liquidationPrice || 0))
            ) {
              // Liquidate position
              await tx.marginPosition.update({
                where: { id: position.id },
                data: {
                  status: 'LIQUIDATED',
                  pnl: -position.marginUsed, // Full loss on liquidation
                  trades: {
                    create: {
                      type: 'LIQUIDATION',
                      price: currentPrice,
                      size: position.size,
                      pnl: -position.marginUsed
                    }
                  }
                }
              })
              
              // Create transaction record for liquidation
              await tx.transaction.create({
                data: {
                  userId: position.userId,
                  amount: -position.marginUsed,
                  type: 'MARGIN_LIQUIDATION',
                  description: `${position.type} position ${position.id} on ${position.symbol} liquidated`,
                  status: 'COMPLETED'
                }
              })
              
              // In production, this would send an email or push notification
              logger.warn(`Position ${position.id} has been liquidated`, { position })
            }
            
            // Check for take profit
            else if (
              position.takeProfit &&
              ((position.type === 'LONG' && currentPrice >= position.takeProfit) ||
              (position.type === 'SHORT' && currentPrice <= position.takeProfit))
            ) {
              // Close position at take profit
              await this.closePosition(position.id)
              logger.info(`Position ${position.id} closed at take profit`, { position })
            }
            
            // Check for stop loss
            else if (
              position.stopLoss &&
              ((position.type === 'LONG' && currentPrice <= position.stopLoss) ||
              (position.type === 'SHORT' && currentPrice >= position.stopLoss))
            ) {
              // Close position at stop loss
              await this.closePosition(position.id)
              logger.info(`Position ${position.id} closed at stop loss`, { position })
            }
          })
        } catch (positionError: unknown) {
          // Log error but continue processing other positions
          const errorMessage = positionError instanceof Error ? positionError.message : String(positionError)
          logger.error(`Error updating position ${position.id}`, {
            errorDetails: errorMessage,
            positionId: position.id,
            symbol: position.symbol
          })
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      logger.error('Failed to update positions', { errorDetails: errorMessage })
    }
  }

  async getPosition(positionId: string): Promise<MarginPosition | null> {
    try {
      const position = await this.prisma.marginPosition.findUnique({
        where: { id: positionId }
      }) as unknown as MarginPosition | null
      
      return position
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      logger.error('Failed to get position', { 
        errorDetails: errorMessage,
        positionId 
      })
      return null
    }
  }

  private async getCurrentPrice(symbol: string): Promise<number> {
    try {
      // In a production environment, this would call an external price API
      // For now, we'll use a database lookup with fallback to mock prices
      const stockPrice = await this.prisma.stockPrice.findFirst({
        where: { symbol },
        orderBy: { timestamp: 'desc' }
      })
      
      if (stockPrice) {
        return stockPrice.price
      }
      
      // Fallback to mock prices if no database entry exists
      const mockPrices: Record<string, number> = {
        'CRDB': 385,
        'TBL': 950,
        'NMB': 2800,
      }
      
      const price = mockPrices[symbol] || 100
      logger.debug(`Using mock price for ${symbol}: ${price}`)
      return price
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      logger.error(`Failed to get current price for ${symbol}`, { errorDetails: errorMessage })
      
      // Fallback to default price in case of error
      return 100
    }
  }

  private calculateLiquidationPrice(type: MarginPositionType, entryPrice: number, leverage: number): number {
    // For simplicity, we'll assume liquidation at 80% of margin
    // In a real system, this would be more complex and consider fees
    const liquidationThreshold = 0.8 / leverage
    
    if (type === 'LONG') {
      return entryPrice * (1 - liquidationThreshold)
    } else {
      return entryPrice * (1 + liquidationThreshold)
    }
  }
  

  
  private calculatePnl(
    type: MarginPositionType,
    entryPrice: number,
    currentPrice: number,
    size: number,
    leverage: number
  ): number {
    const direction = type === 'LONG' ? 1 : -1
    const priceDifference = currentPrice - entryPrice
    const percentageChange = priceDifference / entryPrice
    
    return size * percentageChange * direction * leverage
  }
  
  private async updatePositionPriceAndPnl(positionId: string): Promise<void> {
    try {
      // Find position in database
      const position = await this.getPosition(positionId)
      
      if (!position) return
      
      // Get current price
      const currentPrice = await this.getCurrentPrice(position.symbol)
      
      // Calculate PNL
      const pnl = this.calculatePnl(
        position.type,
        position.entryPrice,
        currentPrice,
        position.size,
        position.leverage
      )
      
      const pnlPercentage = (pnl / position.marginUsed) * 100
      
      // Check for liquidation
      let newStatus = position.status
      if (this.shouldLiquidate(position.type, position.entryPrice, currentPrice, position.leverage)) {
        newStatus = 'LIQUIDATED'
      }
      
      // Check for stop loss / take profit
      if (position.stopLoss && this.isStopLossTriggered(position.type, currentPrice, position.stopLoss)) {
        newStatus = 'CLOSED'
      }
      
      if (position.takeProfit && this.isTakeProfitTriggered(position.type, currentPrice, position.takeProfit)) {
        newStatus = 'CLOSED'
      }
      
      // Update position in database
      await this.prisma.marginPosition.update({
        where: { id: positionId },
        data: {
          currentPrice: currentPrice,
          pnl: pnl,
          pnlPercentage: pnlPercentage,
          status: newStatus,
          updatedAt: new Date()
        }
      })
      
      // If position was closed due to stop loss / take profit / liquidation, create a closing trade
      if (newStatus !== 'OPEN' && position.status === 'OPEN') {
        await this.prisma.marginTrade.create({
          data: {
            positionId: positionId,
            type: newStatus === 'LIQUIDATED' ? 'LIQUIDATION' : 'CLOSE',
            price: currentPrice,
            size: position.size,
            pnl: pnl,
            createdAt: new Date()
          }
        })
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      logger.error('Failed to update position', { errorDetails: errorMessage })
    }
  }
  
  private shouldLiquidate(type: MarginPositionType, entryPrice: number, currentPrice: number, leverage: number): boolean {
    const liquidationPrice = this.calculateLiquidationPrice(
      type === 'LONG' ? 'LONG' : 'SHORT',
      entryPrice,
      leverage
    )
    
    if (type === 'LONG') {
      return currentPrice <= liquidationPrice
    } else {
      return currentPrice >= liquidationPrice
    }
  }
  
  private isStopLossTriggered(type: MarginPositionType, currentPrice: number, stopLoss: number): boolean {
    if (type === 'LONG') {
      return currentPrice <= stopLoss
    } else {
      return currentPrice >= stopLoss
    }
  }
  
  private isTakeProfitTriggered(type: MarginPositionType, currentPrice: number, takeProfit: number): boolean {
    if (type === 'LONG') {
      return currentPrice >= takeProfit
    } else {
      return currentPrice <= takeProfit
    }
  }
}

export const marginTradeService = new MarginTradeService() 