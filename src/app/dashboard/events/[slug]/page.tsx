'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Calendar,
  MapPin,
  Users,
  Share2,
  Send,
  ChevronLeft,
  Zap,
  Award,
} from 'lucide-react';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const [registered, setRegistered] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-12">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          <h1 className="text-xl font-bold text-gray-900">Event Details</h1>
          <div className="w-20"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Event Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          {/* Event Image */}
          <div className="h-64 bg-gradient-to-r from-blue-500 to-indigo-600 relative flex items-center justify-center">
            <Calendar className="w-24 h-24 text-white opacity-50" />
          </div>

          {/* Event Info */}
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Upcoming Event
                </h2>
                <p className="text-gray-600">Event ID: {slug}</p>
              </div>
              <button className="text-gray-500 hover:text-gray-700">
                <Share2 className="w-6 h-6" />
              </button>
            </div>

            {/* Event Details Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-start">
                <Calendar className="w-5 h-5 text-blue-600 mr-3 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Date & Time</p>
                  <p className="font-semibold text-gray-900">April 20, 2026 • 2:00 PM</p>
                </div>
              </div>
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-blue-600 mr-3 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-semibold text-gray-900">Virtual • Online</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">About Event</h3>
              <p className="text-gray-600 leading-relaxed">
                Join us for an exciting event where we explore the latest innovations and opportunities for impact.
              </p>
            </div>

            {/* Participants */}
            <div className="mb-6">
              <div className="flex items-center mb-2">
                <Users className="w-5 h-5 text-blue-600 mr-2" />
                <p className="text-sm text-gray-600">245 people registered</p>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => setRegistered(!registered)}
              className={`w-full py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition ${
                registered
                  ? 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <Zap className="w-5 h-5" />
              {registered ? 'Unregister' : 'Register Now'}
            </button>
          </div>
        </div>

        {/* Additional Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-start">
              <Award className="w-5 h-5 text-yellow-600 mr-3 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Certificate</h4>
                <p className="text-sm text-gray-600">Get a certificate of participation</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-start">
              <Send className="w-5 h-5 text-blue-600 mr-3 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Share</h4>
                <p className="text-sm text-gray-600">Invite friends and colleagues</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
