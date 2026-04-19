'use client';

import Link from 'next/link';
import { Calendar, MapPin, Users } from 'lucide-react';

export default function ActivitiesPage() {
  const activities = [
    {
      id: 1,
      title: 'Community Cleanup Drive',
      date: '2026-04-25',
      location: 'Central Park',
      participants: 24,
      status: 'upcoming',
    },
    {
      id: 2,
      title: 'Sustainability Workshop',
      date: '2026-04-28',
      location: 'School Hall',
      participants: 18,
      status: 'upcoming',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black text-white mb-2">Upcoming Activities</h1>
        <p className="text-gray-400">Join community and learning activities</p>
      </div>

      <div className="space-y-6">
        {activities.map((activity) => (
          <div key={activity.id} className="bg-dark-500 border border-dark-400 rounded-2xl p-8 hover:border-primary-500 transition-all hover:shadow-lg hover:shadow-primary-500/10">
            <h2 className="text-2xl font-bold text-white mb-4">{activity.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center gap-3 text-gray-300">
                <Calendar size={20} className="text-primary-400" />
                <span>{activity.date}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <MapPin size={20} className="text-primary-400" />
                <span>{activity.location}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Users size={20} className="text-primary-400" />
                <span>{activity.participants} participants</span>
              </div>
            </div>
            <button className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg transition-colors">
              Join Activity
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
