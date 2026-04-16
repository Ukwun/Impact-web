'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Search,
  Loader,
  AlertCircle,
  Filter,
  Calendar,
  MapPin,
  Users,
  Clock,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

interface Event {
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
  _count?: { registrations: number };
}

export default function EventsDashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/events?limit=100');
        if (!response.ok) throw new Error('Failed to fetch events');

        const data = await response.json();
        const allEvents = data.data || [];
        setEvents(allEvents);
        setFilteredEvents(allEvents);
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

  // Filter events
  useEffect(() => {
    let filtered = events;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.title.toLowerCase().includes(query) ||
          e.description?.toLowerCase().includes(query) ||
          e.venue.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter((e) => e.eventType === selectedCategory);
    }

    setFilteredEvents(filtered);
  }, [searchQuery, selectedCategory, events]);

  // Get unique categories
  const categories = Array.from(new Set(events.map((e) => e.eventType))).sort();

  // Separate upcoming and past events
  const upcomingEvents = filteredEvents.filter((e) => new Date(e.eventDate) >= new Date());
  const pastEvents = filteredEvents.filter((e) => new Date(e.eventDate) < new Date());

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-4xl font-black text-white">Events</h1>
        <p className="text-gray-400">
          Discover and register for upcoming community events and workshops
        </p>
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
        <div className="space-y-8">
          {/* Search and Filters */}
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <Input
                type="text"
                placeholder="Search events by title, venue, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>

            {/* Filter Button and Category Chips */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant={showFilters ? 'primary' : 'outline'}
                  onClick={() => setShowFilters(!showFilters)}
                  className="gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                </Button>

                {/* Selected Filter Badge */}
                {selectedCategory && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedCategory(null)}
                    className="gap-2"
                  >
                    {selectedCategory} ✕
                  </Button>
                )}
              </div>

              {/* Quick Stats */}
              <div className="text-sm text-gray-400">
                {filteredEvents.length === events.length
                  ? `${events.length} event${events.length !== 1 ? 's' : ''}`
                  : `${filteredEvents.length} of ${events.length} events`}
              </div>
            </div>

            {/* Category Filter Menu */}
            {showFilters && (
              <Card className="p-4 space-y-3">
                <p className="text-sm font-semibold text-white">Event Type</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={selectedCategory === null ? 'primary' : 'outline'}
                    onClick={() => setSelectedCategory(null)}
                  >
                    All Categories
                  </Button>
                  {categories.map((category) => (
                    <Button
                      key={category}
                      size="sm"
                      variant={selectedCategory === category ? 'primary' : 'outline'}
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Featured Events Section */}
          {upcomingEvents.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Upcoming Events</h2>
                {upcomingEvents.length > 4 && (
                  <Link
                    href="/dashboard/events/calendar"
                    className="text-primary-400 hover:text-primary-300 text-sm font-semibold flex items-center gap-1"
                  >
                    View Calendar <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingEvents.slice(0, 6).map((event) => {
                  const eventDate = new Date(event.eventDate);
                  const daysUntil = Math.ceil(
                    (eventDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                  );

                  return (
                    <EventCard
                      key={event.id}
                      event={event}
                      daysUntil={daysUntil}
                    />
                  );
                })}
              </div>

              {upcomingEvents.length > 6 && (
                <div className="pt-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      // Could implement pagination or show more functionality
                    }}
                  >
                    Load More Events
                  </Button>
                </div>
              )}
            </section>
          )}

          {/* No Results */}
          {filteredEvents.length === 0 && !loading && (
            <Card className="p-12 text-center">
              <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-white mb-2">No Events Found</h3>
              <p className="text-gray-400 mb-6">
                {searchQuery
                  ? 'Try adjusting your search criteria'
                  : 'No events are currently scheduled'}
              </p>
              {searchQuery && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory(null);
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </Card>
          )}

          {/* Past Events Section */}
          {pastEvents.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white">Past Events</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastEvents.slice(0, 3).map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    isPast={true}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

interface EventCardProps {
  event: Event;
  daysUntil?: number;
  isPast?: boolean;
}

function EventCard({ event, daysUntil, isPast }: EventCardProps) {
  const eventDate = new Date(event.eventDate);

  return (
    <Link href={`/dashboard/events/${event.id}`}>
      <Card className="h-full hover:border-primary-500 transition-all overflow-hidden group cursor-pointer">
        {/* Image Container */}
        {event.imageUrl && (
          <div className="relative h-40 overflow-hidden bg-dark-700">
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
            />
            {isPast && (
              <div className="absolute inset-0 bg-dark-900/50 flex items-center justify-center">
                <span className="text-white font-bold">Past Event</span>
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6 flex flex-col h-full">
          {/* Category Badge */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-secondary-500/20 text-secondary-300">
              {event.eventType}
            </span>
            {daysUntil !== undefined && !isPast && (
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full ${
                  daysUntil <= 3
                    ? 'bg-danger-500/20 text-danger-300'
                    : daysUntil <= 7
                    ? 'bg-warning-500/20 text-warning-300'
                    : 'bg-primary-500/20 text-primary-300'
                }`}
              >
                {daysUntil} days away
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-primary-400 transition-colors">
            {event.title}
          </h3>

          {/* Description */}
          {event.description && (
            <p className="text-sm text-gray-400 mb-4 line-clamp-2">{event.description}</p>
          )}

          {/* Details */}
          <div className="space-y-2 text-sm text-gray-400 mt-auto mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 flex-shrink-0 text-primary-400" />
              <span>{eventDate.toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 flex-shrink-0 text-primary-400" />
              <span>{event.startTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 flex-shrink-0 text-primary-400" />
              <span className="line-clamp-1">{event.venue}</span>
            </div>
          </div>

          {/* Attendance and CTA */}
          <div className="flex items-center justify-between pt-4 border-t border-dark-600">
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Users className="w-4 h-4" />
              <span>{event._count?.registrations || 0} attending</span>
            </div>
            <Button
              size="sm"
              variant="primary"
              onClick={(e) => {
                e.preventDefault();
                // Navigation handled by Link
              }}
            >
              {isPast ? 'View' : 'Register'} →
            </Button>
          </div>
        </div>
      </Card>
    </Link>
  );
}
