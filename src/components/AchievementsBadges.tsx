"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AUTH_TOKEN_KEY } from "@/lib/authStorage";

interface AchievementData {
  id: string;
  badge: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
}

export function AchievementsBadges() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<AchievementData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchAchievements = async () => {
      try {
        const res = await fetch("/api/achievements/user", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(AUTH_TOKEN_KEY)}`,
          },
        });
        const data = await res.json();
        if (data.success && data.data) {
          setAchievements(data.data.achievements);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, [user]);

  if (loading) {
    return <div className="animate-pulse h-12 bg-gray-700 rounded w-32"></div>;
  }

  if (achievements.length === 0) {
    return (
      <div className="text-gray-500 text-sm">
        No achievements yet. Start learning to unlock badges!
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {achievements.map((achievement) => (
        <div
          key={achievement.id}
          title={`${achievement.title}: ${achievement.description}`}
          className="group relative cursor-help"
        >
          <span className="text-2xl inline-block">{achievement.icon}</span>
          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="bg-dark-800 border border-gray-600 rounded px-2 py-1 whitespace-nowrap text-xs text-white">
              {achievement.title}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function AchievementsProgress() {
  const { user } = useAuth();
  const [completion, setCompletion] = useState(0);
  const [totalUnlocked, setTotalUnlocked] = useState(0);
  const [totalAvailable, setTotalAvailable] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchProgress = async () => {
      try {
        const res = await fetch("/api/achievements/user", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(AUTH_TOKEN_KEY)}`,
          },
        });
        const data = await res.json();
        if (data.success && data.data) {
          setCompletion(data.data.completionPercentage);
          setTotalUnlocked(data.data.totalUnlocked);
          setTotalAvailable(data.data.totalAvailable);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [user]);

  if (loading) {
    return <div className="animate-pulse h-4 bg-gray-700 rounded w-full"></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-300">
          Achievements
        </span>
        <span className="text-xs text-primary-400 font-semibold">
          {totalUnlocked}/{totalAvailable}
        </span>
      </div>
      <div className="w-full bg-dark-900 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-primary-500 to-primary-400 h-2 rounded-full transition-all duration-500"
          style={{ width: `${completion}%` }}
        ></div>
      </div>
    </div>
  );
}

/**
 * Achievement notification component (appears when achievement is unlocked)
 */
export function AchievementNotification({
  title,
  icon,
  onClose,
}: {
  title: string;
  icon: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-6 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg p-4 shadow-lg animate-bounce max-w-xs">
      <div className="flex items-center gap-3">
        <span className="text-3xl">{icon}</span>
        <div>
          <p className="font-bold text-white">Achievement Unlocked!</p>
          <p className="text-sm text-yellow-100">{title}</p>
        </div>
        <button
          onClick={onClose}
          className="ml-2 text-yellow-900 hover:text-yellow-950 font-bold"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
