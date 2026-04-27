'use client';

import { useState, useEffect, useCallback } from 'react';

export interface Event {
  id: string;
  title: string;
  description?: string;
  eventDate: string;
  startTime: string;
  endTime?: string;
  venue: string;
  capacity?: number;
  eventType: string;
  imageUrl?: string;
  price?: number;
  isFree: boolean;
  agenda?: string;
  tags?: string[];
  organizer?: { id: string; name: string };
  _count?: { registrations: number };
  location?: string;
  image?: string;
  registrationCount?: number;
  createdBy?: { name: string };
  createdAt?: string;
}

export interface EventFilters {
  search?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  upcomingOnly?: boolean;
}

interface UseEventsReturn {
  events: Event[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  filter: (filters: EventFilters) => Promise<void>;
}

/**
 * useEvents Hook
 * Fetches and manages events with filtering capabilities
 */
export function useEvents(limit: number = 50): UseEventsReturn {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async (filters?: EventFilters) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.set('limit', limit.toString());

      if (filters?.search) {
        params.set('search', filters.search);
      }
      if (filters?.category) {
        params.set('category', filters.category);
      }
      if (filters?.startDate) {
        params.set('startDate', filters.startDate);
      }
      if (filters?.endDate) {
        params.set('endDate', filters.endDate);
      }
      if (filters?.upcomingOnly) {
        params.set('upcomingOnly', 'true');
      }

      const response = await fetch(`/api/events?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

      const data = await response.json();
      setEvents(Array.isArray(data.data) ? data.data : data.events || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  const refetch = useCallback(async () => {
    await fetchEvents();
  }, [fetchEvents]);

  const filter = useCallback(
    async (filters: EventFilters) => {
      await fetchEvents(filters);
    },
    [fetchEvents]
  );

  // Initial fetch on mount
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return { events, loading, error, refetch, filter };
}

/**
 * useEvent Hook
 * Fetches a single event by ID
 */
export function useEvent(eventId: string) {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/events/${eventId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch event');
      }

      const data = await response.json();
      setEvent(data.data || data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      console.error('Error fetching event:', err);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    if (eventId) {
      fetchEvent();
    }
  }, [eventId, fetchEvent]);

  return { event, loading, error, refetch: fetchEvent };
}

/**
 * useEventRegistration Hook
 * Manages event registration for the current user
 */
export function useEventRegistration(eventId: string) {
  const [registration, setRegistration] = useState<any | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = typeof window !== 'undefined'
        ? (localStorage.getItem('auth_token') || localStorage.getItem('token'))
        : null;

      const response = await fetch(`/api/events/${eventId}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        throw new Error('Failed to register for event');
      }

      const data = await response.json();
      setRegistration(data.data);
      setIsRegistered(true);
      return data.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  const unregister = useCallback(async (_registrationId: string) => {
    try {
      setLoading(true);
      setError(null);

      const token = typeof window !== 'undefined'
        ? (localStorage.getItem('auth_token') || localStorage.getItem('token'))
        : null;

      const response = await fetch(`/api/events/${eventId}/register`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (!response.ok) {
        throw new Error('Failed to cancel registration');
      }

      setRegistration(null);
      setIsRegistered(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  const checkRegistration = useCallback(async () => {
    try {
      setLoading(true);
      const token = typeof window !== 'undefined'
        ? (localStorage.getItem('auth_token') || localStorage.getItem('token'))
        : null;
      const response = await fetch('/api/events/my-registrations', {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (response.ok) {
        const data = await response.json();
        const registrationMatch = (data.data || []).find((reg: any) => reg.eventId === eventId);
        if (registrationMatch) {
          setRegistration(registrationMatch);
          setIsRegistered(true);
        } else {
          setRegistration(null);
          setIsRegistered(false);
        }
      }
    } catch (err) {
      console.error('Error checking registration:', err);
      setIsRegistered(false);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  return { registration, isRegistered, loading, error, register, unregister, checkRegistration };
}
