"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSocket } from "@/hooks/useSocket";
import { AUTH_TOKEN_KEY } from "@/lib/authStorage";
import Link from "next/link";
import Image from "next/image";

interface LeaderboardEntry {
  rank: number;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  totalScore: number;
  coursesCompleted: number;
  quizzesPassed: number;
  assignmentsSubmitted: number;
  perfectScores: number;
  streakDays: number;
  studyTimeMinutes: number;
  lastActivityAt: string;
}

interface UserRank {
  rank: number;
  totalScore: number;
  coursesCompleted: number;
  quizzesPassed: number;
  assignmentsSubmitted: number;
  perfectScores: number;
  streakDays: number;
  studyTimeMinutes: number;
  lastActivityAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const { isConnected } = useSocket({
    userId: user?.id,
    token: typeof window !== 'undefined' ? localStorage.getItem(AUTH_TOKEN_KEY) || "" : "",
    enabled: !!user
  });
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<UserRank | null>(null);
  const [selectedTab, setSelectedTab] = useState<"global" | "achievements">(
    "global"
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch global leaderboard
        const res = await fetch("/api/leaderboard?limit=50");
        const data = await res.json();

        if (data.success) {
          setLeaderboard(data.data);
        } else {
          setError(data.error || "Failed to fetch leaderboard");
        }

        // Fetch user's rank
        if (user) {
          const rankRes = await fetch("/api/leaderboard/my-rank", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem(AUTH_TOKEN_KEY)}`,
            },
          });
          const rankData = await rankRes.json();
          if (rankData.success && rankData.data) {
            setUserRank(rankData.data);
          }
        }
      } catch (err: any) {
        setError(err.message || "Failed to load leaderboard");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [user]);

  // Real-time leaderboard updates
  useEffect(() => {
    if (!user || !isConnected) return;

    const handleLeaderboardUpdate = (updateData: any) => {
      console.log("🔄 Real-time leaderboard update received:", updateData);
      
      // Refresh leaderboard data
      fetch("/api/leaderboard?limit=50")
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setLeaderboard(data.data);
          }
        })
        .catch(err => console.error("Failed to refresh leaderboard:", err));

      // Refresh user's rank if it might have changed
      fetch("/api/leaderboard/my-rank", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(AUTH_TOKEN_KEY)}`,
        },
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data) {
            setUserRank(data.data);
          }
        })
        .catch(err => console.error("Failed to refresh user rank:", err));
    };

    const handleRankChanged = (rankData: any) => {
      console.log("📈 User rank changed:", rankData);
      
      // Update user's rank
      if (rankData.userId === user.id) {
        setUserRank(prev => prev ? { ...prev, rank: rankData.newRank } : null);
      }
      
      // Refresh full leaderboard
      fetch("/api/leaderboard?limit=50")
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setLeaderboard(data.data);
          }
        })
        .catch(err => console.error("Failed to refresh leaderboard:", err));
    };

    // Listen for leaderboard updates
    const socket = (window as any).socket;
    if (socket) {
      socket.on('leaderboard:updated', handleLeaderboardUpdate);
      socket.on('leaderboard:rank-changed', handleRankChanged);
    }

    return () => {
      if (socket) {
        socket.off('leaderboard:updated', handleLeaderboardUpdate);
        socket.off('leaderboard:rank-changed', handleRankChanged);
      }
    };
  }, [user, isConnected]);

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return "";
  };

  const getGradeColor = (letterGrade: string) => {
    switch (letterGrade) {
      case "A":
        return "text-green-400";
      case "B":
        return "text-blue-400";
      case "C":
        return "text-yellow-400";
      case "D":
        return "text-orange-400";
      case "F":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 to-dark-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Leaderboard</h1>
          <p className="text-gray-400">
            Compete with other learners and earn achievements
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setSelectedTab("global")}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              selectedTab === "global"
                ? "bg-primary-600 text-white"
                : "bg-dark-800 text-gray-300 hover:bg-dark-700"
            }`}
          >
            🏆 Leaderboard
          </button>
          <button
            onClick={() => setSelectedTab("achievements")}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              selectedTab === "achievements"
                ? "bg-primary-600 text-white"
                : "bg-dark-800 text-gray-300 hover:bg-dark-700"
            }`}
          >
            ⭐ Achievements
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading leaderboard...</p>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500 text-red-400 px-6 py-4 rounded-lg text-center">
            {error}
          </div>
        ) : selectedTab === "global" ? (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* User's Current Rank */}
            {userRank && (
              <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg p-6 text-white">
                <h3 className="text-lg font-semibold mb-4">Your Rank</h3>
                <div className="text-center">
                  <div className="text-5xl font-bold mb-2">#{userRank.rank}</div>
                  <p className="text-primary-100 mb-4">
                    {userRank.user.firstName} {userRank.user.lastName}
                  </p>
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div>
                      <p className="text-sm text-primary-100">Total Score</p>
                      <p className="text-2xl font-bold">{userRank.totalScore}</p>
                    </div>
                    <div>
                      <p className="text-sm text-primary-100">Courses</p>
                      <p className="text-2xl font-bold">{userRank.coursesCompleted}</p>
                    </div>
                    <div>
                      <p className="text-sm text-primary-100">Quizzes Passed</p>
                      <p className="text-2xl font-bold">{userRank.quizzesPassed}</p>
                    </div>
                    <div>
                      <p className="text-sm text-primary-100">Perfect Scores</p>
                      <p className="text-2xl font-bold">{userRank.perfectScores}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Top 50 Leaderboard */}
            <div className="lg:col-span-2 bg-dark-800 border border-gray-700 rounded-lg overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-4">
                  Top Learners
                </h3>
                <div className="space-y-2">
                  {leaderboard.length > 0 ? (
                    leaderboard.map((entry) => (
                      <div
                        key={`${entry.rank}-${entry.user.id}`}
                        className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                          entry.rank <= 3
                            ? "bg-yellow-500/10 border border-yellow-500/20"
                            : "bg-dark-900 hover:bg-dark-700"
                        }`}
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex items-center gap-2 w-12">
                            <span className="text-lg font-bold text-yellow-400">
                              {getMedalEmoji(entry.rank)}
                            </span>
                            <span className="font-bold text-white">
                              #{entry.rank}
                            </span>
                          </div>

                          {entry.user.avatar && (
                            <Image
                              src={entry.user.avatar}
                              alt={entry.user.firstName}
                              width={40}
                              height={40}
                              className="rounded-full"
                            />
                          )}

                          <div>
                            <p className="font-semibold text-white">
                              {entry.user.firstName} {entry.user.lastName}
                            </p>
                            <p className="text-sm text-gray-400">
                              {entry.coursesCompleted} courses • {entry.quizzesPassed} quizzes
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-lg font-bold text-white">
                              {entry.totalScore}
                            </p>
                            <p className="text-xs text-gray-400">points</p>
                          </div>
                          {entry.perfectScores > 0 && (
                            <div className="text-right">
                              <p className="text-sm font-bold text-yellow-400">
                                ⭐ {entry.perfectScores}
                              </p>
                              <p className="text-xs text-gray-400">perfect</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-center py-8">
                      No leaderboard data available yet
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <AchievementsTab userId={user?.id} />
        )}
      </div>
    </div>
  );
}

function AchievementsTab({ userId }: { userId?: string }) {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [userAchievements, setUserAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [completion, setCompletion] = useState(0);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        // Fetch all available achievements
        const res = await fetch("/api/achievements");
        const data = await res.json();
        if (data.success) {
          setAchievements(data.data);
        }

        // Fetch user's achievements
        if (userId) {
          const userRes = await fetch("/api/achievements/user", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
          });
          const userData = await userRes.json();
          if (userData.success && userData.data) {
            setUserAchievements(userData.data.achievements);
            setCompletion(userData.data.completionPercentage);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, [userId]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
        <p className="text-gray-400">Loading achievements...</p>
      </div>
    );
  }

  const unlockedBadges = userAchievements.map((a) => a.badge);

  return (
    <div>
      {/* Progress */}
      <div className="bg-dark-800 border border-gray-700 rounded-lg p-6 mb-8">
        <h3 className="text-xl font-semibold text-white mb-4">
          Achievement Progress
        </h3>
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-300">
            {userAchievements.length} of {achievements.length} Unlocked
          </p>
          <p className="text-2xl font-bold text-primary-400">{completion}%</p>
        </div>
        <div className="w-full bg-dark-900 rounded-full h-4">
          <div
            className="bg-gradient-to-r from-primary-500 to-primary-400 h-4 rounded-full transition-all duration-500"
            style={{ width: `${completion}%` }}
          ></div>
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((achievement) => {
          const isUnlocked = unlockedBadges.includes(achievement.badge);
          const userAchievement = userAchievements.find(
            (a) => a.badge === achievement.badge
          );

          return (
            <div
              key={achievement.id}
              className={`rounded-lg p-6 transition-all border ${
                isUnlocked
                  ? "bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30"
                  : "bg-dark-800 border-gray-700 opacity-50"
              }`}
            >
              <div className="text-5xl mb-3">{achievement.icon}</div>
              <h4 className="font-semibold text-white mb-1">
                {achievement.title}
              </h4>
              <p className="text-sm text-gray-400 mb-3">
                {achievement.description}
              </p>

              <div className="flex items-center justify-between">
                <span className="inline-block bg-primary-600/20 text-primary-300 text-xs font-semibold px-3 py-1 rounded">
                  +{achievement.points} pts
                </span>
                {isUnlocked && (
                  <span className="text-xs text-gray-400">
                    Unlocked{" "}
                    {userAchievement?.unlockedAt &&
                      new Date(userAchievement.unlockedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
