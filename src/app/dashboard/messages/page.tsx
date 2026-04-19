'use client';

import Link from 'next/link';
import { ArrowLeft, Send } from 'lucide-react';

export default function MessagesPage() {
  const conversations = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      lastMessage: 'Great work on your recent assignment!',
      timestamp: '2 hours ago',
      unread: 1,
    },
    {
      id: 2,
      name: 'Impact Community Group',
      lastMessage: 'Don\'t forget about the cleanup event tomorrow',
      timestamp: '4 hours ago',
      unread: 0,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/community" className="text-primary-400 hover:text-primary-300">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-4xl font-black text-white">Messages</h1>
          <p className="text-gray-400">Chat with your instructors and classmates</p>
        </div>
      </div>

      <div className="space-y-4">
        {conversations.map((conv) => (
          <div key={conv.id} className="bg-dark-500 border border-dark-400 rounded-2xl p-6 hover:border-primary-500 transition-all cursor-pointer">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">{conv.name}</h3>
                <p className="text-gray-400 text-sm mt-2">{conv.lastMessage}</p>
                <p className="text-gray-500 text-xs mt-2">{conv.timestamp}</p>
              </div>
              {conv.unread > 0 && (
                <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                  {conv.unread}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
