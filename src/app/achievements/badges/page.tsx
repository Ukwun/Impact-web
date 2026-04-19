'use client';

import Link from 'next/link';
import { ArrowLeft, Award, Loader, AlertCircle } from 'lucide-react';
import { useAchievements } from '@/hooks/useAchievements';

// All possible badges/achievements
const ALL_BADGES = [
  {
    id: 'first-lesson',
    badge: 'FIRST_LESSON',
    name: 'First Steps',
    description: 'Complete your first lesson',
    icon: '🚀',
  },
  {
    id: 'course-complete',
    badge: 'COURSE_COMPLETE',
    name: 'Course Master',
    description: 'Complete your first full course',
    icon: '📚',
  },
  {
    id: 'community-champion',
    badge: 'COMMUNITY_CHAMPION',
    name: 'Community Champion',
    description: 'Participate in 5 community activities',
    icon: '👥',
  },
  {
    id: 'learning-master',
    badge: 'LEARNING_MASTER',
    name: 'Learning Master',
    description: 'Complete 3 full courses',
    icon: '🎓',
  },
  {
    id: 'impact-leader',
    badge: 'IMPACT_LEADER',
    name: 'Impact Leader',
    description: 'Lead 2 impact projects',
    icon: '⭐',
  },
  {
    id: 'sdg-expert',
    badge: 'SDG_EXPERT',
    name: 'SDG Expert',
    description: 'Master all SDG topics',
    icon: '🌍',
  },
  {
    id: 'challenge-champion',
    badge: 'CHALLENGE_CHAMPION',
    name: 'Challenge Champion',
    description: 'Win 5 challenges',
    icon: '🏆',
  },
  {
    id: 'quick-learner',
    badge: 'QUICK_LEARNER',
    name: 'Quick Learner',
    description: 'Complete a course in under 1 week',
    icon: '⚡',
  },
];

export default function BadgesPage() {
  const { stats, loading, error } = useAchievements();

  const unlockedBadges = stats?.achievements.map((a) => a.badge) || [];

  const badges = ALL_BADGES.map((badge) => ({
    ...badge,
    unlocked: unlockedBadges.includes(badge.badge),
    unlockedAt: stats?.achievements.find((a) => a.badge === badge.badge)?.unlockedAt,
  })).sort((a, b) => {
    // Sort unlocked first, then by unlock date
    if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
    if (a.unlockedAt && b.unlockedAt) {
      return new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime();
    }
    return 0;
  });

  if (error) {
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

          <div className="bg-red-500/10 border border-red-500/50 rounded-2xl p-6 flex items-center gap-4">
            <AlertCircle className="text-red-400" size={24} />
            <div>
              <h3 className="text-white font-bold mb-1">Unable to load badges</h3>
              <p className="text-gray-400">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
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

          <div className="flex items-center justify-center py-12">
            <Loader className="animate-spin text-primary-400 mr-3" size={24} />
            <p className="text-gray-400">Loading badges...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/achievements" className="text-primary-400 hover:text-primary-300">
            <ArrowLeft size={24} />
          </Link>
          <div className="flex-1">
            <h1 className="text-4xl font-black text-white">Badges</h1>
            <p className="text-gray-400 mt-1">Earn badges by achieving milestones</p>
          </div>
          {stats && (
            <div className="text-right">
              <p className="text-3xl font-black text-primary-400">{stats.totalUnlocked}</p>
              <p className="text-gray-400 text-sm">of {stats.totalAvailable} unlocked ({stats.completionPercentage}%)</p>
            </div>
          )}
        </div>

        {stats && (
          <div className="mb-8 bg-dark-500 border border-primary-500/30 rounded-2xl p-6">
            <div className="w-full bg-dark-600 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all"
                style={{ width: `${stats.completionPercentage}%` }}
              />
            </div>
            <p className="text-gray-400 text-sm mt-3">
              You've unlocked {stats.completionPercentage}% of all available badges
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`rounded-2xl p-6 text-center transition-all overflow-hidden ${
                badge.unlocked
                  ? 'bg-gradient-to-br from-primary-600 to-primary-700 hover:shadow-lg hover:shadow-primary-600/50 border border-primary-500'
                  : 'bg-dark-600 border border-dark-500 opacity-60 hover:opacity-75'
              }`}
            >
              <div className="flex justify-center mb-4">
                <div className={`text-5xl p-4 rounded-2xl ${badge.unlocked ? 'bg-primary-500/30' : 'bg-dark-500'}`}>
                  {badge.icon}
                </div>
              </div>
              <h3 className={`text-xl font-bold mb-2 ${badge.unlocked ? 'text-white' : 'text-gray-400'}`}>
                {badge.name}
              </h3>
              <p className={`text-sm mb-4 ${badge.unlocked ? 'text-primary-100' : 'text-gray-500'}`}>
                {badge.description}
              </p>
              <div className="pt-4 border-t border-white/10">
                {badge.unlocked ? (
                  <div>
                    <p className="text-sm font-semibold text-white">✓ Unlocked</p>
                    {badge.unlockedAt && (
                      <p className="text-xs opacity-75 mt-1">
                        {new Date(badge.unlockedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm font-semibold text-gray-400">Locked</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
