"use client";

import { Button } from "@/components/ui/Button";
import { Calendar, MapPin, Users, ArrowRight } from "lucide-react";
import { useEvents } from "@/hooks/useEvents";

export default function UpcomingEvents() {
  const { events, loading, error } = useEvents(3);

  const displayEvents = loading
    ? [
        { id: "skeleton-1", isLoading: true },
        { id: "skeleton-2", isLoading: true },
        { id: "skeleton-3", isLoading: true },
      ]
    : (events || []);

  const colorClasses: Record<number, string> = {
    0: "from-primary-500 to-primary-600 border-primary-400",
    1: "from-secondary-500 to-secondary-600 border-secondary-400",
    2: "from-green-500 to-green-600 border-green-400",
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric", 
      year: "numeric" 
    });
  };

  if (error) {
    return (
      <section className="relative py-24 lg:py-32 bg-gradient-to-br from-dark-500 to-dark-600 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <p className="text-gray-300">Failed to load events. Please try again later.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-24 lg:py-32 bg-gradient-to-br from-dark-500 to-dark-600 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-secondary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-5xl lg:text-6xl font-black text-white">
            Upcoming Events
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Connect, learn, and grow at our signature events and conferences
          </p>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {displayEvents.map((event, idx) => (
            <div
              key={event.id}
              className={`group relative rounded-2xl bg-gradient-to-br from-dark-400 to-dark-500 border-2 border-gray-700 hover:border-primary-500 hover:shadow-xl hover:shadow-primary-500/25 transition-all duration-300 overflow-hidden ${
                !event.isLoading ? "transform hover:scale-105" : ""
              }`}
            >
              {/* Header gradient */}
              <div
                className={`h-32 bg-gradient-to-br ${colorClasses[idx % 3]} relative overflow-hidden`}
              >
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute -right-8 -top-8 w-24 h-24 bg-white rounded-full mix-blend-overlay"></div>
                </div>
                <div className="relative z-10 p-6 text-white">
                  <p className={`text-xs font-bold uppercase tracking-wider opacity-90 mb-2 ${
                    event.isLoading ? "bg-gray-700 rounded w-1/3 h-4" : ""
                  }`}>
                    {!event.isLoading && event.eventType}
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-5">
                {/* Title */}
                <h3 className={`text-2xl font-black text-white leading-tight group-hover:text-primary-400 transition-colors ${
                  event.isLoading ? "bg-gray-700 rounded h-8" : ""
                }`}>
                  {!event.isLoading && event.title}
                </h3>

                {/* Description */}
                <p className={`text-gray-400 text-sm leading-relaxed ${
                  event.isLoading ? "bg-gray-700 rounded h-16" : ""
                }`}>
                  {!event.isLoading && event.description}
                </p>

                {/* Event details */}
                <div className="space-y-3 py-4 border-t border-gray-700">
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-5 h-5 text-primary-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase">
                        Date
                      </p>
                      <p className={`text-gray-300 font-semibold ${
                        event.isLoading ? "bg-gray-700 rounded w-1/2 h-5" : ""
                      }`}>
                        {!event.isLoading && formatDate(event.eventDate)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="w-5 h-5 text-secondary-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase">
                        Location
                      </p>
                      <p className={`text-gray-300 font-semibold ${
                        event.isLoading ? "bg-gray-700 rounded w-1/2 h-5" : ""
                      }`}>
                        {!event.isLoading && event.location}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <Users className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase">
                        Registered
                      </p>
                      <p className={`text-gray-300 font-semibold ${
                        event.isLoading ? "bg-gray-700 rounded w-1/2 h-5" : ""
                      }`}>
                        {!event.isLoading && event.registrationCount}
                      </p>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full justify-center gap-2 group/btn disabled:opacity-50"
                  disabled={event.isLoading}
                >
                  {event.isLoading ? "Loading..." : "Register Now"}
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* View All Events CTA */}
        <div className="text-center">
          <Button
            variant="outline"
            size="lg"
            className="text-white border-white hover:bg-white hover:text-dark-600 gap-2"
          >
            View All Events
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}

