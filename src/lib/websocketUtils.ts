/**
 * WebSocket utilities for real-time updates (alerts, notifications, etc.)
 * 
 * Usage:
 * const ws = useWebSocket('wss://api.example.com/alerts', (data) => {
 *   console.log('Received alert:', data);
 * });
 * 
 * ws.addEventListener('alert', (data) => {
 *   // Handle alert
 * });
 * 
 * ws.send({ type: 'subscribe', channel: 'alerts' });
 */

export type WebSocketEventType = 'alert' | 'notification' | 'update' | 'connected' | 'disconnected' | 'error';

export interface WebSocketMessage<T = any> {
  type: string;
  channel?: string;
  data?: T;
  timestamp?: string;
  id?: string;
}

export interface WebSocketAlert {
  id: string;
  title: string;
  message: string;
  severity: 'critical' | 'warning' | 'info';
  timestamp: string;
  resolved?: boolean;
  category?: string;
}

/**
 * Managed WebSocket connection with event handling
 */
export class ManagedWebSocket {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private eventHandlers: Map<string, Set<(data: any) => void>> = new Map();
  private isIntentionallyClosed = false;

  constructor(url: string) {
    this.url = url;
    this.connect();
  }

  private connect(): void {
    try {
      this.ws = new WebSocket(this.url);
      this.setupEventHandlers();
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.attemptReconnect();
    }
  }

  private setupEventHandlers(): void {
    if (!this.ws) return;

    this.ws.addEventListener('open', () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.emit('connected', { timestamp: new Date().toISOString() });
    });

    this.ws.addEventListener('message', (event) => {
      try {
        const message = JSON.parse(event.data) as WebSocketMessage;
        this.emit(message.type, message.data || message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    });

    this.ws.addEventListener('error', (event) => {
      console.error('WebSocket error:', event);
      this.emit('error', { message: 'WebSocket connection error' });
    });

    this.ws.addEventListener('close', () => {
      console.log('WebSocket disconnected');
      this.emit('disconnected', { timestamp: new Date().toISOString() });

      if (!this.isIntentionallyClosed) {
        this.attemptReconnect();
      }
    });
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`Reconnecting in ${delay}ms...`);
    setTimeout(() => {
      this.connect();
    }, delay);
  }

  /**
   * Register event handler
   */
  addEventListener(
    eventType: WebSocketEventType | string,
    handler: (data: any) => void
  ): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Set());
    }
    this.eventHandlers.get(eventType)?.add(handler);
  }

  /**
   * Remove event handler
   */
  removeEventListener(
    eventType: WebSocketEventType | string,
    handler: (data: any) => void
  ): void {
    this.eventHandlers.get(eventType)?.delete(handler);
  }

  /**
   * Emit event to all listeners
   */
  private emit(eventType: string, data: any): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in event handler for ${eventType}:`, error);
        }
      });
    }
  }

  /**
   * Send message through WebSocket
   */
  send(message: WebSocketMessage | string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket is not connected');
      return;
    }

    const data = typeof message === 'string' ? message : JSON.stringify(message);
    this.ws.send(data);
  }

  /**
   * Subscribe to a channel
   */
  subscribe(channel: string): void {
    this.send({
      type: 'subscribe',
      channel,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Unsubscribe from a channel
   */
  unsubscribe(channel: string): void {
    this.send({
      type: 'unsubscribe',
      channel,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Get connection status
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Close connection
   */
  close(): void {
    this.isIntentionallyClosed = true;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

/**
 * React hook for WebSocket management
 */
export function useWebSocket(
  url: string | null,
  onMessage?: (data: any) => void
): ManagedWebSocket | null {
  const [ws, setWs] = React.useState<ManagedWebSocket | null>(null);

  React.useEffect(() => {
    if (!url) return;

    const websocket = new ManagedWebSocket(url);

    if (onMessage) {
      websocket.addEventListener('alert', onMessage);
    }

    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, [url, onMessage]);

  return ws;
}

/**
 * Hook for subscribing to alerts
 */
export function useRealtimeAlerts(enabled: boolean = true) {
  const [alerts, setAlerts] = React.useState<WebSocketAlert[]>([]);
  const [isConnected, setIsConnected] = React.useState(false);

  const ws = useWebSocket(
    enabled ? process.env.NEXT_PUBLIC_WS_URL || null : null,
    (data: WebSocketAlert) => {
      setAlerts((prev) => {
        const updated = [data, ...prev];
        // Keep only last 50 alerts
        return updated.slice(0, 50);
      });
    }
  );

  React.useEffect(() => {
    if (!ws) return;

    ws.addEventListener('connected', () => setIsConnected(true));
    ws.addEventListener('disconnected', () => setIsConnected(false));

    ws.subscribe('alerts');

    return () => {
      ws.unsubscribe('alerts');
    };
  }, [ws]);

  return {
    alerts,
    isConnected,
    ws,
  };
}

// Import React at top of file
import * as React from 'react';

/**
 * Fallback alert polling when WebSocket is unavailable
 * Polls API endpoint for new alerts
 */
export function useAlertPolling(
  enabled: boolean = true,
  pollInterval: number = 30000 // 30 seconds
) {
  const [alerts, setAlerts] = React.useState<WebSocketAlert[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (!enabled) return;

    const pollAlerts = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('auth_token');
        const response = await fetch('/api/admin/alerts', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const allAlerts = [
            ...data.data.critical,
            ...data.data.warnings,
            ...data.data.info,
          ];
          setAlerts(allAlerts);
        }
      } catch (error) {
        console.error('Error polling alerts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    pollAlerts();
    const interval = setInterval(pollAlerts, pollInterval);

    return () => clearInterval(interval);
  }, [enabled, pollInterval]);

  return {
    alerts,
    isLoading,
  };
}
