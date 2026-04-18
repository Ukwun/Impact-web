/**
 * API Configuration Utility
 * Handles environment-specific API URLs (Netlify, local dev, etc.)
 */

/**
 * Get the base API URL for the current environment
 * - On Netlify: Uses NEXT_PUBLIC_API_URL env var (Render backend)
 * - In development: Uses localhost:3000
 * - Default: Uses relative URLs (same origin)
 */
export function getApiBaseUrl(): string {
  // If running in browser and we have a public API URL env var, use it
  if (typeof window !== 'undefined') {
    const publicApiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (publicApiUrl) {
      return publicApiUrl;
    }
  }

  // Development: use localhost
  if (process.env.NODE_ENV === 'development') {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  }

  // Production: use relative URLs (will use same origin)
  return '';
}

/**
 * Construct full API endpoint URL
 * @param endpoint - API endpoint (e.g., '/api/auth/login')
 * @returns Full URL to the API endpoint
 */
export function getApiUrl(endpoint: string): string {
  const baseUrl = getApiBaseUrl();
  
  // Ensure endpoint starts with /
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // If no baseUrl, return relative URL
  if (!baseUrl) {
    return normalizedEndpoint;
  }
  
  // Remove trailing slash from baseUrl and combine
  return `${baseUrl.replace(/\/$/, '')}${normalizedEndpoint}`;
}

/**
 * Make an API request
 * Automatically handles base URL and common headers
 */
export async function apiCall<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = getApiUrl(endpoint);
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add auth token if available
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || error.message || `API Error: ${response.status}`);
  }

  const data = await response.json();
  return data;
}

export default {
  getApiBaseUrl,
  getApiUrl,
  apiCall,
};
