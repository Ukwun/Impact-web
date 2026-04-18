'use client';

import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

/**
 * Initialize Socket.IO client connection
 * Must be called after user authentication
 */
export function initializeSocket(userId: string, token: string): Socket {
  if (socket?.connected) {
    return socket;
  }

  // Determine socket URL based on deployment environment
  let socketUrl: string;
  
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    
    // Development: localhost
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      socketUrl = 'http://localhost:3000';
    }
    // Production: Netlify frontend
    else if (origin.includes('netlify.app')) {
      socketUrl = 'https://impactweb-backend.onrender.com';
    }
    // Fallback: use environment variable or same origin
    else {
      socketUrl = 
        process.env.NEXT_PUBLIC_SOCKET_URL || 
        process.env.NEXT_PUBLIC_API_URL || 
        origin;
    }
  } else {
    // Server-side fallback (shouldn't happen in practice)
    socketUrl = 
      process.env.NEXT_PUBLIC_SOCKET_URL || 
      process.env.NEXT_PUBLIC_API_URL || 
      'https://impactweb-backend.onrender.com';
  }

  console.log('🔌 Socket URL:', socketUrl);

  socket = io(socketUrl, {
    auth: {
      userId,
      token,
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    transports: ['websocket', 'polling'],
  });

  // Connection event handlers
  socket.on('connect', () => {
    console.log('✅ WebSocket connected:', socket?.id);
  });

  socket.on('connect_error', (error) => {
    console.error('❌ Connection error:', error);
  });

  socket.on('disconnect', (reason) => {
    console.warn('⚠️ WebSocket disconnected:', reason);
  });

  return socket;
}

/**
 * Get existing socket instance
 */
export function getSocket(): Socket | null {
  return socket;
}

/**
 * Disconnect socket
 */
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

/**
 * Subscribe to user notifications
 */
export function onNotification(
  callback: (notification: any) => void
): void {
  if (!socket) return;
  socket.on('notification', callback);
}

/**
 * Subscribe to real-time updates
 */
export function onUpdate(
  eventName: string,
  callback: (data: any) => void
): void {
  if (!socket) return;
  socket.on(eventName, callback);
}

/**
 * Send event to server
 */
export function emitEvent(eventName: string, data?: any) {
  if (!socket) {
    console.warn('Socket not initialized');
    return;
  }
  socket.emit(eventName, data);
}

/**
 * Emit and wait for response
 */
export function emitWithAck(
  eventName: string,
  data?: any
): Promise<any> {
  return new Promise((resolve, reject) => {
    if (!socket) {
      reject(new Error('Socket not initialized'));
      return;
    }
    socket.emit(eventName, data, (response: any) => {
      resolve(response);
    });
  });
}

/**
 * Join room
 */
export function joinRoom(roomId: string) {
  if (!socket) return;
  socket.emit('join:room', { roomId });
}

/**
 * Leave room
 */
export function leaveRoom(roomId: string) {
  if (!socket) return;
  socket.emit('leave:room', { roomId });
}

/**
 * Send typing indicator
 */
export function notifyTyping(roomId: string) {
  if (!socket) return;
  socket.emit('user:typing', { roomId });
}

/**
 * Clear typing indicator
 */
export function notifyStopTyping(roomId: string) {
  if (!socket) return;
  socket.emit('user:stop-typing', { roomId });
}

/**
 * Keep connection alive with ping
 */
export function startKeepAlive() {
  if (!socket) return;

  setInterval(() => {
    socket?.emit('ping', (response: any) => {
      // Successfully pinged
    });
  }, 30000); // Ping every 30 seconds
}
