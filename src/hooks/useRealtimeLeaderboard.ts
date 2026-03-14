"use client";

import { useEffect, useState } from "react";
import { useSocket } from "./useSocket";

interface LeaderboardUpdate {
  rank: number;
  userId: string;
  score: number;
  percentage: number;
}

interface AchievementUnlock {
  userId: string;
  badge: string;
  title: string;
}

/**
 * Hook for real-time leaderboard and achievement updates
 * Listens to WebSocket events for leaderboard changes and achievement unlocks
 */
export function useRealtimeLeaderboard() {
  const { socket, subscribe, emit } = useSocket();
  const [leaderboardUpdates, setLeaderboardUpdates] = useState<
    LeaderboardUpdate[]
  >([]);
  const [achievementNotifications, setAchievementNotifications] = useState<
    AchievementUnlock[]
  >([]);

  useEffect(() => {
    if (!socket) return;

    // Listen for leaderboard updates
    const unsubscribeLeaderboard = subscribe(
      "leaderboard:updated",
      (data: LeaderboardUpdate) => {
        setLeaderboardUpdates((prev) => {
          // Keep only the last 10 updates for performance
          const updated = [data, ...prev].slice(0, 10);
          return updated;
        });
      }
    );

    // Listen for achievement unlocks
    const unsubscribeAchievement = subscribe(
      "achievement:unlocked",
      (data: AchievementUnlock) => {
        setAchievementNotifications((prev) => {
          const notifs = [data, ...prev].slice(0, 5);
          // Auto-remove notification after 5 seconds
          setTimeout(() => {
            setAchievementNotifications((current) =>
              current.filter((n) => n !== data)
            );
          }, 5000);
          return notifs;
        });
      }
    );

    return () => {
      unsubscribeLeaderboard?.();
      unsubscribeAchievement?.();
    };
  }, [socket, subscribe]);

  const emitLeaderboardUpdate = (data: LeaderboardUpdate) => {
    if (socket) {
      emit("leaderboard:update", data);
    }
  };

  const emitAchievementUnlock = (data: AchievementUnlock) => {
    if (socket) {
      emit("achievement:unlock", data);
    }
  };

  return {
    leaderboardUpdates,
    achievementNotifications,
    emitLeaderboardUpdate,
    emitAchievementUnlock,
  };
}

/**
 * Hook to listen for real-time leaderboard changes
 */
export function useLeaderboardRankChanges() {
  const { socket, subscribe } = useSocket();
  const [rankChanges, setRankChanges] = useState<
    { userId: string; oldRank: number; newRank: number }[]
  >([]);

  useEffect(() => {
    if (!socket) return;

    const unsubscribe = subscribe("leaderboard:rank-changed", (data) => {
      setRankChanges((prev) => [data, ...prev].slice(0, 20));
    });

    return () => {
      unsubscribe?.();
    };
  }, [socket, subscribe]);

  return rankChanges;
}
