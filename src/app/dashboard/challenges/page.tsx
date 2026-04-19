'use client';

import { Zap, Trophy, Users } from 'lucide-react';

export default function ChallengesPage() {
  const challenges = [
    {
      id: 1,
      title: '7-Day Impact Challenge',
      description: 'Complete 7 days of daily impact activities',
      participants: 234,
      reward: '50 points',
      difficulty: 'Easy',
    },
    {
      id: 2,
      title: 'Sustainability Expert',
      description: 'Complete all SDG-related lessons',
      participants: 89,
      reward: '100 points',
      difficulty: 'Hard',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black text-white mb-2">Challenges</h1>
        <p className="text-gray-400">Participate in challenges to earn rewards and recognition</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {challenges.map((challenge) => (
          <div key={challenge.id} className="bg-dark-500 border border-dark-400 rounded-2xl p-6 hover:border-primary-500 transition-all">
            <div className="flex items-start justify-between mb-4">
              <Trophy className="text-yellow-400" size={32} />
              <span className="px-3 py-1 bg-primary-600 text-white text-xs font-bold rounded-full">
                {challenge.difficulty}
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{challenge.title}</h3>
            <p className="text-gray-400 text-sm mb-4">{challenge.description}</p>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-gray-300">
                <Users size={16} />
                <span className="text-sm">{challenge.participants} joined</span>
              </div>
              <span className="text-primary-400 font-bold">{challenge.reward}</span>
            </div>
            <button className="w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg transition-colors">
              Join Challenge
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
