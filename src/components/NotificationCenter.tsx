'use client';

import { useEffect, useRef, useState } from 'react';
import { Bell, X, CheckCheck, Trash2, Clock, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import { NotificationType } from '@/types/notification';

export function NotificationCenter() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearNotifications,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const getNotificationIcon = (type: NotificationType) => {
    const iconProps = { className: 'w-4 h-4' };
    switch (type) {
      case 'success':
        return <CheckCircle {...iconProps} className="text-green-500" />;
      case 'error':
        return <AlertCircle {...iconProps} className="text-red-500" />;
      case 'warning':
        return <AlertCircle {...iconProps} className="text-yellow-500" />;
      case 'info':
      default:
        return <Info {...iconProps} className="text-blue-500" />;
    }
  };

  const getTypeColor = (type: NotificationType): string => {
    switch (type) {
      case 'success':
        return 'border-l-green-500 bg-green-500/10';
      case 'error':
        return 'border-l-red-500 bg-red-500/10';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-500/10';
      case 'info':
      default:
        return 'border-l-blue-500 bg-blue-500/10';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-dark-600"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <div className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-h-[32rem] overflow-hidden rounded-lg bg-dark-800 border border-dark-600 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-dark-600 px-4 py-3">
            <h3 className="font-semibold text-white">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-gray-400 hover:text-gray-300 px-2 py-1 rounded hover:bg-dark-600 transition"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-dark-600">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 border-l-4 transition-colors ${getTypeColor(
                      notification.type
                    )} ${!notification.read ? 'bg-dark-700' : ''}`}
                  >
                    <div className="flex gap-3">
                      {/* Icon */}
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium text-white text-sm">
                              {notification.title}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                              {notification.message}
                            </p>
                          </div>

                          {/* Unread Indicator */}
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                          )}
                        </div>

                        {/* Time */}
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTime(notification.timestamp)}
                        </p>

                        {/* Action Button */}
                        {notification.actionUrl && (
                          <a
                            href={notification.actionUrl}
                            className="text-xs text-primary-400 hover:text-primary-300 mt-2 inline-block"
                            onClick={() => {
                              markAsRead(notification.id);
                              setIsOpen(false);
                            }}
                          >
                            {notification.actionLabel || 'View'}
                          </a>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex-shrink-0">
                        <button
                          onClick={() => {
                            if (!notification.read) {
                              markAsRead(notification.id);
                            }
                          }}
                          className="text-gray-400 hover:text-gray-300 transition"
                          title={notification.read ? 'Already read' : 'Mark as read'}
                        >
                          {!notification.read && <CheckCheck className="w-4 h-4" />}
                        </button>
                        {notification.dismissible && (
                          <button
                            onClick={() => removeNotification(notification.id)}
                            className="text-gray-400 hover:text-red-500 transition ml-1"
                            title="Dismiss"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Priority Badge */}
                    {notification.priority !== 'medium' && (
                      <div className="mt-2">
                        <span className="text-xs px-2 py-0.5 rounded bg-dark-600 text-gray-400">
                          {notification.priority}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-dark-600 px-4 py-2 bg-dark-700">
              <button
                onClick={clearNotifications}
                className="text-xs text-gray-400 hover:text-gray-300 flex items-center gap-1 w-full justify-center py-1 rounded hover:bg-dark-600 transition"
              >
                <Trash2 className="w-3 h-3" />
                Clear All
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
