'use client';

import Link from 'next/link';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export default function AnnouncementsPage() {
  const announcements = [
    {
      id: 1,
      title: 'New Course: Advanced Impact Strategies',
      date: '2026-04-18',
      important: true,
      description: 'A new course is now available for enrollment',
    },
    {
      id: 2,
      title: 'Reminder: Assignment Due Tomorrow',
      date: '2026-04-19',
      important: true,
      description: 'The Community Impact Plan assignment is due tomorrow at 11:59 PM',
    },
    {
      id: 3,
      title: 'School Hour Extended',
      date: '2026-04-17',
      important: false,
      description: 'The school has extended learning hours during weekends',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/community" className="text-primary-400 hover:text-primary-300">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-4xl font-black text-white">Announcements</h1>
          <p className="text-gray-400">Stay updated with important notices</p>
        </div>
      </div>

      <div className="space-y-4">
        {announcements.map((announcement) => (
          <div
            key={announcement.id}
            className={`rounded-2xl p-6 border transition-all ${
              announcement.important
                ? 'bg-yellow-600/20 border-yellow-500/50 hover:border-yellow-500'
                : 'bg-dark-500 border-dark-400 hover:border-primary-500'
            }`}
          >
            <div className="flex items-start gap-4">
              {announcement.important && (
                <AlertCircle className="text-yellow-400 flex-shrink-0 mt-1" size={24} />
              )}
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white">{announcement.title}</h3>
                <p className="text-gray-400 text-sm mt-2">{announcement.description}</p>
                <p className="text-gray-500 text-xs mt-4">{announcement.date}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
