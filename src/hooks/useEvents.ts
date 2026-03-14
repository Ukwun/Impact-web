'use client';

import { useState, useEffect } from 'react';

interface Event {
  id: string;
  title: string;
  description: string;
  image?: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  venue: string;
  location: string;
  eventType: string;
  capacity: number;
  registrationCount: number;
  createdBy: { name: string };
  createdAt: string;
  isLoading?: boolean;
}

interface UseEventsReturn {
  events: Event[];
  loading: boolean;
  error: string | null;
}

/**
 * useEvents Hook
 * Fetches upcoming events from the API
 */
export function useEvents(limit: number = 10): UseEventsReturn {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/events?limit=${limit}`);

        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }

        const data = await response.json();
        setEvents(data.data.events);
        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An error occurred';
        setError(message);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [limit]);

  return { events, loading, error };
}
