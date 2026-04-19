import { useState, useEffect } from 'react';
import { RefundRequest, RefundStatus, RefundStats } from '@/types/refund';
import {
  getRefunds,
  getRefundById,
  getRefundStats,
  approveRefund,
  rejectRefund,
  completeRefund,
  createRefund,
} from '@/lib/refundManager';

// Refund data cache
const refundCache = new Map<string, { data: any; timestamp: number; ttl: number }>();

function getCachedData<T>(key: string, ttl: number): T | null {
  const cached = refundCache.get(key);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data as T;
  }
  refundCache.delete(key);
  return null;
}

function setCachedData<T>(key: string, data: T, ttl: number): void {
  refundCache.set(key, {
    data,
    timestamp: Date.now(),
    ttl,
  });
}

/**
 * Hook for fetching refund requests with caching
 */
export function useRefunds(status?: RefundStatus, page: number = 1, limit: number = 10) {
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cacheKey = `refunds-${status}-${page}-${limit}`;
    const cached = getCachedData(cacheKey, 5 * 60 * 1000); // 5 min cache

    if (cached) {
      setRefunds(cached.refunds);
      setTotal(cached.total);
      setPages(cached.pages);
      setIsLoading(false);
      return;
    }

    const fetchRefunds = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await getRefunds(status, page, limit);
        setRefunds(result.refunds);
        setTotal(result.total);
        setPages(result.pages);
        setCachedData(cacheKey, result, 5 * 60 * 1000);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch refunds');
        setRefunds([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRefunds();
  }, [status, page, limit]);

  return { refunds, total, pages, isLoading, error };
}

/**
 * Hook for fetching single refund
 */
export function useRefundDetail(refundId: string) {
  const [refund, setRefund] = useState<RefundRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cacheKey = `refund-${refundId}`;
    const cached = getCachedData<RefundRequest>(cacheKey, 3 * 60 * 1000); // 3 min cache

    if (cached) {
      setRefund(cached);
      setIsLoading(false);
      return;
    }

    const fetchRefund = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getRefundById(refundId);
        setRefund(data);
        if (data) {
          setCachedData(cacheKey, data, 3 * 60 * 1000);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch refund');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRefund();
  }, [refundId]);

  return { refund, isLoading, error };
}

/**
 * Hook for refund statistics
 */
export function useRefundStats() {
  const [stats, setStats] = useState<RefundStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cacheKey = 'refund-stats';
    const cached = getCachedData<RefundStats>(cacheKey, 10 * 60 * 1000); // 10 min cache

    if (cached) {
      setStats(cached);
      setIsLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getRefundStats();
        setStats(data);
        setCachedData(cacheKey, data, 10 * 60 * 1000);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch refund stats');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, isLoading, error };
}

/**
 * Hook for refund mutations (create, approve, reject, complete)
 */
export function useRefundMutations() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createRefundRequest = async (data: any) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await createRefund(data);
      refundCache.clear(); // Invalidate cache
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create refund';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const approveRefundRequest = async (id: string, approvedBy: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await approveRefund(id, approvedBy);
      refundCache.clear(); // Invalidate cache
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to approve refund';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const rejectRefundRequest = async (id: string, reason: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await rejectRefund(id, reason);
      refundCache.clear(); // Invalidate cache
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reject refund';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const completeRefundRequest = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await completeRefund(id);
      refundCache.clear(); // Invalidate cache
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to complete refund';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createRefundRequest,
    approveRefundRequest,
    rejectRefundRequest,
    completeRefundRequest,
    isLoading,
    error,
  };
}
