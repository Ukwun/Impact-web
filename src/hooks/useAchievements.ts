import { useEffect, useState, useCallback } from "react";
import { useAuth } from "./useAuth";
import { AUTH_TOKEN_KEY } from "@/lib/authStorage";

interface AchievementData {
  id: string;
  badge: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
}

interface AchievementsData {
  achievements: AchievementData[];
  totalUnlocked: number;
  totalAvailable: number;
  completionPercentage: number;
}

export function useAchievements() {
  const { user } = useAuth();
  const [data, setData] = useState<AchievementsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAchievements = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      const res = await fetch("/api/achievements/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch achievements");
      }

      const result = await res.json();
      if (result.success && result.data) {
        setData(result.data);
        setError(null);
      } else {
        setError(result.error || "Failed to fetch achievements");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAchievements();

    // Set up polling for new achievements (every 30 seconds)
    const interval = setInterval(fetchAchievements, 30000);
    return () => clearInterval(interval);
  }, [fetchAchievements]);

  return {
    achievements: data?.achievements || [],
    totalUnlocked: data?.totalUnlocked || 0,
    totalAvailable: data?.totalAvailable || 0,
    completionPercentage: data?.completionPercentage || 0,
    loading,
    error,
    refetch: fetchAchievements,
  };
}
