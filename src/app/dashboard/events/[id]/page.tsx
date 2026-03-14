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
  const eventId = params?.id as string;
  const [registered, setRegistered] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  // Mock event data
  const event = {
    id: eventId,
    title: 'Financial Literacy Workshop: Building Wealth from Scratch',
    description:
      'Join Adeyemi Johnson for an intensive workshop on personal finance, investing, and wealth building strategies.',
    date: '2026-03-20T14:00:00',
    endDate: '2026-03-20T17:00:00',
    location: 'Tech Hub Lagos',
    address: 'Plot 5, Admiralty Way, Lekki, Lagos',
    category: 'workshop',
    capacity: 200,
    attendees: 156,
    price: 15000,
    isFree: false,
    rating: 4.8,
    speakers: [
      {
        id: 1,
        name: 'Adeyemi Johnson',
        role: 'Financial Coach & Entrepreneur',
        bio: '15+ years of experience in personal finance and business development',
      },
    ],
    agenda: [
      { time: '2:00 PM', title: 'Welcome & Introductions', duration: 15 },
      { time: '2:15 PM', title: 'Money Fundamentals', duration: 45 },
      { time: '3:00 PM', title: 'break', duration: 15 },
      { time: '3:15 PM', title: 'Investing 101', duration: 45 },
      { time: '4:00 PM', title: 'Q&A Session', duration: 45 },
      { time: '4:45 PM', title: 'Networking & Closing', duration: 15 },
    ],
    whatYouWillLearn: [
      'Core principles of personal budgeting and expense tracking',
      'Investment basics: stocks, bonds, real estate, and crypto',
      'Debt management and credit score optimization',
      'Passive income strategies and business financing',
      'Tax planning and retirement planning fundamentals',
      'Real estate investing and property management',
    ],
    requirements: [
      'Basic understanding of numbers and finance (no advanced math needed)',
      'Laptop or tablet with internet connection',
      'Notebook for taking notes',
      'Open mind and willingness to learn',
    ],
  };

  const speakers = [
    {
      id: 1,
      name: 'Adeyemi Johnson',
      role: 'Financial Coach',
      image: '👨‍💼',
    },
    {
      id: 2,
      name: 'Folake Adeyemi',
      role: 'Investment Advisor',
      image: '👩‍💼',
    },
  ];

  const reviews = [
    {
      id: 1,
      name: 'Sarah M.',
      rating: 5,
      text: 'Absolutely transformative workshop. Adeyemi broke down complex concepts beautifully.',
      date: '2 weeks ago',
    },
    {
      id: 2,
      name: 'John A.',
      rating: 4,
      text: 'Great content and very interactive. Would have loved more time for networking.',
      date: '1 month ago',
    },
  ];

  const handleRegister = () => {
    if (event.isFree) {
      setRegistered(true);
      // Call registration API
    } else {
      setShowPayment(true);
    }
  };

  const handlePaymentComplete = () => {
    setRegistered(true);
    setShowPayment(false);
    // Call payment API
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-400 hover:text-primary-400 transition-colors"
      >
        <ChevronLeft size={20} />
        Back to Events
      </button>

      {/* Event Hero */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-500 rounded-2xl p-8 text-white">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-bold">
              {event.category.toUpperCase()}
            </span>
            <span className="flex items-center gap-1">
              <span>★</span>
              <span className="font-bold">{event.rating}</span>
            </span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-black">{event.title}</h1>

          <p className="text-lg text-white/90">{event.description}</p>

          {/* Event Meta */}
          <div className="flex flex-wrap gap-6 mt-6">
            <div className="flex items-center gap-2">
              <Calendar size={20} />
              <span>
                {new Date(event.date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={20} />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users size={20} />
              <span>{event.capacity - event.attendees} spots left</span>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="mt-8 flex gap-4">
          {registered ? (
            <div className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-600 rounded-lg font-bold">
              <Award size={20} />
              You're Registered!
            </div>
          ) : (
            <>
              <button
                onClick={handleRegister}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-600 rounded-lg font-bold hover:bg-gray-100 transition-colors"
              >
                <Zap size={20} />
                {event.isFree ? 'Register Free' : `Register - ₦${event.price.toLocaleString()}`}
              </button>
              <button className="inline-flex items-center gap-2 px-8 py-4 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-lg font-bold hover:bg-white/30 transition-colors">
                <Share2 size={20} />
                Share
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* What You'll Learn */}
          <div className="space-y-4">
            <h2 className="text-3xl font-black text-white">What You'll Learn</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {event.whatYouWillLearn.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4 bg-dark-500 rounded-lg border border-dark-400">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-bold">
                    ✓
                  </span>
                  <span className="text-gray-300">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Agenda */}
          <div className="space-y-4">
            <h2 className="text-3xl font-black text-white">Event Agenda</h2>
            <div className="space-y-3">
              {event.agenda.map((item, idx) => (
                <div key={idx} className="flex items-start gap-6 p-4 bg-dark-500 rounded-lg border border-dark-400">
                  <div className="flex-shrink-0 font-bold text-primary-400 w-24">{item.time}</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-white">{item.title}</h4>
                    <p className="text-sm text-gray-400">{item.duration} minutes</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Requirements */}
          <div className="space-y-4">
            <h2 className="text-3xl font-black text-white">Requirements</h2>
            <ul className="space-y-3">
              {event.requirements.map((req, idx) => (
                <li key={idx} className="flex items-start gap-3 text-gray-300">
                  <span className="text-primary-400 font-bold">•</span>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Speakers */}
          <div className="space-y-4">
            <h2 className="text-3xl font-black text-white">Meet the Speakers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {speakers.map((speaker) => (
                <div key={speaker.id} className="p-6 bg-dark-500 rounded-lg border border-dark-400 text-center">
                  <div className="text-6xl mb-4">{speaker.image}</div>
                  <h3 className="font-bold text-white text-lg">{speaker.name}</h3>
                  <p className="text-primary-400 text-sm font-semibold">{speaker.role}</p>
                  <p className="text-gray-400 mt-3 text-sm">
                    Expert insights into modern finance and investment strategies
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div className="space-y-4">
            <h2 className="text-3xl font-black text-white">Attendee Reviews</h2>
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="p-6 bg-dark-500 rounded-lg border border-dark-400">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-white">{review.name}</h4>
                    <span className="text-sm text-gray-400">{review.date}</span>
                  </div>
                  <div className="flex gap-1 mb-3">
                    {[...Array(review.rating)].map((_, i) => (
                      <span key={i} className="text-yellow-400">★</span>
                    ))}
                  </div>
                  <p className="text-gray-300">{review.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Event Summary Card */}
          <div className="bg-gradient-to-r from-dark-500 to-dark-600 rounded-lg border border-dark-400 p-6 sticky top-24">
            <h3 className="font-black text-white text-lg mb-6">Event Details</h3>

            <div className="space-y-5">
              <div>
                <p className="text-gray-400 text-sm font-semibold mb-1">Date & Time</p>
                <p className="text-white font-bold">
                  {new Date(event.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <p className="text-gray-400 text-sm">
                  {new Date(event.date).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}{' '}
                  - {new Date(event.endDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              <div className="border-t border-dark-400 pt-5">
                <p className="text-gray-400 text-sm font-semibold mb-1">Location</p>
                <p className="text-white font-bold">{event.location}</p>
                <p className="text-gray-400 text-sm">{event.address}</p>
              </div>

              <div className="border-t border-dark-400 pt-5">
                <p className="text-gray-400 text-sm font-semibold mb-1">Attendees</p>
                <p className="text-white font-bold">
                  {event.attendees}/{event.capacity}
                </p>
                <div className="w-full bg-dark-700 rounded-full h-2 mt-2">
                  <div
                    className="bg-gradient-to-r from-primary-600 to-secondary-500 h-2 rounded-full"
                    style={{ width: `${(event.attendees / event.capacity) * 100}%` }}
                  ></div>
                </div>
              </div>

              {!event.isFree && (
                <div className="border-t border-dark-400 pt-5">
                  <p className="text-gray-400 text-sm font-semibold mb-2">Price</p>
                  <p className="text-3xl font-black text-primary-400">
                    ₦{event.price.toLocaleString()}
                  </p>
                </div>
              )}

              {registered && (
                <div className="border-t border-dark-400 pt-5 bg-primary-600/20 -mx-6 -mb-6 px-6 py-5 rounded-b-lg">
                  <p className="text-primary-300 font-semibold flex items-center gap-2">
                    <Award size={16} />
                    Ticket confirmation sent to email
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Share */}
          <div className="bg-dark-500 rounded-lg border border-dark-400 p-6">
            <h3 className="font-bold text-white mb-4">Share Event</h3>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors">
                Copy Link
              </button>
              <button className="w-full px-4 py-2 bg-dark-600 text-white rounded-lg font-semibold hover:bg-dark-700 transition-colors flex items-center justify-center gap-2">
                <Send size={16} />
                Share to WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-600 rounded-xl max-w-md w-full p-8 border border-dark-400">
            <h2 className="text-2xl font-black text-white mb-6">Complete Registration</h2>

            <div className="space-y-6">
              <div className="bg-dark-500 rounded-lg p-4 border border-dark-400">
                <p className="text-gray-400 text-sm mb-2">Amount to Pay</p>
                <p className="text-3xl font-black text-primary-400">₦{event.price.toLocaleString()}</p>
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full px-4 py-3 bg-dark-500 border border-dark-400 rounded-lg text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full px-4 py-3 bg-dark-500 border border-dark-400 rounded-lg text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  className="w-full px-4 py-3 bg-dark-500 border border-dark-400 rounded-lg text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowPayment(false)}
                  className="flex-1 px-4 py-3 bg-dark-500 border border-dark-400 text-white rounded-lg font-bold hover:bg-dark-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePaymentComplete}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-600 to-secondary-500 text-white rounded-lg font-bold hover:shadow-lg transition-all"
                >
                  Pay Now
                </button>
              </div>

              <p className="text-xs text-gray-500 text-center">
                Secure payment powered by Stripe. Your data is encrypted and protected.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
