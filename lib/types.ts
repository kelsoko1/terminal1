export interface Stock {
  symbol: string;
  name: string;
  price: number;
  previousPrice: number;
  percentageChange: number;
  volume: number;
}

export type SecurityType = 'stock' | 'bond' | 'fund' | 'commodity' | 'forex';
export type OrderType = 'market' | 'limit';
export type OrderSide = 'buy' | 'sell';
export type OrderStatus = 'pending' | 'executed' | 'cancelled' | 'expired';
export type TimeInForce = 'day' | 'gtc';

export interface User {
  id: string;
  dsexId?: string;
  email: string;
  name: string;
  phone?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Portfolio {
  id: string;
  userId: string;
  name: string;
  cashBalance: number;
  holdings: Holding[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Security {
  id: string;
  symbol: string;
  name: string;
  type: SecurityType;
  description?: string;
  sector?: string;
  exchange?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Holding {
  id: string;
  portfolioId: string;
  securityId: string;
  quantity: number;
  averagePrice: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  userId: string;
  securityId: string;
  orderType: OrderType;
  side: OrderSide;
  quantity: number;
  price?: number;
  status: OrderStatus;
  timeInForce: TimeInForce;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  orderId: string;
  userId: string;
  securityId: string;
  quantity: number;
  price: number;
  side: OrderSide;
  commission: number;
  totalAmount: number;
  createdAt: Date;
}

export interface MarketData {
  securityId: string;
  timestamp: Date;
  price: number;
  volume?: number;
  high?: number;
  low?: number;
  open?: number;
  close?: number;
}

export interface Watchlist {
  id: string;
  userId: string;
  name: string;
  securities: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface News {
  id: string;
  title: string;
  content: string;
  source?: string;
  url?: string;
  publishedAt: Date;
  createdAt: Date;
  securities: string[];
}

export interface PortfolioPerformance {
  totalValue: number;
  totalGainLoss: number;
  holdings: {
    symbol: string;
    quantity: number;
    averagePrice: number;
    currentPrice: number;
    value: number;
    gainLoss: number;
  }[];
}