'use client';

import Link from 'next/link';
import { ArrowLeft, Award } from 'lucide-react';

export default function BadgesPage() {
  const badges = [
    { id: 1, name: 'First Steps', description: 'Complete your first lesson', unlocked: true },
    { id: 2, name: 'Community Champion', description: 'Participate in 5 community activities', unlocked: true },
    { id: 3, name: 'Learning Master', description: 'Complete 3 full courses', unlocked: false },
    { id: 4, name: 'Impact Leader', description: 'Lead 2 impact projects', unlocked: false },
    { id: 5, name: 'SDG Expert', description: 'Master all SDG topics', unlocked: true },
    { id: 6, name: 'Challenge Champion', description: 'Win 5 challenges', unlocked: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/achievements" className="text-primary-400 hover:text-primary-300">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-4xl font-black text-white">Badges</h1>
            <p className="text-gray-400 mt-1">Earn badges by achieving milestones</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`rounded-2xl p-6 text-center transition-all ${
                badge.unlocked
                  ? 'bg-gradient-to-br from-primary-600 to-primary-700 hover:shadow-lg hover:shadow-primary-600/50'
                  : 'bg-dark-600 border border-dark-500 opacity-50'
              }`}
            >
              <div className="flex justify-center mb-4">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center ${badge.unlocked ? 'bg-primary-500' : 'bg-dark-500'}`}>
                  <Award className="text-white" size={40} />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{badge.name}</h3>
              <p className="text-sm mb-4 opacity-90">{badge.description}</p>
              {badge.unlocked && <span className="text-sm font-semibold">✓ Unlocked</span>}
              {!badge.unlocked && <span className="text-sm font-semibold opacity-75">Locked</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
