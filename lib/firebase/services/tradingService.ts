import { BaseService } from './baseService';
import { Trade, TradeStatus, TradeType } from '@/types/trade';
import { Timestamp } from 'firebase-admin/firestore';
import { portfolioService } from './portfolioService';
import { getFirestore } from 'firebase-admin/firestore';

export class TradingService extends BaseService<Trade> {
  protected collectionName = 'trades';
  constructor() {
    super('trades');
  }

  async executeTrade(
    userId: string,
    symbol: string,
    quantity: number,
    price: number,
    type: TradeType
  ): Promise<Trade> {
    const now = Timestamp.now();
    
    // Create the trade record
    const tradeData = {
      userId,
      symbol,
      quantity,
      price,
      type,
      status: TradeStatus.COMPLETED,
      executedAt: now,
      createdAt: now,
      updatedAt: now,
    };

    // Create the trade
    const trade = await this.create(tradeData);
    
    try {
      // Update the portfolio position
      await portfolioService.updatePortfolioPosition(
        userId,
        symbol,
        quantity,
        price,
        type
      );
      
      return trade;
    } catch (error) {
      // If portfolio update fails, delete the trade to maintain consistency
      await this.delete(trade.id);
      throw error;
    }
  }

  async getUserTrades(userId: string): Promise<Trade[]> {
    return this.list(
      ['userId', '==', userId],
      { field: 'executedAt', direction: 'desc' }
    );
  }

  /**
   * Get a summary of the user's portfolio
   * @param userId The ID of the user
   * @returns A Promise that resolves to the portfolio summary
   */
  async getPortfolioSummary(userId: string) {
    return portfolioService.getPortfolioSummary(userId);
  }
  
  /**
   * Get trade history for a user with optional filters
   * @param userId The ID of the user
   * @param symbol Optional symbol to filter by
   * @param startDate Optional start date to filter from
   * @param endDate Optional end date to filter to
   * @returns Array of trades matching the criteria
   */
  async getTradeHistory(
    userId: string, 
    symbol?: string, 
    startDate?: string, 
    endDate?: string
  ): Promise<Trade[]> {
    const db = getFirestore();
    let query = db.collection(this.collectionName).where('userId', '==', userId);
    
    if (symbol) {
      query = query.where('symbol', '==', symbol);
    }
    
    if (startDate) {
      query = query.where('executedAt', '>=', Timestamp.fromDate(new Date(startDate)));
    }
    
    if (endDate) {
      query = query.where('executedAt', '<=', Timestamp.fromDate(new Date(endDate)));
    }
    
    const snapshot = await query.orderBy('executedAt', 'desc').get();
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        executedAt: (data.executedAt as Timestamp).toDate(),
        createdAt: (data.createdAt as Timestamp).toDate(),
        updatedAt: (data.updatedAt as Timestamp).toDate()
      } as Trade;
    });
  }
}

export const tradingService = new TradingService();
