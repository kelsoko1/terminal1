import { useState, useEffect, useCallback } from 'react';
import { fxFuturesApi, FxFuture, FxExpiryDate } from '../services/futuresService';

interface UseFxFuturesProps {
  initialPage?: number;
  initialLimit?: number;
  baseCurrency?: string;
  quoteCurrency?: string;
}

export function useFxFutures({
  initialPage = 1,
  initialLimit = 20,
  baseCurrency,
  quoteCurrency
}: UseFxFuturesProps = {}) {
  const [futures, setFutures] = useState<FxFuture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const fetchFutures = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fxFuturesApi.getAll(page, limit, baseCurrency, quoteCurrency);
      setFutures(response.fxFutures);
      setTotalPages(response.pagination.pages);
      setTotalItems(response.pagination.total);
    } catch (err) {
      console.error('Error fetching FX futures:', err);
      setError('Failed to load FX futures. Please try again.');
      setFutures([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit, baseCurrency, quoteCurrency]);

  useEffect(() => {
    fetchFutures();
  }, [fetchFutures]);

  const getExpiryDates = async (fxFutureId: string) => {
    try {
      return await fxFuturesApi.getExpiryDates(fxFutureId);
    } catch (err) {
      console.error('Error fetching expiry dates:', err);
      throw err;
    }
  };

  const createFuture = async (data: { 
    name: string; 
    baseCurrency: string; 
    quoteCurrency: string; 
    minAmount: number; 
    expiryDates: Omit<FxExpiryDate, 'id' | 'fxFutureId' | 'createdAt' | 'updatedAt'>[] 
  }) => {
    setLoading(true);
    setError(null);
    try {
      await fxFuturesApi.create(data);
      await fetchFutures(); // Refresh the list after creating
      return true;
    } catch (err: any) {
      console.error('Error creating FX future:', err);
      setError(err.response?.data?.error || 'Failed to create FX future');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateFuture = async (id: string, data: Partial<FxFuture>) => {
    setLoading(true);
    setError(null);
    try {
      await fxFuturesApi.update(id, data);
      await fetchFutures(); // Refresh the list after updating
      return true;
    } catch (err: any) {
      console.error('Error updating FX future:', err);
      setError(err.response?.data?.error || 'Failed to update FX future');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteFuture = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await fxFuturesApi.delete(id);
      await fetchFutures(); // Refresh the list after deleting
      return true;
    } catch (err: any) {
      console.error('Error deleting FX future:', err);
      setError(err.response?.data?.error || 'Failed to delete FX future');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const createExpiryDate = async (data: { 
    fxFutureId: string; 
    date: string; 
    displayName: string; 
    spotPrice: number; 
    futurePremium: number 
  }) => {
    try {
      return await fxFuturesApi.createExpiryDate(data);
    } catch (err) {
      console.error('Error creating expiry date:', err);
      throw err;
    }
  };

  const updateExpiryDate = async (id: string, data: Partial<FxExpiryDate>) => {
    try {
      return await fxFuturesApi.updateExpiryDate(id, data);
    } catch (err) {
      console.error('Error updating expiry date:', err);
      throw err;
    }
  };

  const deleteExpiryDate = async (id: string) => {
    try {
      await fxFuturesApi.deleteExpiryDate(id);
      return true;
    } catch (err) {
      console.error('Error deleting expiry date:', err);
      throw err;
    }
  };

  return {
    futures,
    loading,
    error,
    page,
    limit,
    totalPages,
    totalItems,
    setPage,
    setLimit,
    fetchFutures,
    getExpiryDates,
    createFuture,
    updateFuture,
    deleteFuture,
    createExpiryDate,
    updateExpiryDate,
    deleteExpiryDate
  };
}
