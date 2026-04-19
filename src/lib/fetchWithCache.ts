/**
 * Fetch utilities with built-in caching
 * Provides request deduplication and caching for API calls
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // time to live in milliseconds
}

class FetchCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private pendingRequests: Map<string, Promise<any>> = new Map();

  /**
   * Get from cache if available and not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      // Cache expired
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Store in cache
   */
  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clear specific cache entry
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Get cached request or make new one (request deduplication)
   */
  async fetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // Check if data is in cache
    const cached = this.get<T>(key);
    if (cached) {
      return cached;
    }

    // Check if request is already pending (deduplication)
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key)!;
    }

    // Make new request
    const promise = fetcher()
      .then((data) => {
        this.set(key, data, ttl);
        this.pendingRequests.delete(key);
        return data;
      })
      .catch((error) => {
        this.pendingRequests.delete(key);
        throw error;
      });

    this.pendingRequests.set(key, promise);
    return promise;
  }
}

// Global cache instance
export const fetchCache = new FetchCache();

/**
 * Fetch from API with error handling
 */
export async function fetchAPI<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `API request failed: ${response.status}`);
  }

  return response.json();
}

/**
 * Fetch from API with token
 */
export async function fetchAPIWithToken<T>(
  url: string,
  token: string | null,
  options?: Omit<RequestInit, "headers">
): Promise<T> {
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return fetchAPI<T>(url, {
    ...options,
    headers,
  });
}

/**
 * Fetch with caching
 */
export async function fetchWithCache<T>(
  url: string,
  token: string | null,
  ttl: number = 5 * 60 * 1000,
  options?: Omit<RequestInit, "headers">
): Promise<T> {
  const cacheKey = `${url}:${token || "anonymous"}`;

  return fetchCache.fetch(
    cacheKey,
    () => fetchAPIWithToken<T>(url, token, options),
    ttl
  );
}
