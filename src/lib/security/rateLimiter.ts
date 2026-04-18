/**
 * Rate Limiting System
 * Prevents brute force attacks on auth endpoints and APIs
 * Uses Redis for persistence (production), falls back to in-memory
 */

import { incrementWithExpiry, deleteKey, isRedisAvailable } from '../redis';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  message: string;
}

// In-memory storage for rate limit tracking
// In production, use Redis or a database
const rateLimitStore = new Map<string, RateLimitEntry>();

// Default configurations for different route types
export const RATE_LIMIT_CONFIGS = {
  // CRITICAL: Auth endpoints - very strict
  AUTH_LOGIN: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // Max 5 attempts
    message: 'Too many login attempts. Please try again after 15 minutes.',
  } as RateLimitConfig,

  AUTH_SIGNUP: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // Max 10 signup attempts per minute (for testing)
    message: 'Too many signup attempts. Please try again after 1 minute.',
  } as RateLimitConfig,

  AUTH_PASSWORD_RESET: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3, // Max 3 reset attempts
    message: 'Too many password reset requests. Please try again after 1 hour.',
  } as RateLimitConfig,

  // Less strict for regular API calls
  GENERAL_API: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // Max 100 requests per minute
    message: 'Too many requests. Please try again shortly.',
  } as RateLimitConfig,

  // File upload endpoint
  FILE_UPLOAD: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10, // Max 10 uploads per hour
    message: 'Too many file uploads. Please try again after 1 hour.',
  } as RateLimitConfig,
} as const;

/**
 * Clean up expired entries from the rate limit store
 * Should be called periodically (every hour)
 */
export function cleanupExpiredEntries(): void {
  const now = Date.now();
  const expiredKeys: string[] = [];

  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      expiredKeys.push(key);
    }
  }

  expiredKeys.forEach((key) => rateLimitStore.delete(key));
}

/**
 * Check if a request should be rate limited
 * Uses Redis for persistence when available
 * Falls back to in-memory storage
 * @param identifier - Unique identifier (IP address, user ID, email, etc.)
 * @param config - Rate limit configuration
 * @returns { allowed: boolean, remaining: number, resetTime: number }
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const key = `ratelimit:${identifier}`;
  const expirySeconds = Math.ceil(config.windowMs / 1000);

  // Try to use Redis if available
  const redisAvailable = await isRedisAvailable();
  
  if (redisAvailable) {
    try {
      const count = await incrementWithExpiry(key, expirySeconds);

      if (count > config.maxRequests) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: Date.now() + config.windowMs,
        };
      }

      return {
        allowed: true,
        remaining: config.maxRequests - count,
        resetTime: Date.now() + config.windowMs,
      };
    } catch (error) {
      console.warn('⚠️ Redis rate limit check failed, falling back to in-memory');
      // Fall through to in-memory implementation
    }
  }

  // Fallback to in-memory rate limiting
  return checkRateLimitInMemory(identifier, config);
}

/**
 * In-memory fallback for rate limiting
 */
function checkRateLimitInMemory(
  identifier: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // If no entry exists or time window has passed, reset
  if (!entry || entry.resetTime < now) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + config.windowMs,
    });

    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: now + config.windowMs,
    };
  }

  // Check if limit exceeded
  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  // Increment counter
  entry.count++;

  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Reset rate limit for a specific identifier
 */
export async function resetRateLimit(identifier: string): Promise<void> {
  const key = `ratelimit:${identifier}`;
  
  // Try to delete from Redis
  try {
    const redisAvailable = await isRedisAvailable();
    if (redisAvailable) {
      await deleteKey(key);
    }
  } catch (error) {
    console.warn('⚠️ Redis delete failed, continuing with in-memory cleanup');
  }
  
  // Also delete from in-memory
  rateLimitStore.delete(identifier);
}

/**
 * Get rate limit status for monitoring
 */
export function getRateLimitStatus(identifier: string): RateLimitEntry | null {
  return rateLimitStore.get(identifier) || null;
}

/**
 * Extract IP address from request headers
 * Works with proxies (CloudFlare, Nginx, etc.)
 */
export function getClientIp(headers: Record<string, any>): string {
  return (
    headers['x-forwarded-for']?.split(',')[0].trim() ||
    headers['x-real-ip'] ||
    headers['cf-connecting-ip'] ||
    headers['x-client-ip'] ||
    'unknown'
  );
}

// Cleanup expired entries every hour
if (typeof window === 'undefined') {
  setInterval(() => {
    cleanupExpiredEntries();
  }, 60 * 60 * 1000);
}
