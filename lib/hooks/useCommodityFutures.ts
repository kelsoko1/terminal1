import { useState, useEffect, useCallback } from 'react';
import { commodityFuturesApi, CommodityFuture } from '../services/futuresService';

interface UseCommodityFuturesProps {
  initialPage?: number;
  initialLimit?: number;
  initialStatus?: string;
}

export function useCommodityFutures({
  initialPage = 1,
  initialLimit = 20,
  initialStatus = 'all'
}: UseCommodityFuturesProps = {}) {
  const [futures, setFutures] = useState<CommodityFuture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [status, setStatus] = useState(initialStatus);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const fetchFutures = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const statusParam = status === 'all' ? undefined : status;
      const response = await commodityFuturesApi.getAll(page, limit, statusParam);
      setFutures(response.commodityFutures);
      setTotalPages(response.pagination.pages);
      setTotalItems(response.pagination.total);
    } catch (err) {
      console.error('Error fetching commodity futures:', err);
      setError('Failed to load commodity futures. Please try again.');
      setFutures([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit, status]);

  useEffect(() => {
    fetchFutures();
  }, [fetchFutures]);

  const createFuture = async (data: Omit<CommodityFuture, 'id' | 'createdAt' | 'lastUpdated'>) => {
    setLoading(true);
    setError(null);
    try {
      await commodityFuturesApi.create(data);
      await fetchFutures(); // Refresh the list after creating
      return true;
    } catch (err: any) {
      console.error('Error creating commodity future:', err);
      setError(err.response?.data?.error || 'Failed to create commodity future');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateFuture = async (id: string, data: Partial<CommodityFuture>) => {
    setLoading(true);
    setError(null);
    try {
      await commodityFuturesApi.update(id, data);
      await fetchFutures(); // Refresh the list after updating
      return true;
    } catch (err: any) {
      console.error('Error updating commodity future:', err);
      setError(err.response?.data?.error || 'Failed to update commodity future');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteFuture = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await commodityFuturesApi.delete(id);
      await fetchFutures(); // Refresh the list after deleting
      return true;
    } catch (err: any) {
      console.error('Error deleting commodity future:', err);
      setError(err.response?.data?.error || 'Failed to delete commodity future');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    futures,
    loading,
    error,
    page,
    limit,
    status,
    totalPages,
    totalItems,
    setPage,
    setLimit,
    setStatus,
    fetchFutures,
    createFuture,
    updateFuture,
    deleteFuture
  };
}
