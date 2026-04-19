'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Users, Loader, AlertCircle } from 'lucide-react';

interface Activity {
  id: string;
  title: string;
  description?: string;
  eventDate: string;
  startTime: string;
  venue: string;
  location?: string;
  capacity?: number;
  currentAttendees: number;
  eventType: string;
}

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/events?includePast=false');
        if (!response.ok) throw new Error('Failed to fetch activities');

        const data = await response.json();
        setActivities(data.data || []);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load activities';
        setError(message);
        console.error('Error fetching activities:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    try {
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return timeString;
    }
  };

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-black text-white mb-2">Upcoming Activities</h1>
          <p className="text-gray-400">Join community and learning activities</p>
        </div>

        <div className="bg-red-500/10 border border-red-500/50 rounded-2xl p-6 flex items-center gap-4">
          <AlertCircle className="text-red-400" size={24} />
          <div>
            <h3 className="text-white font-bold mb-1">Unable to load activities</h3>
            <p className="text-gray-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-black text-white mb-2">Upcoming Activities</h1>
          <p className="text-gray-400">Join community and learning activities</p>
        </div>

        <div className="flex items-center justify-center py-12">
          <Loader className="animate-spin text-primary-400 mr-3" size={24} />
          <p className="text-gray-400">Loading activities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black text-white mb-2">Upcoming Activities</h1>
        <p className="text-gray-400">Join community and learning activities</p>
      </div>

      {activities.length > 0 ? (
        <div className="space-y-6">
          {activities.map((activity) => {
            const spotsLeft = activity.capacity ? activity.capacity - activity.currentAttendees : null;
            const isFull = spotsLeft !== null && spotsLeft <= 0;

            return (
              <Link
                key={activity.id}
                href={`/dashboard/events/${activity.id}`}
                className="block bg-dark-500 border border-dark-400 rounded-2xl p-8 hover:border-primary-500 transition-all hover:shadow-lg hover:shadow-primary-600/20"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-2 hover:text-primary-400 transition-colors">
                      {activity.title}
                    </h2>
                    {activity.description && (
                      <p className="text-gray-400 text-sm">{activity.description}</p>
                    )}
                  </div>
                  <div className={`px-4 py-2 rounded-full font-semibold text-sm ${
                    isFull
                      ? 'bg-red-600/20 text-red-400'
                      : 'bg-green-600/20 text-green-400'
                  }`}>
                    {isFull ? 'Full' : `${spotsLeft || '∞'} spots left`}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 pt-6 border-t border-dark-400">
                  <div className="flex items-center gap-3 text-gray-300">
                    <Calendar size={20} className="text-primary-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Date</p>
                      <span className="block">{formatDate(activity.eventDate)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <Clock size={20} className="text-primary-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Time</p>
                      <span className="block">{formatTime(activity.startTime)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <MapPin size={20} className="text-primary-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Location</p>
                      <span className="block text-sm">{activity.venue}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <Users size={20} className="text-primary-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Registered</p>
                      <span className="block">{activity.currentAttendees} going</span>
                    </div>
                  </div>
                </div>

                <button className={`w-full py-3 rounded-lg font-bold transition-all ${
                  isFull
                    ? 'bg-dark-600 text-gray-400 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700 text-white'
                }`}
                disabled={isFull}
                >
                  {isFull ? 'Activity Full' : 'Register Now'}
                </button>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="bg-dark-500 border border-dark-400 rounded-2xl p-12 text-center">
          <Calendar className="mx-auto mb-4 text-gray-500" size={48} />
          <h3 className="text-xl font-bold text-white mb-2">No upcoming activities</h3>
          <p className="text-gray-400">Check back later for new activities</p>
        </div>
      )}

      <div className="text-center pt-6">
        <Link href="/dashboard/events" className="text-primary-400 hover:text-primary-300 font-semibold">
          View all events →
        </Link>
      </div>
    </div>
  );
}

function Clock({ size, className }: { size: number; className?: string }) {
  return <Calendar size={size} className={className} />;
}
