'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Users, Search } from 'lucide-react';
import { useEvents } from '@/hooks/useEvents';

export default function EventsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { events, loading } = useEvents(20);

  const categories = [
    { id: 'all', label: 'All Events' },
    { id: 'webinar', label: 'Webinar' },
    { id: 'workshop', label: 'Workshop' },
    { id: 'summit', label: 'Summit' },
    { id: 'networking', label: 'Networking' },
  ];

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || event.eventType === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const upcomingEvents = filteredEvents.sort(
    (a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
  );

  const EventSkeleton = () => (
    <div className="bg-gradient-to-r from-dark-500 to-dark-600 rounded-xl overflow-hidden border border-dark-400 animate-pulse">
      <div className="h-40 bg-dark-400"></div>
      <div className="p-6 space-y-4">
        <div className="h-4 bg-dark-400 rounded w-3/4"></div>
        <div className="h-4 bg-dark-400 rounded w-1/2"></div>
        <div className="h-8 bg-dark-400 rounded w-1/3 mt-6"></div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black text-white mb-2">Events & Webinars</h1>
        <p className="text-gray-400">Discover and register for upcoming learning events</p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
        <input
          type="text"
          placeholder="Search events by name or topic..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-dark-500 border border-dark-400 rounded-lg text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none transition-colors"
        />
      </div>

      {/* Category Filter */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-6 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
              selectedCategory === category.id
                ? 'bg-primary-600 text-white'
                : 'bg-dark-500 text-gray-300 border border-dark-400 hover:border-primary-500'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <EventSkeleton key={i} />
          ))}
        </div>
      ) : upcomingEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingEvents.map((event) => (
            <Link
              key={event.id}
              href={`/dashboard/events/${event.id}`}
              className="group bg-gradient-to-r from-dark-500 to-dark-600 rounded-xl overflow-hidden border border-dark-400 hover:border-primary-500 hover:shadow-xl hover:shadow-primary-600/20 transition-all hover:scale-105"
            >
              {/* Event Image Header */}
              <div className="h-40 bg-gradient-to-r from-primary-600 to-secondary-500 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <Calendar size={48} className="text-white/80" />
              </div>

              {/* Event Content */}
              <div className="p-6 space-y-3">
                {/* Category Badge */}
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-primary-600/20 text-primary-400 rounded-full text-xs font-bold uppercase">
                    {event.eventType}
                  </span>
                  {event.capacity && (
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Users size={14} />
                      {event.registrationCount}/{event.capacity}
                    </span>
                  )}
                </div>

                {/* Event Title */}
                <h3 className="font-bold text-white text-lg line-clamp-2 group-hover:text-primary-400 transition-colors">
                  {event.title}
                </h3>

                {/* Event Description */}
                <p className="text-gray-300 text-sm line-clamp-2">{event.description}</p>

                {/* Event Details */}
                <div className="space-y-2 pt-3 border-t border-dark-400">
                  <div className="flex items-center gap-2 text-gray-300 text-sm">
                    <Calendar size={16} className="text-primary-400" />
                    <span>
                      {new Date(event.eventDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {event.location && (
                    <div className="flex items-center gap-2 text-gray-300 text-sm">
                      <MapPin size={16} className="text-primary-400" />
                      <span>{event.location}</span>
                    </div>
                  )}
                </div>

                {/* CTA Button */}
                <button className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-500 text-white rounded-lg font-bold hover:shadow-lg hover:shadow-primary-600/50 transition-all group-hover:scale-105">
                  View Details
                </button>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-400 text-lg">No events found matching your criteria</p>
        </div>
      )}
    </div>
  );
}
