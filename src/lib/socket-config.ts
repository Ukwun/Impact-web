import { Socket } from 'socket.io';
import { createRateLimitMiddleware, checkRateLimit } from './socket-rate-limit';
import { setupStandardValidators, validateUserIdMatch } from './socket-validation';

/**
 * Apply all middleware and security layers to Socket.IO server
 */
export function configureSocketSecurity(socket: Socket) {
  const userId = socket.handshake.auth.userId;
  const token = socket.handshake.auth.token;

  // ============================================
  // 1. AUTHENTICATION CHECK
  // ============================================
  if (!userId || !token) {
    console.warn('⚠️ Socket connection attempt without auth');
    socket.emit('error', { message: 'Authentication required' });
    socket.disconnect(true);
    return;
  }

  console.log(`🔐 Authenticated socket for user: ${userId}`);

  // ============================================
  // 2. RATE LIMITING MIDDLEWARE
  // ============================================
  const originalOn = socket.on.bind(socket);
  socket.on = function (eventName: string, callback?: any): Socket {
    // Skip rate limiting for internal events
    if (eventName.startsWith('_') || eventName === 'ping' || eventName === 'pong') {
      return originalOn(eventName, callback);
    }

    // Wrap callback to check rate limit
    const rateLimitedCallback = (...args: any[]) => {
      const allowed = checkRateLimit(userId, eventName);

      if (!allowed) {
        console.warn(
          `⚠️ Rate limit exceeded for user ${userId} on event "${eventName}"`
        );
        socket.emit('error', {
          event: eventName,
          message: 'Rate limit exceeded',
        });
        return;
      }

      // Call original handler
      if (typeof callback === 'function') {
        callback(...args);
      }
    };

    return originalOn(eventName, rateLimitedCallback);
  } as any;

  // ============================================
  // 3. INPUT VALIDATION MIDDLEWARE
  // ============================================
  setupStandardValidators(socket);

  // ============================================
  // 4. USER ID VALIDATION
  // ============================================
  socket.on('progress:update', (data) => {
    if (!validateUserIdMatch(socket, userId)) {
      socket.emit('error', { message: 'User ID mismatch' });
      return;
    }
  });

  socket.on('assignment:submit', (data) => {
    if (!validateUserIdMatch(socket, userId)) {
      socket.emit('error', { message: 'User ID mismatch' });
      return;
    }
  });

  socket.on('quiz:submit', (data) => {
    if (!validateUserIdMatch(socket, userId)) {
      socket.emit('error', { message: 'User ID mismatch' });
      return;
    }
  });

  // ============================================
  // 5. CONNECTION LOGGING
  // ============================================
  socket.on('disconnect', (reason) => {
    console.log(`📤 User ${userId} disconnected (${reason})`);
  });

  socket.on('error', (error) => {
    console.error(`❌ Socket error for user ${userId}:`, error);
  });

  console.log(`✅ Security configured for socket: ${socket.id}`);
}

/**
 * Export rate limit config for custom limits
 */
export const customRateLimits = {
  'user:typing': { maxEvents: 15, windowMs: 1000 },
  'message:send': { maxEvents: 10, windowMs: 1000 },
  'quiz:submit': { maxEvents: 1, windowMs: 10000 }, // stricter for quiz
  'assignment:submit': { maxEvents: 1, windowMs: 10000 }, // stricter for assignments
  'progress:update': { maxEvents: 20, windowMs: 1000 },
};
