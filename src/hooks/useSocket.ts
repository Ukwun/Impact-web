'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { initializeSocket, getSocket, onNotification, onUpdate } from '@/lib/socket-client';

interface UseSocketOptions {
  userId?: string;
  token?: string;
  enabled?: boolean;
}

/**
 * Hook for using Socket.IO in React components
 */
export function useSocket(options: UseSocketOptions = {}) {
  const { userId, token, enabled = true } = options;
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const socketRef = useRef<any>(null);

  // Initialize socket when user is available
  useEffect(() => {
    if (!enabled || !userId || !token) return;

    setIsLoading(true);
    try {
      const socket = initializeSocket(userId, token);
      socketRef.current = socket;

      const handleConnect = () => {
        console.log('Socket connected');
        setIsConnected(true);
      };

      const handleDisconnect = () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      };

      socket.on('connect', handleConnect);
      socket.on('disconnect', handleDisconnect);

      // Set initial state
      if (socket.connected) {
        setIsConnected(true);
      }

      setIsLoading(false);

      return () => {
        socket.off('connect', handleConnect);
        socket.off('disconnect', handleDisconnect);
      };
    } catch (error) {
      console.error('Failed to initialize socket:', error);
      setIsLoading(false);
    }
  }, [enabled, userId, token]);

  const subscribe = useCallback(
    (eventName: string, callback: (data: any) => void) => {
      const socket = getSocket();
      if (!socket) return;

      socket.on(eventName, callback);

      // Return unsubscribe function
      return () => {
        socket.off(eventName, callback);
      };
    },
    []
  );

  const emit = useCallback((eventName: string, data?: any) => {
    const socket = getSocket();
    if (!socket) return;
    socket.emit(eventName, data);
  }, []);

  return {
    isConnected,
    isLoading,
    subscribe,
    emit,
    socket: socketRef.current,
  };
}

/**
 * Hook for listening to notifications
 */
export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const { subscribe } = useSocket({ userId, enabled: !!userId });

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = subscribe('notification', (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    return unsubscribe;
  }, [userId, subscribe]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return {
    notifications,
    clearNotifications,
    dismissNotification,
  };
}

/**
 * Hook for real-time presence
 */
export function usePresence(roomId?: string) {
  const [users, setUsers] = useState<any[]>([]);
  const { subscribe, emit } = useSocket({ enabled: !!roomId });

  useEffect(() => {
    if (!roomId) return;

    // Join room
    emit('join:room', { roomId });

    // Listen for presence updates
    const unsubscribe = subscribe('presence:update', (data) => {
      setUsers(data.users);
    });

    return () => {
      emit('leave:room', { roomId });
      unsubscribe?.();
    };
  }, [roomId, subscribe, emit]);

  return { users };
}
