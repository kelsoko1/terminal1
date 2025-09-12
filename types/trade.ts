import { Timestamp } from 'firebase/firestore';

export enum TradeStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED'
}

export enum TradeType {
  BUY = 'BUY',
  SELL = 'SELL'
}

export interface Trade {
  id?: string;
  userId: string;
  symbol: string;
  quantity: number;
  price: number;
  type: TradeType;
  status: TradeStatus;
  executedAt: Timestamp | Date;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}
