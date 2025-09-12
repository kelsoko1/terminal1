import { BaseService } from './baseService';
import { BasePortfolioPosition, BasePortfolioSummary, PortfolioPosition, PortfolioSummary } from '@/types/portfolio';
import { Timestamp } from 'firebase-admin/firestore';

type FirestoreTimestamp = FirebaseFirestore.Timestamp;

type PortfolioDocument = PortfolioPosition | PortfolioSummary;

export class PortfolioService extends BaseService<PortfolioDocument> {
  constructor() {
    super('portfolios');
  }

  async updatePortfolioPosition(
    userId: string,
    symbol: string,
    quantity: number,
    price: number,
    type: 'BUY' | 'SELL'
  ): Promise<PortfolioPosition> {
    const now = Timestamp.now() as unknown as Date;
    const positionId = `${userId}_${symbol}`;
    
    let position = await this.getById(positionId) as (PortfolioPosition & { toJSON?: () => any }) | null;
    
    if (!position) {
      // Create new position
      const newPosition: BasePortfolioPosition = {
        userId,
        symbol,
        quantity,
        averagePrice: price,
        totalInvested: quantity * price,
        totalValue: quantity * price,
        profitLoss: 0,
        profitLossPercentage: 0,
        lastUpdated: now,
        createdAt: now,
        updatedAt: now,
      };
      
      return this.create(newPosition, positionId) as Promise<PortfolioPosition>;
    }
    
    // Update existing position
    let newQuantity = position.quantity;
    let newAveragePrice = position.averagePrice;
    
    if (type === 'BUY') {
      const totalCost = (position.quantity * position.averagePrice) + (quantity * price);
      newQuantity = position.quantity + quantity;
      newAveragePrice = totalCost / newQuantity;
    } else {
      newQuantity = position.quantity - quantity;
      if (newQuantity < 0) {
        throw new Error('Insufficient quantity to sell');
      }
    }
    
    const updatedPosition: Partial<PortfolioPosition> = {
      quantity: newQuantity,
      averagePrice: newAveragePrice,
      totalInvested: newQuantity * newAveragePrice,
      totalValue: newQuantity * price,
      profitLoss: (newQuantity * price) - (newQuantity * newAveragePrice),
      profitLossPercentage: newQuantity > 0 ? 
        (((price - newAveragePrice) / newAveragePrice) * 100) : 0,
      lastUpdated: Timestamp.now() as unknown as Date,
      updatedAt: Timestamp.now() as unknown as Date,
    };
    
    await this.update(positionId, updatedPosition);
    return { ...position, ...updatedPosition, id: positionId };
  }
  
  async getPortfolioSummary(userId: string): Promise<PortfolioSummary | null> {
    // First get all positions for the user with quantity > 0
    const allPositions = await this.list(
      ['userId', '==', userId],
      { field: 'quantity', direction: 'desc' }
    );
    
    // Filter for positions with quantity > 0 and cast to PortfolioPosition[]
    const positions = allPositions
      .filter(pos => (pos as any).quantity > 0)
      .map(pos => ({
        ...pos,
        id: (pos as any).id
      })) as PortfolioPosition[];
    
    if (positions.length === 0) return null;
    
    const now = Timestamp.now() as unknown as Date;
    const totalValue = positions.reduce((sum, pos) => sum + pos.totalValue, 0);
    const totalCost = positions.reduce((sum, pos) => sum + pos.totalInvested, 0);
    const totalProfitLoss = totalValue - totalCost;
    const totalProfitLossPercentage = totalCost > 0 ? (totalProfitLoss / totalCost) * 100 : 0;
    
    // Convert positions to a map by symbol
    const positionsMap = positions.reduce<Record<string, Omit<PortfolioPosition, 'id'>>>((acc, pos) => {
      const { id, ...position } = pos;
      acc[pos.symbol] = position;
      return acc;
    }, {});
    
    const summary: Omit<PortfolioSummary, 'id'> = {
      userId,
      totalValue,
      totalCost,
      totalProfitLoss,
      totalProfitLossPercentage,
      lastUpdated: now,
      createdAt: positions[0]?.createdAt || now,
      updatedAt: now,
      positions: positionsMap,
    };
    
    // Store the summary for quick access
    const summaryId = `summary_${userId}`;
    const existingSummary = await this.getById(summaryId);
    
    if (existingSummary) {
      await this.update(summaryId, summary);
    } else {
      await this.create(summary, summaryId);
    }
    
    return { ...summary, id: summaryId } as PortfolioSummary;
  }
}

export const portfolioService = new PortfolioService();
