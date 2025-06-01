import { useState, useCallback } from 'react';
import { 
  commodityFuturesApi, 
  fxFuturesApi,
  FutureOrder,
  FutureTrade,
  FxFutureOrder,
  FxFutureTrade
} from '../services/futuresService';

// Hook for commodity futures trading
export function useCommodityFuturesTrading() {
  const [orders, setOrders] = useState<FutureOrder[]>([]);
  const [trades, setTrades] = useState<FutureTrade[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalTrades, setTotalTrades] = useState(0);

  const fetchOrders = useCallback(async (futureId?: string, page = 1, limit = 20, status?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await commodityFuturesApi.getOrders(futureId, page, limit, status);
      setOrders(response.orders);
      setTotalOrders(response.pagination.total);
      return response;
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setError(err.response?.data?.error || 'Failed to fetch orders');
      setOrders([]);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTrades = useCallback(async (futureId?: string, page = 1, limit = 20) => {
    setLoading(true);
    setError(null);
    try {
      const response = await commodityFuturesApi.getTrades(futureId, page, limit);
      setTrades(response.trades);
      setTotalTrades(response.pagination.total);
      return response;
    } catch (err: any) {
      console.error('Error fetching trades:', err);
      setError(err.response?.data?.error || 'Failed to fetch trades');
      setTrades([]);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const placeOrder = async (data: { futureId: string; side: 'BUY' | 'SELL'; price: number; quantity: number }) => {
    setLoading(true);
    setError(null);
    try {
      const order = await commodityFuturesApi.createOrder(data);
      return order;
    } catch (err: any) {
      console.error('Error placing order:', err);
      setError(err.response?.data?.error || 'Failed to place order');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId: string) => {
    setLoading(true);
    setError(null);
    try {
      const order = await commodityFuturesApi.updateOrder(orderId, 'CANCELLED');
      return order;
    } catch (err: any) {
      console.error('Error cancelling order:', err);
      setError(err.response?.data?.error || 'Failed to cancel order');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    orders,
    trades,
    loading,
    error,
    totalOrders,
    totalTrades,
    fetchOrders,
    fetchTrades,
    placeOrder,
    cancelOrder
  };
}

// Hook for FX futures trading
export function useFxFuturesTrading() {
  const [orders, setOrders] = useState<FxFutureOrder[]>([]);
  const [trades, setTrades] = useState<FxFutureTrade[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalTrades, setTotalTrades] = useState(0);

  const fetchOrders = useCallback(async (expiryDateId?: string, page = 1, limit = 20, status?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fxFuturesApi.getOrders(expiryDateId, page, limit, status);
      setOrders(response.orders);
      setTotalOrders(response.pagination.total);
      return response;
    } catch (err: any) {
      console.error('Error fetching FX orders:', err);
      setError(err.response?.data?.error || 'Failed to fetch orders');
      setOrders([]);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTrades = useCallback(async (expiryDateId?: string, fxFutureId?: string, page = 1, limit = 20) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fxFuturesApi.getTrades(expiryDateId, fxFutureId, page, limit);
      setTrades(response.trades);
      setTotalTrades(response.pagination.total);
      return response;
    } catch (err: any) {
      console.error('Error fetching FX trades:', err);
      setError(err.response?.data?.error || 'Failed to fetch trades');
      setTrades([]);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const placeOrder = async (data: { expiryDateId: string; side: 'BUY' | 'SELL'; price: number; quantity: number }) => {
    setLoading(true);
    setError(null);
    try {
      const order = await fxFuturesApi.createOrder(data);
      return order;
    } catch (err: any) {
      console.error('Error placing FX order:', err);
      setError(err.response?.data?.error || 'Failed to place order');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId: string) => {
    setLoading(true);
    setError(null);
    try {
      const order = await fxFuturesApi.updateOrder(orderId, 'CANCELLED');
      return order;
    } catch (err: any) {
      console.error('Error cancelling FX order:', err);
      setError(err.response?.data?.error || 'Failed to cancel order');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    orders,
    trades,
    loading,
    error,
    totalOrders,
    totalTrades,
    fetchOrders,
    fetchTrades,
    placeOrder,
    cancelOrder
  };
}
