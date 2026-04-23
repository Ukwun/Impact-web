/**
 * Custom React hooks for data fetching with caching
 */

import { useState, useEffect, useCallback } from "react";
import { AUTH_TOKEN_KEY } from "@/lib/authStorage";
import { fetchWithCache } from "@/lib/fetchWithCache";

interface UseFetchOptions {
  ttl?: number; // Cache TTL in milliseconds (default 5 min)
  skipCache?: boolean; // Skip cache and always fetch
  retryCount?: number; // Number of retries on error
  retryDelay?: number; // Delay between retries
}

interface UseFetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook for fetching data with automatic caching
 */
export function useFetch<T = any>(
  url: string | null,
  options?: UseFetchOptions
): UseFetchState<T> & { refetch: () => void } {
  const [state, setState] = useState<UseFetchState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const [retryCount, setRetryCount] = useState(0);

  const fetch = useCallback(async () => {
    if (!url) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const token = typeof window !== "undefined" 
        ? localStorage.getItem(AUTH_TOKEN_KEY)
        : null;

      const data = await fetchWithCache<T>(
        url,
        token,
        options?.ttl ?? 5 * 60 * 1000,
        { method: "GET" }
      );

      setState({ data, loading: false, error: null });
      setRetryCount(0);
    } catch (err) {
      const error = err instanceof Error ? err.message : "Failed to fetch data";

      // Retry logic
      if (retryCount < (options?.retryCount ?? 3)) {
        setTimeout(() => {
          setRetryCount((prev) => prev + 1);
        }, options?.retryDelay ?? 1000 * (retryCount + 1));
      } else {
        setState({ data: null, loading: false, error });
      }
    }
  }, [url, retryCount, options?.retryCount, options?.retryDelay, options?.ttl]);

  useEffect(() => {
    fetch();
  }, [url]);

  const refetch = useCallback(() => {
    setRetryCount(0);
    fetch();
  }, [fetch]);

  return { ...state, refetch };
}

/**
 * Hook for facilitator analytics
 */
export function useFacilitatorAnalytics(period: string = "month") {
  const url = `/api/facilitator/analytics?period=${period}`;
  const { data, loading, error, refetch } = useFetch(url, {
    ttl: 10 * 60 * 1000, // 10 min cache
  });

  return {
    analytics: data,
    loading,
    error,
    refetch,
  };
}

/**
 * Hook for facilitator content
 */
export function useFacilitatorContent(type: "courses" | "modules" | "lessons" = "courses") {
  const url = `/api/facilitator/content?type=${type}`;
  const { data, loading, error, refetch } = useFetch(url, {
    ttl: 5 * 60 * 1000, // 5 min cache
  });

  return {
    content: data,
    loading,
    error,
    refetch,
  };
}

/**
 * Hook for admin reports
 */
export function useAdminReports(filter: string = "all") {
  const url = `/api/admin/reports?filter=${filter}`;
  const { data, loading, error, refetch } = useFetch(url, {
    ttl: 15 * 60 * 1000, // 15 min cache for reports
  });

  return {
    reports: data,
    loading,
    error,
    refetch,
  };
}

/**
 * Hook for system alerts
 */
export function useAdminAlerts(severity: string = "all") {
  const url = `/api/admin/alerts?severity=${severity}`;
  const { data, loading, error, refetch } = useFetch(url, {
    ttl: 2 * 60 * 1000, // 2 min cache for alerts (fresher data)
  });

  return {
    alerts: data,
    loading,
    error,
    refetch,
  };
}

export function useAdminReplayReviewQueue(includeResolved: boolean = false) {
  const url = `/api/admin/live-classroom/replay-review?includeResolved=${includeResolved}`;
  const { data, loading, error, refetch } = useFetch(url, {
    ttl: 60 * 1000,
  });

  return {
    replayQueue: data,
    loading,
    error,
    refetch,
  };
}

export function useAdminSafeguardingDashboard(includeResolved: boolean = false) {
  const url = `/api/admin/live-classroom/safeguarding?includeResolved=${includeResolved}`;
  const { data, loading, error, refetch } = useFetch(url, {
    ttl: 60 * 1000,
  });

  return {
    safeguardingDashboard: data,
    loading,
    error,
    refetch,
  };
}

export function useAdminMessagingQueue(includeResolved: boolean = false) {
  const url = `/api/admin/live-classroom/messaging-queue?includeResolved=${includeResolved}`;
  const { data, loading, error, refetch } = useFetch(url, {
    ttl: 45 * 1000,
  });

  return {
    messagingQueue: data,
    loading,
    error,
    refetch,
  };
}

export function useSafeguardingOfficers() {
  const url = `/api/admin/live-classroom/safeguarding/officers`;
  const { data, loading, error, refetch } = useFetch(url, {
    ttl: 5 * 60 * 1000,
  });

  return {
    officers: data,
    loading,
    error,
    refetch,
  };
}

/**
 * Hook for university programs
 */
export function useUniversityPrograms(filter: string = "all") {
  const url = `/api/university/programs?filter=${filter}`;
  const { data, loading, error, refetch } = useFetch(url, {
    ttl: 10 * 60 * 1000, // 10 min cache
  });

  return {
    programs: data,
    loading,
    error,
    refetch,
  };
}

/**
 * Hook for public resources
 */
export function usePublicResources() {
  const url = `/api/public/resources`;
  const { data, loading, error, refetch } = useFetch(url, {
    ttl: 30 * 60 * 1000, // 30 min cache for resources (static content)
  });

  return {
    resources: data,
    loading,
    error,
    refetch,
  };
}
