'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AUTH_TOKEN_KEY } from '@/lib/authStorage';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  MapPin,
  Loader,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';

interface Event {
  id: string;
  title: string;
  eventDate: string;
  startTime: string;
  venue: string;
  eventType: string;
  _count?: { registrations: number };
}

export default function EventCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/events?limit=100');
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

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const calendar: (number | null)[][] = [];
  let day = 1;

  // Fill in the days
  for (let week = 0; week < 6; week++) {
    const week_days: (number | null)[] = [];
    for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
      if (week === 0 && dayOfWeek < startingDayOfWeek) {
        week_days.push(null);
      } else if (day > daysInMonth) {
        week_days.push(null);
      } else {
        week_days.push(day);
        day++;
      }
    }
    calendar.push(week_days);
  }

  // Get events for a specific date
  const getEventsForDate = (dateNum: number) => {
    if (!dateNum) return [];
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dateNum).padStart(2, '0')}`;
    return events.filter((e) => e.eventDate.startsWith(dateStr));
  };

  // Handle previous/next month
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-4xl font-black text-white">Event Calendar</h1>
        <p className="text-gray-400">Browse upcoming events by date</p>
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
          <p className="text-gray-400">Loading event calendar...</p>
        </Card>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              {/* Month/Year Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {monthNames[month]} {year}
                </h2>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={goToPreviousMonth}
                    className="p-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={goToNextMonth}
                    className="p-2"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Day Names */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {dayNames.map((day) => (
                  <div
                    key={day}
                    className="text-center text-sm font-bold text-gray-400 py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {calendar.map((week, weekIdx) =>
                  week.map((dateNum, dayIdx) => {
                    const dayEvents = dateNum ? getEventsForDate(dateNum) : [];
                    const isToday =
                      dateNum &&
                      dateNum === new Date().getDate() &&
                      month === new Date().getMonth() &&
                      year === new Date().getFullYear();

                    return (
                      <div
                        key={`${weekIdx}-${dayIdx}`}
                        className={`aspect-square rounded-lg p-2 relative transition-all ${
                          !dateNum
                            ? 'bg-dark-700/30'
                            : isToday
                            ? 'bg-primary-500/20 border-2 border-primary-500'
                            : dayEvents.length > 0
                            ? 'bg-secondary-500/10 border border-secondary-500/50 hover:border-secondary-500'
                            : 'bg-dark-700 hover:bg-dark-600 border border-dark-600'
                        }`}
                      >
                        {dateNum && (
                          <>
                            <div className="text-xs font-bold text-gray-300 mb-1">
                              {dateNum}
                            </div>
                            {dayEvents.length > 0 && (
                              <>
                                <div className="space-y-1 text-[10px]">
                                  {dayEvents.slice(0, 2).map((event) => (
                                    <Link
                                      key={event.id}
                                      href={`/dashboard/events/${event.id}`}
                                      className="block text-primary-300 hover:text-primary-200 line-clamp-1 font-semibold"
                                    >
                                      {event.title}
                                    </Link>
                                  ))}
                                </div>
                                {dayEvents.length > 2 && (
                                  <div className="text-[10px] text-secondary-400 font-semibold">
                                    +{dayEvents.length - 2} more
                                  </div>
                                )}
                              </>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </Card>

            {/* Current Month Events List */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-white mb-4">
                Events in {monthNames[month]}
              </h3>
              {events
                .filter((e) => {
                  const eDate = new Date(e.eventDate);
                  return eDate.getMonth() === month && eDate.getFullYear() === year;
                })
                .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
                .length === 0 ? (
                <p className="text-gray-400 text-sm">No events scheduled for this month</p>
              ) : (
                <div className="space-y-3">
                  {events
                    .filter((e) => {
                      const eDate = new Date(e.eventDate);
                      return eDate.getMonth() === month && eDate.getFullYear() === year;
                    })
                    .sort(
                      (a, b) =>
                        new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
                    )
                    .map((event) => {
                      const eventDate = new Date(event.eventDate);
                      return (
                        <Link
                          key={event.id}
                          href={`/dashboard/events/${event.id}`}
                          className="block p-3 rounded-lg bg-dark-700/50 border border-dark-600 hover:border-primary-500 transition-all group"
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className="font-semibold text-white group-hover:text-primary-400 transition-colors line-clamp-2">
                              {event.title}
                            </h4>
                            <span className="text-xs font-bold px-2 py-1 rounded-full bg-secondary-500/20 text-secondary-300 flex-shrink-0">
                              {event.eventType}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {eventDate.toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {event.startTime}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {event.venue}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar - Upcoming Events */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-bold text-white mb-4">Upcoming Events</h3>
              {events
                .filter((e) => new Date(e.eventDate) >= new Date())
                .sort(
                  (a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
                )
                .slice(0, 5)
                .length === 0 ? (
                <p className="text-gray-400 text-sm">No upcoming events</p>
              ) : (
                <div className="space-y-3">
                  {events
                    .filter((e) => new Date(e.eventDate) >= new Date())
                    .sort(
                      (a, b) =>
                        new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
                    )
                    .slice(0, 5)
                    .map((event) => {
                      const eventDate = new Date(event.eventDate);
                      const daysUntil = Math.ceil(
                        (eventDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                      );

                      return (
                        <Link
                          key={event.id}
                          href={`/dashboard/events/${event.id}`}
                          className="block p-3 rounded-lg bg-dark-700/50 border border-dark-600 hover:border-primary-500 transition-all group"
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="font-semibold text-white group-hover:text-primary-400 transition-colors line-clamp-2 text-sm">
                              {event.title}
                            </h4>
                            {daysUntil <= 3 && (
                              <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-danger-500/20 text-danger-300 flex-shrink-0">
                                Soon
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-400">
                            {eventDate.toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                            <Users className="w-3 h-3" />
                            {event._count?.registrations || 0} attending
                          </div>
                        </Link>
                      );
                    })}
                </div>
              )}
            </Card>

            {/* Summary Stats */}
            <Card className="p-6 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 border border-primary-500/30">
              <h3 className="text-lg font-bold text-white mb-4">Summary</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-400 font-semibold">Total Events</p>
                  <p className="text-2xl font-black text-primary-400">{events.length}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold">Upcoming</p>
                  <p className="text-2xl font-black text-secondary-400">
                    {events.filter((e) => new Date(e.eventDate) >= new Date()).length}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold">This Month</p>
                  <p className="text-2xl font-black text-blue-400">
                    {events.filter((e) => {
                      const eDate = new Date(e.eventDate);
                      return eDate.getMonth() === month && eDate.getFullYear() === year;
                    }).length}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper component for Users icon
function Users({ className }: { className: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path d="M10.5 1.5H9.5C4.81 1.5 1.5 4.81 1.5 9.5C1.5 14.19 4.81 17.5 9.5 17.5H10.5C15.19 17.5 18.5 14.19 18.5 9.5C18.5 4.81 15.19 1.5 10.5 1.5Z" />
    </svg>
  );
}
