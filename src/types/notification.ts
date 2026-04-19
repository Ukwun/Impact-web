// Notification types and interfaces
export type NotificationType = 'info' | 'success' | 'warning' | 'error';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  dismissible?: boolean;
  duration?: number; // Auto-dismiss in milliseconds
  metadata?: {
    userId?: string;
    courseId?: string;
    eventId?: string;
    [key: string]: any;
  };
}

export interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  isLoading: boolean;
  error: string | null;
}

// Example notification creation helper
export function createNotification(
  title: string,
  message: string,
  type: NotificationType = 'info',
  options?: Partial<Notification>
): Omit<Notification, 'id' | 'timestamp' | 'read'> {
  return {
    title,
    message,
    type,
    priority: options?.priority || 'medium',
    actionUrl: options?.actionUrl,
    actionLabel: options?.actionLabel,
    dismissible: options?.dismissible !== false,
    duration: options?.duration,
    metadata: options?.metadata,
  };
}
