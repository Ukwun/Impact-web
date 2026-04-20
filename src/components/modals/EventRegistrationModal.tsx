"use client";

import { useState } from "react";
import { X, Calendar, MapPin, Users, Clock, Share2 } from "lucide-react";

interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  location: string;
  format: "in-person" | "virtual" | "hybrid";
  speakers: Array<{
    name: string;
    title: string;
  }>;
  attendeeCount: number;
  capacity: number;
  registrationDeadline: string;
  tags: string[];
  isRegistered: boolean;
}

interface Props {
  isOpen: boolean;
  events: Event[];
  onClose: () => void;
  onRegisterEvent: (eventId: string) => void;
  onViewDetails: (eventId: string) => void;
}

export function EventRegistrationModal({ isOpen, events, onClose, onRegisterEvent }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [filterByFormat, setFilterByFormat] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"upcoming" | "popular" | "deadline">("upcoming");

  if (!isOpen) return null;

  let filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFormat = !filterByFormat || event.format === filterByFormat;

    return matchesSearch && matchesFormat;
  });

  // Sort events
  if (sortBy === "upcoming") {
    filteredEvents = [...filteredEvents].sort(
      (a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
    );
  } else if (sortBy === "popular") {
    filteredEvents = [...filteredEvents].sort((a, b) => b.attendeeCount - a.attendeeCount);
  } else if (sortBy === "deadline") {
    filteredEvents = [...filteredEvents].sort(
      (a, b) => new Date(a.registrationDeadline).getTime() - new Date(b.registrationDeadline).getTime()
    );
  }

  const formats = Array.from(new Set(events.map((e) => e.format)));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-96 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Discover Events</h2>
            <p className="text-green-100 text-sm mt-1">Join webinars, workshops, and networking events</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {!selectedEvent ? (
            <div className="flex gap-6 p-6">
              {/* Sidebar Filters */}
              <div className="w-48 space-y-6 flex-shrink-0">
                {/* Search */}
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-2">Search Events</label>
                  <input
                    type="text"
                    placeholder="Topic, speaker, tag..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  />
                </div>

                {/* Format Filter */}
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-3">Format</label>
                  <div className="space-y-2">
                    {formats.map((format) => (
                      <button
                        key={format}
                        onClick={() => setFilterByFormat(filterByFormat === format ? null : format)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${
                          filterByFormat === format
                            ? "bg-green-100 text-green-700 border border-green-300"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {format.charAt(0).toUpperCase() + format.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-3">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  >
                    <option value="upcoming">Upcoming First</option>
                    <option value="popular">Most Popular</option>
                    <option value="deadline">Registration Deadline</option>
                  </select>
                </div>
              </div>

              {/* Events List */}
              <div className="flex-1">
                {filteredEvents.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No events found matching your criteria</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredEvents.map((event) => (
                      <button
                        key={event.id}
                        onClick={() => setSelectedEvent(event)}
                        className="w-full text-left p-4 border border-gray-200 rounded-xl hover:border-green-300 hover:shadow-lg transition group"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-bold text-gray-900 group-hover:text-green-600 transition">{event.title}</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {event.speakers.map((s) => s.name).join(", ")}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 rounded text-xs font-bold whitespace-nowrap ${
                              event.format === "in-person"
                                ? "bg-blue-100 text-blue-700"
                                : event.format === "virtual"
                                  ? "bg-purple-100 text-purple-700"
                                  : "bg-pink-100 text-pink-700"
                            }`}
                          >
                            {event.format}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-gray-600 mb-3">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(event.eventDate).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {event.startTime} - {event.endTime}
                          </span>
                          {event.format !== "virtual" && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {event.location}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {event.attendeeCount}/{event.capacity}
                          </span>
                        </div>

                        <p className="text-sm text-gray-700 line-clamp-2 mb-3">{event.description}</p>

                        <div className="flex flex-wrap gap-1">
                          {event.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Event Detail View */
            <div className="p-6">
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-green-600 hover:text-green-700 font-medium text-sm mb-4 flex items-center gap-2"
              >
                ← Back to events
              </button>

              <div className="space-y-6">
                {/* Event Header */}
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-2xl font-bold text-gray-900">{selectedEvent.title}</h3>
                    <span
                      className={`px-3 py-1 rounded-lg text-sm font-bold ${
                        selectedEvent.format === "in-person"
                          ? "bg-blue-100 text-blue-700"
                          : selectedEvent.format === "virtual"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-pink-100 text-pink-700"
                      }`}
                    >
                      {selectedEvent.format.charAt(0).toUpperCase() + selectedEvent.format.slice(1)}
                    </span>
                  </div>

                  <p className="text-gray-700 leading-relaxed mb-4">{selectedEvent.description}</p>
                </div>

                {/* Event Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Date & Time</p>
                    <p className="font-bold text-gray-900">
                      {new Date(selectedEvent.eventDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-700">
                      {selectedEvent.startTime} - {selectedEvent.endTime}
                    </p>
                  </div>
                  {selectedEvent.format !== "virtual" && (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Location</p>
                      <p className="font-bold text-gray-900">{selectedEvent.location}</p>
                    </div>
                  )}
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Attendees</p>
                    <p className="font-bold text-gray-900">{selectedEvent.attendeeCount}/{selectedEvent.capacity}</p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Registration Deadline</p>
                    <p className="font-bold text-gray-900">
                      {new Date(selectedEvent.registrationDeadline).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Speakers */}
                {selectedEvent.speakers.length > 0 && (
                  <div>
                    <h4 className="font-bold text-gray-900 mb-3">Speakers</h4>
                    <div className="space-y-2">
                      {selectedEvent.speakers.map((speaker, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex-shrink-0"></div>
                          <div>
                            <p className="font-medium text-gray-900">{speaker.name}</p>
                            <p className="text-sm text-gray-600">{speaker.title}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                <div>
                  <h4 className="font-bold text-gray-900 mb-3">Topics</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedEvent.tags.map((tag) => (
                      <span key={tag} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* CTAs */}
                <div className="flex gap-3">
                  {!selectedEvent.isRegistered ? (
                    <button
                      onClick={() => {
                        onRegisterEvent(selectedEvent.id);
                        setSelectedEvent(null);
                      }}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition"
                    >
                      Register for Event
                    </button>
                  ) : (
                    <button
                      disabled
                      className="flex-1 bg-gray-200 text-gray-600 font-bold py-3 rounded-lg"
                    >
                      Registered
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="px-6 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold py-3 rounded-lg transition flex items-center justify-center"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
