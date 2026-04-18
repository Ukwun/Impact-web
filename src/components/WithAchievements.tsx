"use client";

import React, { useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AchievementNotification } from "./AchievementsBadges";
import { AUTH_TOKEN_KEY } from "@/lib/authStorage";
import { getApiUrl } from "@/lib/apiConfig";

interface AchievementReward {
  badge: string;
  title: string;
  description: string;
  icon: string;
}

interface WithAchievementsProps {
  children: React.ReactNode;
  achievements?: AchievementReward[];
  onAchievementUnlocked?: (achievement: AchievementReward) => void;
}

/**
 * Wrapper component that manages achievement unlocking
 * Can be used to wrap course completion, lesson completion, etc.
 */
export function WithAchievements({
  children,
  achievements = [],
  onAchievementUnlocked,
}: WithAchievementsProps) {
  const { user } = useAuth();
  const [unlockedAchievements, setUnlockedAchievements] = React.useState<
    AchievementReward[]
  >([]);

  const unlockAchievement = useCallback(
    async (achievement: AchievementReward) => {
      if (!user) return;

      try {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        const res = await fetch(getApiUrl("/api/achievements/user"), {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
            ...achievement,
          }),
        });

        if (res.ok) {
          setUnlockedAchievements((prev) => [...prev, achievement]);
          onAchievementUnlocked?.(achievement);

          // Auto-remove notification after 4 seconds
          setTimeout(() => {
            setUnlockedAchievements((prev) =>
              prev.filter((a) => a.badge !== achievement.badge)
            );
          }, 4000);
        }
      } catch (error) {
        console.error("Failed to unlock achievement:", error);
      }
    },
    [user, onAchievementUnlocked]
  );

  // Clone children and inject achievement unlocking function
  const enhancedChildren = React.cloneElement(children as React.ReactElement, {
    unlockAchievement,
  } as any);

  return (
    <>
      {enhancedChildren}
      {unlockedAchievements.map((achievement) => (
        <AchievementNotification
          key={achievement.badge}
          icon={achievement.icon}
          title={achievement.title}
          onClose={() =>
            setUnlockedAchievements((prev) =>
              prev.filter((a) => a.badge !== achievement.badge)
            )
          }
        />
      ))}
    </>
  );
}

/**
 * Hook for unlocking achievements in components
 * Usage:
 * const { unlockAchievement } = useAchievementUnlocker();
 * await unlockAchievement({ badge: 'first-course', ... });
 */
export function useAchievementUnlocker() {
  const { user } = useAuth();
  const [recentUnlocks, setRecentUnlocks] = React.useState<
    AchievementReward[]
  >([]);

  const unlockAchievement = useCallback(
    async (achievement: AchievementReward) => {
      if (!user) return false;

      try {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        const res = await fetch(getApiUrl("/api/achievements/user"), {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
            ...achievement,
          }),
        });

        if (res.ok) {
          setRecentUnlocks((prev) => [...prev, achievement]);
          return true;
        }
        return false;
      } catch (error) {
        console.error("Failed to unlock achievement:", error);
        return false;
      }
    },
    [user]
  );

  const dismissUnlock = useCallback((badge: string) => {
    setRecentUnlocks((prev) => prev.filter((a) => a.badge !== badge));
  }, []);

  return {
    unlockAchievement,
    recentUnlocks,
    dismissUnlock,
  };
}
