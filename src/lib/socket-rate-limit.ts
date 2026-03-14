import { Socket } from 'socket.io';

interface RateLimitConfig {
  maxEvents: number;
  windowMs: number; // in milliseconds
}

interface UserRateLimit {
  eventCounts: Map<string, number[]>; // event name -> timestamps
  lastCleanup: number;
}

const rateLimits = new Map<string, UserRateLimit>();

const defaultConfig: Record<string, RateLimitConfig> = {
  'user:typing': { maxEvents: 10, windowMs: 1000 }, // 10 per second
  'user:stop-typing': { maxEvents: 10, windowMs: 1000 },
  'join:room': { maxEvents: 5, windowMs: 1000 }, // 5 per second
  'leave:room': { maxEvents: 5, windowMs: 1000 },
  'message:send': { maxEvents: 5, windowMs: 1000 }, // 5 messages per second
  'quiz:submit': { maxEvents: 1, windowMs: 5000 }, // 1 submission per 5 seconds
  'assignment:submit': { maxEvents: 1, windowMs: 5000 }, // 1 per 5 seconds
  'progress:update': { maxEvents: 10, windowMs: 1000 }, // 10 per second
};

/**
 * Check if event exceeds rate limit for user
 */
export function checkRateLimit(
  userId: string,
  eventName: string,
  config?: RateLimitConfig
): boolean {
  const cfg = config || defaultConfig[eventName];
  if (!cfg) return true; // Allow if no config

  const now = Date.now();
  let userLimit = rateLimits.get(userId);

  // Create new entry if doesn't exist
  if (!userLimit) {
    userLimit = {
      eventCounts: new Map(),
      lastCleanup: now,
    };
    rateLimits.set(userId, userLimit);
  }

  // Cleanup old entries every 60 seconds
  if (now - userLimit.lastCleanup > 60000) {
    cleanupOldEntries(userLimit, now);
    userLimit.lastCleanup = now;
  }

  // Get timestamps for this event
  let timestamps = userLimit.eventCounts.get(eventName) || [];

  // Remove timestamps outside the window
  const windowStart = now - cfg.windowMs;
  timestamps = timestamps.filter((ts) => ts > windowStart);

  // Check if limit exceeded
  if (timestamps.length >= cfg.maxEvents) {
    return false; // Rate limited
  }

  // Add current timestamp
  timestamps.push(now);
  userLimit.eventCounts.set(eventName, timestamps);

  return true; // Allowed
}

/**
 * Cleanup old entries from user rate limit
 */
function cleanupOldEntries(userLimit: UserRateLimit, now: number) {
  for (const [eventName, timestamps] of userLimit.eventCounts) {
    const filtered = timestamps.filter((ts) => ts > now - 300000); // Keep last 5 minutes
    if (filtered.length === 0) {
      userLimit.eventCounts.delete(eventName);
    } else {
      userLimit.eventCounts.set(eventName, filtered);
    }
  }
}

/**
 * Socket.IO middleware for rate limiting
 */
export function createRateLimitMiddleware(config?: Record<string, RateLimitConfig>) {
  const mergedConfig = { ...defaultConfig, ...(config || {}) };

  return (socket: Socket, next: (err?: Error) => void) => {
    const userId = socket.handshake.auth.userId;

    // Wrap emit to check rate limits
    const originalEmit = socket.emit.bind(socket);
    socket.emit = function (eventName: string, ...args: any[]) {
      if (eventName.startsWith('_')) {
        // Skip rate limiting for internal events
        return originalEmit(eventName, ...args);
      }

      const allowed = checkRateLimit(userId, eventName, mergedConfig[eventName]);

      if (!allowed) {
        console.warn(
          `⚠️ Rate limit exceeded for user ${userId} on event "${eventName}"`
        );
        return false;
      }

      return originalEmit(eventName, ...args);
    } as any;

    next();
  };
}

/**
 * Get rate limit stats for user
 */
export function getRateLimitStats(userId: string) {
  const userLimit = rateLimits.get(userId);
  if (!userLimit) return {};

  const stats: Record<string, number> = {};
  for (const [eventName, timestamps] of userLimit.eventCounts) {
    stats[eventName] = timestamps.length;
  }
  return stats;
}

/**
 * Reset rate limit for user
 */
export function resetUserRateLimit(userId: string) {
  rateLimits.delete(userId);
}

/**
 * Get all rate limit stats (for monitoring)
 */
export function getAllRateLimitStats() {
  const allStats: Record<string, Record<string, number>> = {};
  for (const [userId, userLimit] of rateLimits) {
    const stats: Record<string, number> = {};
    for (const [eventName, timestamps] of userLimit.eventCounts) {
      stats[eventName] = timestamps.length;
    }
    allStats[userId] = stats;
  }
  return allStats;
}
