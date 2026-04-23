'use client';

import { useEffect, useState } from 'react';
import { Trophy, Target, Loader, Sparkles } from 'lucide-react';
import { AUTH_TOKEN_KEY } from '@/lib/authStorage';
import { Card } from '@/components/ui/Card';

interface AchievementItem {
  id: string;
  badge: string;
  title: string;
  description?: string;
  icon?: string;
  unlockedAt: string;
}

interface AchievementResponse {
  achievements: AchievementItem[];
  totalUnlocked: number;
  totalAvailable: number;
  completionPercentage: number;
}

export default function AchievementsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AchievementResponse | null>(null);

  useEffect(() => {
    const loadAchievements = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        const response = await fetch('/api/achievements/user', {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
        });

        const body = await response.json();
        if (!response.ok || !body?.success) {
          throw new Error(body?.error || 'Failed to load achievements');
        }

        setData(body.data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load achievements';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadAchievements();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8 border border-danger-500 bg-danger-500/10">
        <p className="text-danger-500 font-bold">Could not load achievements</p>
        <p className="text-gray-300 mt-2">{error}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-4xl font-black text-white mb-2">Achievements</h1>
        <p className="text-gray-400">Track badges and progress milestones across your learning journey.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 bg-dark-700/40 border border-primary-500/40">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-primary-400" />
            <div>
              <p className="text-xs text-primary-300 font-semibold">Unlocked</p>
              <p className="text-2xl text-white font-black">{data?.totalUnlocked || 0}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5 bg-dark-700/40 border border-secondary-500/40">
          <div className="flex items-center gap-3">
            <Target className="w-6 h-6 text-secondary-400" />
            <div>
              <p className="text-xs text-secondary-300 font-semibold">Available</p>
              <p className="text-2xl text-white font-black">{data?.totalAvailable || 0}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5 bg-dark-700/40 border border-blue-500/40">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-blue-400" />
            <div>
              <p className="text-xs text-blue-300 font-semibold">Completion</p>
              <p className="text-2xl text-white font-black">{data?.completionPercentage || 0}%</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {(data?.achievements || []).map((achievement) => (
          <Card key={achievement.id} className="p-5 border border-dark-400 bg-dark-600/50 hover:border-primary-500 transition-colors">
            <div className="flex items-start gap-3">
              <div className="text-3xl">{achievement.icon || '🏆'}</div>
              <div>
                <h3 className="text-lg font-bold text-white">{achievement.title}</h3>
                <p className="text-xs text-primary-300 font-semibold uppercase tracking-wide mt-1">{achievement.badge}</p>
              </div>
            </div>
            <p className="text-gray-300 mt-4 text-sm">{achievement.description || 'Achievement unlocked by completing a learning milestone.'}</p>
            <p className="text-gray-500 mt-4 text-xs">Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}</p>
          </Card>
        ))}
      </div>

      {data?.achievements?.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-gray-300">No achievements unlocked yet. Complete lessons and activities to start earning badges.</p>
        </Card>
      )}
    </div>
  );
}
