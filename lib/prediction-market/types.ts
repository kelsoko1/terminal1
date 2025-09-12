// Prediction Market Types

export type PredictionMarketStatus = 'open' | 'closed' | 'resolved';

export interface PredictionMarket {
  id: string;
  title: string;
  description: string;
  creatorUserId: string;
  createdAt: Date;
  closeAt: Date;
  resolvedAt?: Date;
  status: PredictionMarketStatus;
}

export interface PredictionOutcome {
  id: string;
  marketId: string;
  label: string; // e.g., "Yes", "No"
  shares: number; // total shares outstanding
}

export interface PredictionTrade {
  id: string;
  userId: string;
  marketId: string;
  outcomeId: string;
  type: 'buy' | 'sell';
  shares: number;
  price: number;
  createdAt: Date;
}

export interface PredictionPosition {
  userId: string;
  marketId: string;
  outcomeId: string;
  shares: number;
}

export interface PredictionMarketResolution {
  marketId: string;
  outcomeId: string; // winning outcome
  resolvedAt: Date;
} 