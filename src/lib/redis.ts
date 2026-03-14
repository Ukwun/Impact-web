/**
 * Redis Client - Persistent Rate Limiting & Caching
 * Replaces in-memory storage for production environments
 */

import { createClient } from 'redis';
import type { RedisClientType } from 'redis';

let redisClient: RedisClientType | null = null;
let isConnecting = false;
let connectionAttempts = 0;
const MAX_RETRIES = 3;

/**
 * Get or create Redis client
 * Falls back to in-memory if Redis unavailable
 */
export async function getRedisClient(): Promise<RedisClientType | null> {
  // Return existing client if already connected
  if (redisClient && redisClient.isOpen) {
    return redisClient;
  }

  // Avoid multiple concurrent connection attempts
  if (isConnecting) {
    return null;
  }

  // Don't retry if we've exceeded max attempts
  if (connectionAttempts >= MAX_RETRIES) {
    return null;
  }

  isConnecting = true;
  connectionAttempts++;

  try {
    const url = process.env.REDIS_URL || 'redis://localhost:6379';

    redisClient = createClient({
      url,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > MAX_RETRIES) {
            console.warn('⚠️ Redis reconnection failed after max retries');
            return new Error('Max retries exceeded');
          }
          return Math.min(retries * 100, 3000);
        },
        connectTimeout: 5000,
        keepAlive: true,
      },
    });

    redisClient.on('error', (err) => {
      console.warn('⚠️ Redis error:', err.message);
      redisClient = null;
    });

    redisClient.on('connect', () => {
      console.log('✓ Connected to Redis');
      connectionAttempts = 0; // Reset on successful connection
    });

    redisClient.on('disconnect', () => {
      console.log('⚠️ Disconnected from Redis');
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    const err = error as Error;
    console.warn(`⚠️ Redis connection failed (attempt ${connectionAttempts}/${MAX_RETRIES}):`, err.message);
    redisClient = null;
    return null;
  } finally {
    isConnecting = false;
  }
}

/**
 * Disconnect Redis client gracefully
 */
export async function disconnectRedis(): Promise<void> {
  if (redisClient && redisClient.isOpen) {
    try {
      await redisClient.quit();
      redisClient = null;
      console.log('✓ Redis disconnected');
    } catch (error) {
      const err = error as Error;
      console.warn('⚠️ Error disconnecting Redis:', err.message);
    }
  }
}

/**
 * Set a key-value pair with expiration
 */
export async function setWithExpiry(key: string, value: string, expirySeconds: number): Promise<void> {
  try {
    const client = await getRedisClient();
    if (client && client.isOpen) {
      await client.setEx(key, expirySeconds, value);
    }
  } catch (error) {
    const err = error as Error;
    console.warn('⚠️ Redis set failed:', err.message);
  }
}

/**
 * Get a value by key
 */
export async function get(key: string): Promise<string | null> {
  try {
    const client = await getRedisClient();
    if (client && client.isOpen) {
      return await client.get(key);
    }
  } catch (error) {
    const err = error as Error;
    console.warn('⚠️ Redis get failed:', err.message);
  }
  return null;
}

/**
 * Delete a key
 */
export async function deleteKey(key: string): Promise<void> {
  try {
    const client = await getRedisClient();
    if (client && client.isOpen) {
      await client.del(key);
    }
  } catch (error) {
    const err = error as Error;
    console.warn('⚠️ Redis delete failed:', err.message);
  }
}

/**
 * Increment a counter with expiry
 * Used for rate limiting
 */
export async function incrementWithExpiry(
  key: string,
  expirySeconds: number
): Promise<number> {
  try {
    const client = await getRedisClient();
    if (client && client.isOpen) {
      const count = await client.incr(key);
      
      // Set expiry on first increment only
      if (count === 1) {
        await client.expire(key, expirySeconds);
      }
      
      return count;
    }
  } catch (error) {
    const err = error as Error;
    console.warn('⚠️ Redis increment failed:', err.message);
  }
  return 0;
}

/**
 * Check connection status
 */
export async function isRedisAvailable(): Promise<boolean> {
  try {
    const client = await getRedisClient();
    return client !== null && client.isOpen;
  } catch {
    return false;
  }
}

// Auto-disconnect on process exit
if (typeof window === 'undefined') {
  process.on('SIGINT', async () => {
    await disconnectRedis();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await disconnectRedis();
    process.exit(0);
  });
}
