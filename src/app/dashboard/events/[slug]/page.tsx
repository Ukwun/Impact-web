'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Share2,
  Bell,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Loader,
} from 'lucide-react';

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
  price?: number;
  isFree: boolean;
  agenda?: string;
  tags?: string[];
  organizer?: { id: string; name: string };
  _count?: { registrations: number };
}

interface Registration {
  id: string;
  eventId: string;
  userId: string;
  registeredAt: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params?.slug as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [userRegistration, setUserRegistration] = useState<Registration | null>(null);

  // Fetch event details
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/events/${eventId}`);
        if (!response.ok) throw new Error('Event not found');

        const data = await response.json();
        setEvent(data.data);

        // Check if user is already registered
        const registrationResponse = await fetch(`/api/events/${eventId}/registration`);
        if (registrationResponse.ok) {
          const regData = await registrationResponse.json();
          setUserRegistration(regData.data);
          setIsRegistered(true);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load event';
        setError(message);
        console.error('Error fetching event:', err);
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  const handleRegister = async () => {
    if (!event) return;

    try {
      setIsRegistering(true);
      const response = await fetch(`/api/events/${event.id}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error('Failed to register');

      const data = await response.json();
      setUserRegistration(data.data);
      setIsRegistered(true);
    } catch (err) {
      console.error('Registration error:', err);
      alert('Failed to register for event');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!userRegistration) return;

    try {
      setIsRegistering(true);
      const response = await fetch(
        `/api/events/${event?.id}/registrations/${userRegistration.id}`,
        { method: 'DELETE' }
      );

      if (!response.ok) throw new Error('Failed to cancel registration');

      setIsRegistered(false);
      setUserRegistration(null);
    } catch (err) {
      console.error('Cancellation error:', err);
      alert('Failed to cancel registration');
    } finally {
      setIsRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <Button variant="outline" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Card className="p-12 text-center">
          <Loader className="w-8 h-8 text-primary-500 mx-auto mb-4 animate-spin" />
          <p className="text-gray-400">Loading event details...</p>
        </Card>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="space-y-8">
        <Button variant="outline" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Card className="p-6 bg-danger-500/10 border border-danger-500/30">
          <div className="flex gap-3 items-start">
            <AlertCircle className="w-5 h-5 text-danger-500 mt-0.5" />
            <div>
              <p className="font-semibold text-danger-700">
                {error || 'Event not found'}
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const eventDate = new Date(event.eventDate);
  const capacityUsed = event._count?.registrations || 0;
  const capacityRemaining = event.capacity ? event.capacity - capacityUsed : null;
  const isCapacityFull = event.capacity && capacityUsed >= event.capacity;

  return (
    <div className="space-y-8">
      {/* Header with back button */}
      <Button variant="outline" onClick={() => router.back()} className="gap-2">
        <ArrowLeft className="w-4 h-4" /> Back to Events
      </Button>

      {/* Event Header Image */}
      {event.imageUrl && (
        <div className="relative h-96 rounded-xl overflow-hidden">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-900 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-block text-xs font-bold px-4 py-2 rounded-full bg-primary-500/20 text-primary-300 mb-4">
                  {event.eventType}
                </span>
                <h1 className="text-4xl font-black text-white">{event.title}</h1>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Info */}
          <Card className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <p className="text-xs text-gray-400 font-semibold">Date</p>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary-400" />
                  <p className="font-semibold text-white">
                    {eventDate.toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-gray-400 font-semibold">Time</p>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary-400" />
                  <p className="font-semibold text-white">{event.startTime}</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-gray-400 font-semibold">Location</p>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary-400" />
                  <p className="font-semibold text-white text-sm">{event.venue}</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-gray-400 font-semibold">Attendees</p>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary-400" />
                  <p className="font-semibold text-white">
                    {capacityUsed}/{event.capacity || '∞'}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Description */}
          {event.description && (
            <Card className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">About Event</h3>
              <p className="text-gray-300 whitespace-pre-line">{event.description}</p>
            </Card>
          )}

          {/* Agenda */}
          {event.agenda && (
            <Card className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">Agenda</h3>
              <div className="whitespace-pre-line text-gray-300">{event.agenda}</div>
            </Card>
          )}

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <Card className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">Topics Covered</h3>
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-2 rounded-full bg-secondary-500/20 text-secondary-300 text-sm font-semibold"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Card>
          )}

          {/* Organizer */}
          {event.organizer && (
            <Card className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">Organized By</h3>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary-500/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary-400" />
                </div>
                <div>
                  <p className="font-semibold text-white">{event.organizer.name}</p>
                  <p className="text-sm text-gray-400">Event Organizer</p>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Registration Card */}
          <Card className="p-6 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 border border-primary-500/30">
            {/* Price */}
            {!event.isFree && event.price && (
              <div className="mb-6 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary-400" />
                <span className="text-3xl font-black text-white">{event.price}</span>
              </div>
            )}

            {event.isFree && (
              <div className="mb-6 px-4 py-2 rounded-lg bg-primary-500/20 text-primary-300 text-sm font-bold text-center">
                Free Event
              </div>
            )}

            {/* Status Message */}
            {isRegistered && userRegistration && (
              <div className="mb-6 p-4 rounded-lg bg-success-500/20 border border-success-500/50">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success-400 mt-0.5" />
                  <div>
                    <p className="font-semibold text-success-300">You're registered!</p>
                    <p className="text-xs text-success-200">
                      Confirmation sent to your email
                    </p>
                  </div>
                </div>
              </div>
            )}

            {isCapacityFull && !isRegistered && (
              <div className="mb-6 p-4 rounded-lg bg-danger-500/20 border border-danger-500/50">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-danger-400 mt-0.5" />
                  <div>
                    <p className="font-semibold text-danger-300">Event is full</p>
                    <p className="text-xs text-danger-200">
                      Join the waitlist to be notified if a spot opens
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Register Button */}
            <div className="space-y-3">
              {isRegistered ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleCancelRegistration}
                  disabled={isRegistering}
                >
                  {isRegistering ? 'Cancelling...' : 'Cancel Registration'}
                </Button>
              ) : (
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={handleRegister}
                  disabled={isRegistering || isCapacityFull}
                >
                  {isRegistering ? 'Registering...' : isCapacityFull ? 'Event Full' : 'Register Now'}
                </Button>
              )}

              {/* Additional Actions */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => {
                    navigator.share({
                      title: event.title,
                      text: `Check out this event: ${event.title}`,
                      url: window.location.href,
                    });
                  }}
                >
                  <Share2 className="w-4 h-4" /> Share
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Bell className="w-4 h-4" /> Remind
                </Button>
              </div>
            </div>
          </Card>

          {/* Capacity Info */}
          {event.capacity && (
            <Card className="p-6">
              <p className="text-sm text-gray-400 font-semibold mb-3">Spots Available</p>
              <div className="w-full bg-dark-600 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all"
                  style={{
                    width: `${(capacityUsed / event.capacity) * 100}%`,
                  }}
                ></div>
              </div>
              <p className="text-xs text-gray-400 mt-3">
                {capacityRemaining !== null
                  ? `${capacityRemaining} spots remaining`
                  : `${capacityUsed} registered`}
              </p>
            </Card>
          )}

          {/* Share Card */}
          <Card className="p-6">
            <h4 className="font-semibold text-white mb-4">Share Event</h4>
            <div className="space-y-3">
              <Button variant="outline" size="sm" className="w-full text-sm">
                Facebook
              </Button>
              <Button variant="outline" size="sm" className="w-full text-sm">
                Twitter
              </Button>
              <Button variant="outline" size="sm" className="w-full text-sm">
                Copy Link
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
