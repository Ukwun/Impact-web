'use client';

import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AUTH_TOKEN_KEY } from '@/lib/authStorage';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  X,
  AlertCircle,
  Loader,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

interface EventRegistration {
  id: string;
  eventId: string;
  status: 'REGISTERED' | 'ATTENDED' | 'CANCELLED' | 'NO_SHOW';
  registeredAt: string;
  attendedAt: string | null;
  event: {
    id: string;
    title: string;
    description: string;
    eventDate: string;
    startTime: string;
    endTime: string;
    venue: string;
    location: string;
    eventType: string;
    capacity: number;
    image?: string;
    _count?: { registrations: number };
  };
}

export default function MyEventsDashboard() {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'attended' | 'cancelled'>('upcoming');

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        const headers: any = {};
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch('/api/events/my-registrations', { headers });
        if (!response.ok) throw new Error('Failed to fetch registrations');

        const data = await response.json();
        setRegistrations(data.data || []);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load registrations';
        setError(message);
        console.error('Error fetching registrations:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchRegistrations();
    }
  }, [user]);

  const filteredRegistrations = registrations.filter((reg) => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') {
      return reg.status === 'REGISTERED' && new Date(reg.event.eventDate) > new Date();
    }
    if (filter === 'attended') return reg.status === 'ATTENDED';
    if (filter === 'cancelled') return reg.status === 'CANCELLED';
    return true;
  });

  const handleUnregister = async (eventId: string, registrationId: string) => {
    if (!confirm('Are you sure you want to unregister from this event?')) return;

    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      const response = await fetch(`/api/events/${eventId}/register`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to unregister');

      // Update local state instead of full refetch
      setRegistrations((prev) =>
        prev.map((reg) =>
          reg.id === registrationId ? { ...reg, status: 'CANCELLED' } : reg
        )
      );
    } catch (err) {
      console.error('Error unregistering:', err);
      alert('Failed to unregister from event');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      REGISTERED: 'bg-primary-100 text-primary-700 border border-primary-200',
      ATTENDED: 'bg-green-100 text-green-700 border border-green-200',
      CANCELLED: 'bg-gray-100 text-gray-700 border border-gray-200',
      NO_SHOW: 'bg-danger-100 text-danger-700 border border-danger-200',
    };
    return styles[status] || styles.REGISTERED;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ATTENDED':
        return <CheckCircle className="w-4 h-4" />;
      case 'CANCELLED':
        return <X className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  // Calculate stats
  const stats = {
    upcoming: registrations.filter((r) => r.status === 'REGISTERED' && new Date(r.event.eventDate) > new Date()).length,
    attended: registrations.filter((r) => r.status === 'ATTENDED').length,
    cancelled: registrations.filter((r) => r.status === 'CANCELLED').length,
    total: registrations.length,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-4xl font-black text-white">My Events</h1>
        <p className="text-gray-400">Track and manage your event registrations</p>
      </div>

      {/* Stats Cards */}
      {!loading && !error && stats.total > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-dark-700/50 border border-primary-500/30">
            <p className="text-xs text-gray-400 font-semibold mb-1">Upcoming</p>
            <p className="text-3xl font-black text-primary-400">{stats.upcoming}</p>
          </Card>
          <Card className="p-4 bg-dark-700/50 border border-green-500/30">
            <p className="text-xs text-gray-400 font-semibold mb-1">Attended</p>
            <p className="text-3xl font-black text-green-400">{stats.attended}</p>
          </Card>
          <Card className="p-4 bg-dark-700/50 border border-secondary-500/30">
            <p className="text-xs text-gray-400 font-semibold mb-1">Total Events</p>
            <p className="text-3xl font-black text-secondary-400">{stats.total}</p>
          </Card>
          <Card className="p-4 bg-dark-700/50 border border-yellow-500/30">
            <p className="text-xs text-gray-400 font-semibold mb-1">Attendance Rate</p>
            <p className="text-3xl font-black text-yellow-400">
              {stats.total > 0 ? Math.round((stats.attended / stats.total) * 100) : 0}%
            </p>
          </Card>
        </div>
      )}

      {/* Filter Buttons */}
      {!loading && !error && stats.total > 0 && (
        <div className="flex gap-3 flex-wrap">
          {[
            { key: 'upcoming', label: 'Upcoming', count: stats.upcoming },
            { key: 'attended', label: 'Attended', count: stats.attended },
            { key: 'cancelled', label: 'Cancelled', count: stats.cancelled },
            { key: 'all', label: 'All Events', count: stats.total },
          ].map((f) => (
            <Button
              key={f.key}
              variant={filter === f.key ? 'primary' : 'outline'}
              onClick={() => setFilter(f.key as any)}
              className="text-sm"
            >
              {f.label} ({f.count})
            </Button>
          ))}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <Card className="p-12 text-center">
          <Loader className="w-8 h-8 text-primary-500 mx-auto mb-4 animate-spin" />
          <p className="text-gray-400">Loading your event registrations...</p>
        </Card>
      )}

      {/* Error State */}
      {error && !loading && (
        <Card className="p-6 bg-danger-500/10 border border-danger-500/30">
          <div className="flex gap-3 items-start">
            <AlertCircle className="w-5 h-5 text-danger-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-danger-700">{error}</p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => window.location.reload()}
                className="mt-3"
              >
                Retry
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* No Events State */}
      {!loading && !error && stats.total === 0 && (
        <Card className="p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-500 mb-2">No event registrations yet</h3>
          <p className="text-gray-400 mb-6">Explore upcoming events and register to get started</p>
          <Link href="/dashboard/events/explore">
            <Button variant="primary">
              Browse Events
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </Card>
      )}

      {/* Registrations Grid */}
      {!loading && !error && filteredRegistrations.length > 0 && (
        <div className="grid gap-6">
          {filteredRegistrations.map((reg) => {
            const eventDate = new Date(reg.event.eventDate);
            const now = new Date();
            const isPast = eventDate < now;
            const daysUntil = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

            return (
              <Card key={reg.id} className="overflow-hidden hover:shadow-lg  transition-all">
                <div className="flex flex-col md:flex-row gap-6 p-6">
                  {/* Event Visual */}
                  <div className="w-full md:w-40 h-32 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                    {reg.event.image ? (
                      <img
                        src={reg.event.image}
                        alt={reg.event.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Calendar className="w-12 h-12 text-white opacity-80" />
                    )}
                    {daysUntil > 0 && daysUntil <= 7 && reg.status === 'REGISTERED' && (
                      <div className="absolute top-2 right-2 bg-danger-500 text-white px-2 py-1 rounded text-xs font-bold">
                        {daysUntil} day{daysUntil !== 1 ? 's' : ''} left
                      </div>
                    )}
                  </div>

                  {/* Event Details */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-1">{reg.event.title}</h3>
                        <p className="text-gray-400 text-sm line-clamp-2">{reg.event.description}</p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 ${getStatusBadge(
                          reg.status
                        )}`}
                      >
                        {getStatusIcon(reg.status)}
                        {reg.status}
                      </span>
                    </div>

                    {/* Event Metadata */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-300">
                        <Calendar className="w-4 h-4 text-primary-400 flex-shrink-0" />
                        <span>{eventDate.toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <Clock className="w-4 h-4 text-primary-400 flex-shrink-0" />
                        <span>{reg.event.startTime}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <MapPin className="w-4 h-4 text-primary-400 flex-shrink-0" />
                        <span className="truncate">{reg.event.venue}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <Users className="w-4 h-4 text-primary-400 flex-shrink-0" />
                        <span>{reg.event._count?.registrations || 0} attending</span>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="text-sm text-gray-400 pt-1 border-t border-dark-600">
                      <span className="font-semibold">Location:</span> {reg.event.location}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 justify-center md:w-32 flex-shrink-0">
                    <Link href={`/dashboard/events/${reg.event.id}`}>
                      <Button variant="primary" size="sm" className="w-full">
                        View Details
                      </Button>
                    </Link>
                    {reg.status === 'REGISTERED' && !isPast && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnregister(reg.event.id, reg.id)}
                        className="w-full text-danger-400 border-danger-500/30 hover:bg-danger-500/10"
                      >
                        Unregister
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Empty State for filtered view */}
      {!loading && !error && stats.total > 0 && filteredRegistrations.length === 0 && (
        <Card className="p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-500 mb-2">No {filter} events</h3>
          <p className="text-gray-400">Try changing the filter to see other registrations</p>
        </Card>
      )}
    </div>
  );
}
