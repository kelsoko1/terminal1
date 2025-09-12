import { Timestamp } from 'firebase/firestore';

export interface BasePortfolioPosition {
  userId: string;
  symbol: string;
  quantity: number;
  averagePrice: number;
  totalInvested: number;
  totalValue: number;
  profitLoss: number;
  profitLossPercentage: number;
  lastUpdated: Timestamp | Date;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export interface PortfolioPosition extends BasePortfolioPosition {
  id: string;
}

export interface BasePortfolioSummary {
  userId: string;
  totalValue: number;
  totalCost: number;
  totalProfitLoss: number;
  totalProfitLossPercentage: number;
  lastUpdated: Timestamp | Date;
  positions: Record<string, Omit<PortfolioPosition, 'id'>>;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export interface PortfolioSummary extends BasePortfolioSummary {
  id: string;
}
