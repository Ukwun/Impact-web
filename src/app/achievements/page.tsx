'use client';

import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSocket } from "@/hooks/useSocket";
import { AchievementsBadges, AchievementsProgress } from "@/components/AchievementsBadges";
import { AUTH_TOKEN_KEY } from "@/lib/authStorage";

export default function AchievementsPage() {
  const { user } = useAuth();
  const { isConnected } = useSocket({
    userId: user?.id,
    token: typeof window !== "undefined" ? localStorage.getItem(AUTH_TOKEN_KEY) || undefined : undefined,
    enabled: !!user,
  });

  const [refreshKey, setRefreshKey] = useState(0);

  // Real-time achievement updates
  useEffect(() => {
    if (!user || !isConnected) return;

    const handleAchievementUnlocked = (achievementData: any) => {
      console.log("🏆 Achievement unlocked:", achievementData);
      
      // Force refresh of achievement components
      setRefreshKey(prev => prev + 1);
      
      // Show notification (you could add a toast notification here)
      if (achievementData.userId === user.id) {
        console.log(`🎉 You unlocked: ${achievementData.achievementName}`);
      }
    };

    const handleAchievementsUpdated = (updateData: any) => {
      console.log("🔄 Achievements updated:", updateData);
      
      // Refresh achievement data
      setRefreshKey(prev => prev + 1);
    };

    // Listen for achievement events
    const socket = (window as any).socket;
    if (socket) {
      socket.on('achievement:unlocked', handleAchievementUnlocked);
      socket.on('achievements:updated', handleAchievementsUpdated);
    }

    return () => {
      if (socket) {
        socket.off('achievement:unlocked', handleAchievementUnlocked);
        socket.off('achievements:updated', handleAchievementsUpdated);
      }
    };
  }, [user, isConnected]);

  return (
    <main className="min-h-screen bg-dark-950 pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">
            Your Achievements
          </h1>
          <p className="text-gray-400">
            Unlock badges and achievements as you progress through your learning
            journey
          </p>
        </div>

        {/* Progress Section */}
        <div className="bg-dark-900 rounded-lg p-6 mb-8 border border-gray-800">
          <h2 className="text-xl font-semibold text-white mb-4">
            Completion Progress
          </h2>
          <AchievementsProgress key={`progress-${refreshKey}`} />
        </div>

        {/* Achievements Grid */}
        <div className="bg-dark-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-xl font-semibold text-white mb-6">
            Your Badges
          </h2>
          <div className="flex flex-wrap gap-8">
            <AchievementsBadges key={`badges-${refreshKey}`} />
          </div>
        </div>
      </div>
    </main>
  );
}
