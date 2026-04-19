'use client';

import Link from 'next/link';
import { ArrowLeft, Users, MessageSquare } from 'lucide-react';

export default function ClassGroupPage() {
  const classmates = [
    { id: 1, name: 'Emma Chen', role: 'Student', active: true },
    { id: 2, name: 'James Okonkwo', role: 'Student', active: true },
    { id: 3, name: 'Maria García', role: 'Student', active: false },
    { id: 4, name: 'Alex Kumar', role: 'Student', active: true },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/community" className="text-primary-400 hover:text-primary-300">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-4xl font-black text-white">Class Group</h1>
          <p className="text-gray-400">Connect with your classmates</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {classmates.map((mate) => (
          <div key={mate.id} className="bg-dark-500 border border-dark-400 rounded-2xl p-6 hover:border-primary-500 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${mate.active ? 'bg-green-500' : 'bg-gray-500'}`} />
                  <h3 className="text-lg font-bold text-white">{mate.name}</h3>
                </div>
                <p className="text-gray-400 text-sm mt-1">{mate.role}</p>
              </div>
            </div>
            <button className="w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2">
              <MessageSquare size={16} />
              Send Message
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
