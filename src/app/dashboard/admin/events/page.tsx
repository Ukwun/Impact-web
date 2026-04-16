'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Loader,
  AlertCircle,
  Calendar,
  Users,
  Eye,
  MoreVertical,
  CheckCircle,
} from 'lucide-react';
import Link from 'next/link';

interface Event {
  id: string;
  title: string;
  eventDate: string;
  eventType: string;
  venue: string;
  _count?: { registrations: number };
  createdAt: string;
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/admin/events');
        if (!response.ok) throw new Error('Failed to fetch events');

        const data = await response.json();
        setEvents(data.data || []);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load events';
        setError(message);
        console.error('Error fetching events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const filteredEvents = events.filter((e) =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.venue.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (eventId: string) => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/admin/events/${eventId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete event');

      setEvents(events.filter((e) => e.id !== eventId));
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete event');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-white">Manage Events</h1>
          <p className="text-gray-400">Create, edit, and manage your events</p>
        </div>
        <Link href="/dashboard/admin/events/new">
          <Button variant="primary" className="gap-2">
            <Plus className="w-5 h-5" /> Create Event
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
          <Input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" /> Filters
        </Button>
      </div>

      {/* Error State */}
      {error && !loading && (
        <Card className="p-6 bg-danger-500/10 border border-danger-500/30">
          <div className="flex gap-3 items-start">
            <AlertCircle className="w-5 h-5 text-danger-500 mt-0.5" />
            <div>
              <p className="font-semibold text-danger-700">{error}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Card className="p-12 text-center">
          <Loader className="w-8 h-8 text-primary-500 mx-auto mb-4 animate-spin" />
          <p className="text-gray-400">Loading events...</p>
        </Card>
      )}

      {!loading && !error && (
        <>
          {/* Events Table */}
          {filteredEvents.length > 0 ? (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-dark-700 border-b border-dark-600">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-400">
                        Event
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-400">
                        Type
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-400">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-400">
                        Registrations
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-400">
                        Created
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-400">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-600">
                    {filteredEvents.map((event) => (
                      <tr
                        key={event.id}
                        className="hover:bg-dark-700/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-white max-w-xs line-clamp-1">
                              {event.title}
                            </p>
                            <p className="text-xs text-gray-400">{event.venue}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary-500/20 text-primary-300">
                            {event.eventType}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-white">
                            {new Date(event.eventDate).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-white">
                              {event._count?.registrations || 0}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-400">
                            {new Date(event.createdAt).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/dashboard/events/${event.id}`}>
                              <Button
                                size="sm"
                                variant="outline"
                                title="View"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Link href={`/dashboard/admin/events/${event.id}/edit`}>
                              <Button
                                size="sm"
                                variant="outline"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </Link>
                            <button
                              onClick={() => setShowDeleteConfirm(event.id)}
                              className="p-2 rounded-lg bg-dark-700 hover:bg-danger-500/20 text-gray-400 hover:text-danger-400 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            <Card className="p-12 text-center">
              <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-white mb-2">No Events Found</h3>
              <p className="text-gray-400 mb-6">
                {searchQuery ? 'No events match your search' : 'Create your first event'}
              </p>
              <Link href="/dashboard/admin/events/new">
                <Button variant="primary" className="gap-2">
                  <Plus className="w-5 h-4" /> Create Event
                </Button>
              </Link>
            </Card>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-dark-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-2">
                Delete Event?
              </h3>
              <p className="text-gray-400 mb-6">
                This action cannot be undone. All registrations will be deleted.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowDeleteConfirm(null)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  className="flex-1 bg-danger-600 hover:bg-danger-700"
                  onClick={() => handleDelete(showDeleteConfirm)}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
