/**
 * Global fetch interceptor for API calls
 * This file should be imported in the root layout to enable automatic API URL handling
 *
 * Usage:
 * - Import this file in your root layout
 * - All fetch('/api/...') calls will automatically use the configured backend URL
 */

import { getApiUrl } from './apiConfig';

// Store original fetch
const originalFetch = global.fetch;

// Override global fetch
if (typeof window !== 'undefined') {
  (global as any).fetch = function (
    input: string | Request,
    init?: RequestInit
  ): Promise<Response> {
    // If input is a string and starts with /api/, convert to full URL
    if (typeof input === 'string' && input.startsWith('/api/')) {
      const fullUrl = getApiUrl(input);
      console.debug(`[API Interceptor] Redirecting fetch: ${input} → ${fullUrl}`);
      return originalFetch.call(global, fullUrl, init);
    }

    // Otherwise, use original fetch
    return originalFetch.call(global, input, init);
  };
}

export {};
