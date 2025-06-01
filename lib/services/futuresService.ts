// Futures API service
import axios from 'axios';

// Types for Commodity Futures
export interface CommodityFuture {
  id: string;
  name: string;
  symbol: string;
  baseAsset: string;
  contractSize: number;
  unit: string;
  expiryMonth: string;
  expiryYear: number;
  price: number;
  change: number;
  openInterest: number;
  volume: number;
  initialMargin: number;
  maintenanceMargin: number;
  status: 'ACTIVE' | 'EXPIRED' | 'DELIVERY' | 'SETTLEMENT';
  lastUpdated?: string;
  createdAt?: string;
}

export interface FutureOrder {
  id: string;
  userId: string;
  futureId: string;
  side: 'BUY' | 'SELL';
  price: number;
  quantity: number;
  status: 'PENDING' | 'PARTIALLY_FILLED' | 'COMPLETED' | 'CANCELLED';
  filledQuantity: number;
  timestamp: string;
  createdAt?: string;
  updatedAt?: string;
  future?: CommodityFuture;
}

export interface FutureTrade {
  id: string;
  futureId: string;
  price: number;
  quantity: number;
  buyerOrderId: string;
  sellerOrderId: string;
  timestamp: string;
  createdAt?: string;
  updatedAt?: string;
  future?: CommodityFuture;
  buyerOrder?: FutureOrder;
  sellerOrder?: FutureOrder;
}

// Types for FX Futures
export interface FxFuture {
  id: string;
  name: string;
  baseCurrency: string;
  quoteCurrency: string;
  minAmount: number;
  tickSize: number;
  createdAt?: string;
  updatedAt?: string;
  expiryDates?: FxExpiryDate[];
}

export interface FxExpiryDate {
  id: string;
  date: string;
  displayName: string;
  spotPrice: number;
  futurePremium: number;
  openInterest: number;
  volume: number;
  fxFutureId: string;
  createdAt?: string;
  updatedAt?: string;
  fxFuture?: FxFuture;
}

export interface FxFutureOrder {
  id: string;
  userId: string;
  expiryDateId: string;
  side: 'BUY' | 'SELL';
  price: number;
  quantity: number;
  status: 'PENDING' | 'PARTIALLY_FILLED' | 'COMPLETED' | 'CANCELLED';
  filledQuantity: number;
  timestamp: string;
  createdAt?: string;
  updatedAt?: string;
  expiryDate?: FxExpiryDate & {
    fxFuture: FxFuture;
  };
}

export interface FxFutureTrade {
  id: string;
  expiryDateId: string;
  price: number;
  quantity: number;
  buyerOrderId: string;
  sellerOrderId: string;
  timestamp: string;
  createdAt?: string;
  updatedAt?: string;
  expiryDate?: FxExpiryDate & {
    fxFuture: FxFuture;
  };
  buyerOrder?: FxFutureOrder;
  sellerOrder?: FxFutureOrder;
}

export interface PaginatedResponse<T> {
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  [key: string]: any;
}

// Commodity Futures API
export const commodityFuturesApi = {
  // Get all commodity futures
  getAll: async (page = 1, limit = 20, status?: string): Promise<PaginatedResponse<CommodityFuture[]>> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (status) params.append('status', status);
    
    const response = await axios.get(`/api/futures/commodities?${params.toString()}`);
    return response.data;
  },
  
  // Get a single commodity future by ID
  getById: async (id: string): Promise<CommodityFuture> => {
    const response = await axios.get(`/api/futures/commodities?id=${id}`);
    return response.data.commodityFutures[0];
  },
  
  // Create a new commodity future
  create: async (data: Omit<CommodityFuture, 'id' | 'createdAt' | 'lastUpdated'>): Promise<CommodityFuture> => {
    const response = await axios.post('/api/futures/commodities', data);
    return response.data.commodityFuture;
  },
  
  // Update a commodity future
  update: async (id: string, data: Partial<CommodityFuture>): Promise<CommodityFuture> => {
    const response = await axios.put('/api/futures/commodities', { id, ...data });
    return response.data.commodityFuture;
  },
  
  // Delete a commodity future
  delete: async (id: string): Promise<void> => {
    await axios.delete(`/api/futures/commodities?id=${id}`);
  },
  
  // Get orders for a commodity future
  getOrders: async (futureId?: string, page = 1, limit = 20, status?: string): Promise<PaginatedResponse<FutureOrder[]>> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (futureId) params.append('futureId', futureId);
    if (status) params.append('status', status);
    
    const response = await axios.get(`/api/futures/commodities/orders?${params.toString()}`);
    return response.data;
  },
  
  // Create a new order
  createOrder: async (data: { futureId: string; side: 'BUY' | 'SELL'; price: number; quantity: number }): Promise<FutureOrder> => {
    const response = await axios.post('/api/futures/commodities/orders', data);
    return response.data.order;
  },
  
  // Update an order (e.g., cancel)
  updateOrder: async (id: string, status: string): Promise<FutureOrder> => {
    const response = await axios.put('/api/futures/commodities/orders', { id, status });
    return response.data.order;
  },
  
  // Get trades for a commodity future
  getTrades: async (futureId?: string, page = 1, limit = 20): Promise<PaginatedResponse<FutureTrade[]>> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (futureId) params.append('futureId', futureId);
    
    const response = await axios.get(`/api/futures/commodities/trades?${params.toString()}`);
    return response.data;
  },
};

// FX Futures API
export const fxFuturesApi = {
  // Get all FX futures
  getAll: async (page = 1, limit = 20, baseCurrency?: string, quoteCurrency?: string): Promise<PaginatedResponse<FxFuture[]>> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (baseCurrency) params.append('baseCurrency', baseCurrency);
    if (quoteCurrency) params.append('quoteCurrency', quoteCurrency);
    
    const response = await axios.get(`/api/futures/fx?${params.toString()}`);
    return response.data;
  },
  
  // Get a single FX future by ID
  getById: async (id: string): Promise<FxFuture> => {
    const response = await axios.get(`/api/futures/fx?id=${id}`);
    return response.data.fxFutures[0];
  },
  
  // Create a new FX future
  create: async (data: { name: string; baseCurrency: string; quoteCurrency: string; minAmount: number; expiryDates: Omit<FxExpiryDate, 'id' | 'fxFutureId' | 'createdAt' | 'updatedAt'>[] }): Promise<FxFuture> => {
    const response = await axios.post('/api/futures/fx', data);
    return response.data.fxFuture;
  },
  
  // Update an FX future
  update: async (id: string, data: Partial<FxFuture>): Promise<FxFuture> => {
    const response = await axios.put('/api/futures/fx', { id, ...data });
    return response.data.fxFuture;
  },
  
  // Delete an FX future
  delete: async (id: string): Promise<void> => {
    await axios.delete(`/api/futures/fx?id=${id}`);
  },
  
  // Get expiry dates for an FX future
  getExpiryDates: async (fxFutureId: string): Promise<FxExpiryDate[]> => {
    const response = await axios.get(`/api/futures/fx/expiry-dates?fxFutureId=${fxFutureId}`);
    return response.data.expiryDates;
  },
  
  // Create a new expiry date
  createExpiryDate: async (data: { fxFutureId: string; date: string; displayName: string; spotPrice: number; futurePremium: number }): Promise<FxExpiryDate> => {
    const response = await axios.post('/api/futures/fx/expiry-dates', data);
    return response.data.expiryDate;
  },
  
  // Update an expiry date
  updateExpiryDate: async (id: string, data: Partial<FxExpiryDate>): Promise<FxExpiryDate> => {
    const response = await axios.put('/api/futures/fx/expiry-dates', { id, ...data });
    return response.data.expiryDate;
  },
  
  // Delete an expiry date
  deleteExpiryDate: async (id: string): Promise<void> => {
    await axios.delete(`/api/futures/fx/expiry-dates?id=${id}`);
  },
  
  // Get orders for an FX future expiry date
  getOrders: async (expiryDateId?: string, page = 1, limit = 20, status?: string): Promise<PaginatedResponse<FxFutureOrder[]>> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (expiryDateId) params.append('expiryDateId', expiryDateId);
    if (status) params.append('status', status);
    
    const response = await axios.get(`/api/futures/fx/orders?${params.toString()}`);
    return response.data;
  },
  
  // Create a new order
  createOrder: async (data: { expiryDateId: string; side: 'BUY' | 'SELL'; price: number; quantity: number }): Promise<FxFutureOrder> => {
    const response = await axios.post('/api/futures/fx/orders', data);
    return response.data.order;
  },
  
  // Update an order (e.g., cancel)
  updateOrder: async (id: string, status: string): Promise<FxFutureOrder> => {
    const response = await axios.put('/api/futures/fx/orders', { id, status });
    return response.data.order;
  },
  
  // Get trades for an FX future expiry date
  getTrades: async (expiryDateId?: string, fxFutureId?: string, page = 1, limit = 20): Promise<PaginatedResponse<FxFutureTrade[]>> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (expiryDateId) params.append('expiryDateId', expiryDateId);
    if (fxFutureId) params.append('fxFutureId', fxFutureId);
    
    const response = await axios.get(`/api/futures/fx/trades?${params.toString()}`);
    return response.data;
  },
};
