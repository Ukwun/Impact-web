"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/hooks/useAuth";
import { useSocket } from "@/hooks/useSocket";
import { AUTH_TOKEN_KEY } from "@/lib/authStorage";
import {
  BookOpen,
  TrendingUp,
  CheckCircle,
  Award,
  Zap,
  Clock,
  Target,
  Flame,
  Users,
  ArrowRight,
  Loader,
  AlertCircle,
} from "lucide-react";
import { useUserProgress } from "@/hooks/useLMS";

export default function StudentDashboard() {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const { progress, loading, error } = useUserProgress();
  const { ref: coursesSectionRef, isVisible: coursesSectionVisible } = useScrollAnimation();
  const { ref: assignmentsSectionRef, isVisible: assignmentsSectionVisible } = useScrollAnimation();
  const { ref: goalsSectionRef, isVisible: goalsSectionVisible } = useScrollAnimation();
  const { user } = useAuth();
  const { isConnected } = useSocket({
    userId: user?.id,
    token:
      typeof window !== "undefined"
        ? localStorage.getItem(AUTH_TOKEN_KEY) ?? undefined
        : undefined,
    enabled: !!user,
  });
  const { success, info } = useToast();

  console.log("📊 StudentDashboard mounted. Loading:", loading, "Error:", error, "Progress:", progress);

  // Animation triggers
  useEffect(() => {
    setIsVisible(true);

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Real-time notifications
  useEffect(() => {
    if (!user || !isConnected) return;

    const handleAchievementUnlocked = (achievementData: any) => {
      if (achievementData.userId === user.id) {
        success(
          "🏆 Achievement Unlocked!",
          `You unlocked: ${achievementData.achievementName}`
        );
      }
    };

    const handleRankChanged = (rankData: any) => {
      if (rankData.userId === user.id) {
        if (rankData.newRank < rankData.oldRank) {
          success(
            "📈 Rank Improved!",
            `You moved up to rank #${rankData.newRank} on the leaderboard!`
          );
        } else if (rankData.newRank > rankData.oldRank) {
          info(
            "📉 Rank Changed",
            `Your leaderboard rank is now #${rankData.newRank}`
          );
        }
      }
    };

    const handleLeaderboardUpdate = () => {
      // Could show a subtle notification that leaderboard was updated
      console.log("🔄 Leaderboard updated globally");
    };

    // Listen for real-time events
    const socket = (window as any).socket;
    if (socket) {
      socket.on('achievement:unlocked', handleAchievementUnlocked);
      socket.on('leaderboard:rank-changed', handleRankChanged);
      socket.on('leaderboard:updated', handleLeaderboardUpdate);
    }

    return () => {
      if (socket) {
        socket.off('achievement:unlocked', handleAchievementUnlocked);
        socket.off('leaderboard:rank-changed', handleRankChanged);
        socket.off('leaderboard:updated', handleLeaderboardUpdate);
      }
    };
  }, [user, isConnected, success, info]);

  const enrolledCourses = progress?.enrollments || [];
  // For now, just show total assignments submitted across all courses
  const totalAssignmentsSubmitted = enrolledCourses.reduce(
    (sum, course) => sum + (course.assignmentsSubmitted || 0),
    0
  );

  console.log("📊 Enrolled courses:", enrolledCourses.length);

  if (loading) {
    console.log("📊 StudentDashboard: Showing loading state");
    return (
      <div className="flex items-center justify-center min-h-96">
        <Card className="p-12 flex flex-col items-center gap-4 animate-fade-in">
          <Loader className="w-10 h-10 animate-spin text-primary-500" />
          <p className="text-gray-300 text-lg">Loading your dashboard...</p>
        </Card>
      </div>
    );
  }

  if (error) {
    console.log("📊 StudentDashboard: Showing error state:", error);
    return (
      <Card className="p-8 border-l-4 border-danger-500 bg-danger-50 animate-fade-in">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-7 h-7 text-danger-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-danger-700 text-lg">Error Loading Dashboard</h3>
            <p className="text-danger-600 mt-2">{error}</p>
          </div>
        </div>
      </Card>
    );
  }

  console.log("📊 StudentDashboard: Showing content with", enrolledCourses.length, "courses");

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Section - Entrance Animation */}
      <div
        className={`space-y-6 transition-all duration-700 transform ${
          isVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10"
        }`}
      >
        <div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-2">
            Welcome on Your Impact Journey 🚀
          </h1>
          <p className="text-base sm:text-lg text-gray-300">Learn, connect, participate, grow, and lead. Track your progress and unlock your potential</p>
        </div>

        {/* Key Metrics - Staggered Animation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {/* Courses Card */}
          <div
            className="group relative overflow-hidden rounded-xl p-6 bg-gradient-to-br from-primary-500 to-primary-600 text-white hover:shadow-xl transition-all duration-300 border border-primary-400 border-opacity-50 animate-fade-in"
            style={{ animationDelay: "0ms" }}
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <BookOpen className="w-6 h-6 opacity-90" />
                <span className="text-xs font-bold opacity-80 uppercase tracking-wider">Active</span>
              </div>
              <p className="text-sm opacity-90 mb-2 font-medium">Courses</p>
              <p className="text-3xl font-black">{enrolledCourses.length}</p>
            </div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-5 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-300"></div>
          </div>

          {/* Progress Card */}
          <div
            className="group relative overflow-hidden rounded-xl p-6 bg-gradient-to-br from-secondary-500 to-secondary-600 text-white hover:shadow-xl transition-all duration-300 border border-secondary-400 border-opacity-50 animate-fade-in"
            style={{ animationDelay: "100ms" }}
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <TrendingUp className="w-6 h-6 opacity-90" />
                <span className="text-xs font-bold opacity-80 uppercase tracking-wider">Avg</span>
              </div>
              <p className="text-sm opacity-90 mb-2 font-medium">Progress</p>
              <p className="text-3xl font-black">
                {enrolledCourses.length > 0
                  ? Math.round(
                      enrolledCourses.reduce((sum, c) => sum + c.progress, 0) /
                        enrolledCourses.length
                    )
                  : 0}
                %
              </p>
            </div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-5 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-300"></div>
          </div>

          {/* Completed Card */}
          <div
            className="group relative overflow-hidden rounded-xl p-6 bg-gradient-to-br from-green-500 to-green-600 text-white hover:shadow-xl transition-all duration-300 border border-green-400 border-opacity-50 animate-fade-in"
            style={{ animationDelay: "200ms" }}
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <CheckCircle className="w-6 h-6 opacity-90" />
                <span className="text-xs font-bold opacity-80 uppercase tracking-wider">Done</span>
              </div>
              <p className="text-sm opacity-90 mb-2 font-medium">Completed</p>
              <p className="text-3xl font-black">
                {enrolledCourses.filter((c) => c.isCompleted).length}
              </p>
            </div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-5 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-300"></div>
          </div>

          {/* Assignments Card */}
          <div
            className="group relative overflow-hidden rounded-xl p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-xl transition-all duration-300 border border-blue-400 border-opacity-50 animate-fade-in"
            style={{ animationDelay: "300ms" }}
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <Clock className="w-6 h-6 opacity-90" />
                <span className="text-xs font-bold opacity-80 uppercase tracking-wider">Due</span>
              </div>
              <p className="text-sm opacity-90 mb-2 font-medium">Assignments</p>
              <p className="text-3xl font-black">{totalAssignmentsSubmitted}</p>
            </div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-5 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-300"></div>
          </div>

          {/* Achievements Card */}
          <div
            className="group relative overflow-hidden rounded-xl p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:shadow-xl transition-all duration-300 border border-purple-400 border-opacity-50 animate-fade-in"
            style={{ animationDelay: "400ms" }}
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <Award className="w-6 h-6 opacity-90" />
                <span className="text-xs font-bold opacity-80 uppercase tracking-wider">Points</span>
              </div>
              <p className="text-sm opacity-90 mb-2 font-medium">Achievements</p>
              <p className="text-3xl font-black">
                {enrolledCourses.reduce((sum, c) => sum + Math.round(c.progress * 10), 0)}
              </p>
            </div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-5 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-300"></div>
          </div>
        </div>
      </div>

      {/* Continue Learning Section */}
      {enrolledCourses.length > 0 && (
        <div ref={coursesSectionRef} className={`space-y-6 animate-fade-in scroll-fade-in ${coursesSectionVisible ? 'visible' : ''}`} style={{ animationDelay: "500ms" }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-text-500 mb-1">Continue Learning</h2>
              <p className="text-gray-300">Pick up where you left off</p>
            </div>
            <Button variant="primary" size="sm" className="gap-2">
              View All <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {enrolledCourses.slice(0, 2).map((enrollment, idx) => (
              <div
                key={enrollment.enrollmentId}
                className="group relative overflow-hidden rounded-2xl bg-dark-700/50 border-2 border-dark-600 hover:border-primary-300 hover:shadow-xl transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${550 + idx * 100}ms` }}
              >
                {/* Background gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-primary-600 opacity-0 group-hover:opacity-5 transition-opacity"></div>

                <div className="relative p-8 space-y-6">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-2xl font-black text-text-500 mb-2 group-hover:text-primary-600 transition-colors">
                        {enrollment.course.title}
                      </h3>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {enrollment.course.description}
                      </p>
                    </div>
                    <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <span className="text-white font-black text-xl">
                        {enrollment.progress}%
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Progress
                      </span>
                      <span className="text-sm font-bold text-primary-600">
                        {enrollment.progress}% Complete
                      </span>
                    </div>
                    <div className="w-full h-3 bg-dark-600 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all duration-500"
                        style={{ width: `${enrollment.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                    <div className="text-center sm:text-left">
                      <p className="text-xs text-gray-400 font-semibold mb-1">LESSONS</p>
                      <p className="text-2xl font-black text-text-500">
                        {enrollment.lessonsCompleted}/
                        {enrollment.totalLessons}
                      </p>
                    </div>
                    <div className="text-center sm:text-right">
                      <p className="text-xs text-gray-400 font-semibold mb-1">QUIZZES</p>
                      <p className="text-2xl font-black text-secondary-600">
                        {enrollment.quizzesCompleted}
                      </p>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full gap-2 group/btn"
                    asChild
                  >
                    <a href={`/dashboard/learn/lesson?id=${enrollment.enrollmentId}`}>
                      Continue Course <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </a>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Assignments */}
      {totalAssignmentsSubmitted > 0 && (
        <div ref={assignmentsSectionRef} className={`space-y-6 animate-fade-in scroll-slide-up ${assignmentsSectionVisible ? 'visible' : ''}`} style={{ animationDelay: "700ms" }}>
          <div>
            <h2 className="text-3xl font-black text-text-500 mb-1">Assignments</h2>
            <p className="text-gray-300">You've submitted {totalAssignmentsSubmitted} assignment{totalAssignmentsSubmitted !== 1 ? 's' : ''} across your courses</p>
          </div>
        </div>
      )}

      {/* Learning Goals */}
      {enrolledCourses.length > 0 && (
        <div ref={goalsSectionRef} className={`space-y-6 animate-fade-in scroll-scale ${goalsSectionVisible ? 'visible' : ''}`} style={{ animationDelay: "900ms" }}>
          <div>
            <h2 className="text-3xl font-black text-text-500 mb-1">Learning Goals</h2>
            <p className="text-gray-300">Track your progress towards mastery</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                goal: `Complete ${enrolledCourses.length} courses`,
                progress: enrolledCourses.filter((c) => c.isCompleted).length,
                target: enrolledCourses.length,
                icon: BookOpen,
                color: "from-primary-500 to-primary-600",
              },
              {
                goal: "Average 75% progress",
                progress: Math.round(
                  enrolledCourses.reduce((sum, c) => sum + c.progress, 0) /
                    enrolledCourses.length
                ),
                target: 75,
                icon: TrendingUp,
                color: "from-secondary-500 to-secondary-600",
              },
            ].map((item, idx) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={idx}
                  className="group relative overflow-hidden rounded-2xl p-6 bg-dark-700/50 border-2 border-dark-600 hover:border-primary-300 hover:shadow-xl transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${950 + idx * 100}ms` }}
                >
                  {/* Gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 transition-opacity`}></div>

                  <div className="relative space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-sm font-bold text-primary-600">
                        {Math.round((item.progress / item.target) * 100)}%
                      </span>
                    </div>

                    <h3 className="font-bold text-lg text-text-500 group-hover:text-primary-600 transition-colors">
                      {item.goal}
                    </h3>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-300">
                          {item.progress} of {item.target}
                        </span>
                        <span className="font-bold text-primary-600">
                          {Math.round((item.progress / item.target) * 100)}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-dark-600 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-500`}
                          style={{
                            width: `${Math.min(
                              (item.progress / item.target) * 100,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {enrolledCourses.length === 0 && (
        <div className="flex items-center justify-center min-h-96 animate-fade-in" style={{ animationDelay: "500ms" }}>
          <div className="text-center space-y-6 max-w-md">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-2xl flex items-center justify-center mx-auto">
              <BookOpen className="w-10 h-10 text-primary-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-text-500">
                No Courses Yet
              </h3>
              <p className="text-gray-300">
                Get started by enrolling in a course to begin your learning journey!
              </p>
            </div>
            <Link href="/dashboard/courses" className="w-full">
              <Button variant="primary" size="lg" className="gap-2 w-full">
                Browse Courses <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
