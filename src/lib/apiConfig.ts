/**
 * API Configuration Utility
 * Handles environment-specific API URLs (Netlify, local dev, etc.)
 */

/**
 * Get the base API URL for the current environment
 * - On Netlify: Uses NEXT_PUBLIC_API_URL env var (Render backend)
 * - In development: Uses localhost:3000 or NEXT_PUBLIC_API_URL
 * - Fallback: Uses relative URLs (same origin)
 */
export function getApiBaseUrl(): string {
  // First, check for explicit NEXT_PUBLIC_API_URL env var (set in Netlify or .env.local)
  if (typeof window !== 'undefined') {
    const publicApiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (publicApiUrl) {
      console.log('[API Config] Using NEXT_PUBLIC_API_URL:', publicApiUrl);
      return publicApiUrl;
    }
  }

  // In development, can use localhost or NEXT_PUBLIC_API_URL
  if (process.env.NODE_ENV === 'development') {
    const localhostUrl = 'http://localhost:3000';
    console.log('[API Config] Development mode, using localhost');
    return localhostUrl;
  }

  // Production without explicit env var: use relative URLs
  // This requires NEXT_PUBLIC_API_URL to be set in Netlify dashboard
  console.warn('[API Config] No NEXT_PUBLIC_API_URL set in production - using relative URLs (will hit Netlify)');
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
