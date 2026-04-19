'use client';

/**
 * Admin Notifications Panel
 * Shows admin events like refund requests, course updates, critical alerts
 */

import { useState, useEffect, useRef } from 'react';
import { Bell, AlertCircle, CheckCircle, X, Settings } from 'lucide-react';
import { getAdminEvents, getUnreadAdminEventsCount, markAdminEventAsRead, subscribeToAdminEvents } from '@/lib/adminNotifications';
import type { AdminEvent } from '@/lib/adminNotifications';

export function AdminNotificationsPanel() {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Load initial events and subscribe to new ones
  useEffect(() => {
    const loadEvents = async () => {
      const initialEvents = await getAdminEvents(20);
      setEvents(initialEvents);

      const count = await getUnreadAdminEventsCount();
      setUnreadCount(count);
    };

    loadEvents();

    // Subscribe to real-time events
    const unsubscribe = subscribeToAdminEvents((newEvent) => {
      setEvents((prev) => [newEvent, ...prev.slice(0, 19)]);
      setUnreadCount((prev) => prev + 1);
    });

    return unsubscribe;
  }, []);

  // Close panel on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleMarkAsRead = async (eventId: string) => {
    await markAdminEventAsRead(eventId);
    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, read: true } : e))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const getSeverityColor = (severity: AdminEvent['severity']) => {
    switch (severity) {
      case 'critical':
        return 'border-red-500/50 bg-red-500/10';
      case 'high':
        return 'border-orange-500/50 bg-orange-500/10';
      case 'medium':
        return 'border-yellow-500/50 bg-yellow-500/10';
      case 'low':
        return 'border-gray-500/50 bg-gray-500/10';
    }
  };

  const getSeverityIcon = (severity: AdminEvent['severity']) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'medium':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'low':
        return <CheckCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-white transition"
        title="Admin Notifications"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {Math.min(unreadCount, 9)}
            </span>
          </>
        )}
      </button>

      {/* Notifications Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-dark-800 border border-dark-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-dark-800 border-b border-dark-700 px-4 py-3 flex items-center justify-between">
            <h3 className="font-semibold text-white">Admin Notifications</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Events List */}
          {events.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-sm">No notifications</div>
          ) : (
            <div className="divide-y divide-dark-700">
              {events.map((event) => (
                <div
                  key={event.id}
                  className={`p-4 border-l-4 transition ${getSeverityColor(
                    event.severity
                  )} ${event.read ? 'opacity-60' : 'opacity-100'}`}
                >
                  <div className="flex items-start gap-3">
                    {getSeverityIcon(event.severity)}

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white text-sm">{event.title}</p>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{event.message}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {event.timestamp.toLocaleTimeString()}
                      </p>
                    </div>

                    <button
                      onClick={() => handleMarkAsRead(event.id)}
                      disabled={event.read}
                      className={`flex-shrink-0 ml-2 text-xs font-medium px-2 py-1 rounded ${
                        event.read
                          ? 'text-gray-600 cursor-default'
                          : 'bg-primary-500/20 text-primary-400 hover:bg-primary-500/30'
                      }`}
                    >
                      {event.read ? '✓' : 'Mark read'}
                    </button>
                  </div>

                  {event.actionUrl && (
                    <a
                      href={event.actionUrl}
                      className="text-xs text-primary-400 hover:text-primary-300 mt-2 block font-medium"
                    >
                      View Details →
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="sticky bottom-0 bg-dark-800 border-t border-dark-700 px-4 py-3">
            <a
              href="/dashboard/admin/notifications"
              className="text-xs text-primary-400 hover:text-primary-300 font-medium flex items-center gap-1"
            >
              <Settings className="w-3 h-3" />
              View all notifications
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
