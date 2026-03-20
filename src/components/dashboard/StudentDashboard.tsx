"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/hooks/useAuth";
import { useSocket } from "@/hooks/useSocket";
import { AUTH_TOKEN_KEY } from "@/lib/authStorage";
import {
  BookOpen,
  TrendingUp,
  CheckCircle,
  Award,
  Clock,
  MessageSquare,
  ArrowRight,
  Loader,
  AlertCircle,
} from "lucide-react";
import { useUserProgress } from "@/hooks/useLMS";
import {
  KPICard,
  ActionCard,
  InsightCard,
} from "@/components/dashboard/cards";

export default function StudentDashboard() {
  const [isVisible, setIsVisible] = useState(false);
  const { progress, loading, error } = useUserProgress();
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

  // Animation trigger
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Real-time notifications for achievements
  useEffect(() => {
    if (!user || !isConnected) return;

    const socket = (window as any).socket;
    if (!socket) return;

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
        success(
          "📈 Rank Updated!",
          `You're now rank #${rankData.newRank} on the leaderboard!`
        );
      }
    };

    socket.on('achievement:unlocked', handleAchievementUnlocked);
    socket.on('leaderboard:rank-changed', handleRankChanged);

    return () => {
      socket.off('achievement:unlocked', handleAchievementUnlocked);
      socket.off('leaderboard:rank-changed', handleRankChanged);
    };
  }, [user, isConnected, success]);

  const enrolledCourses = progress?.enrollments || [];
  const averageProgress =
    enrolledCourses.length > 0
      ? Math.round(
          enrolledCourses.reduce((sum, c) => sum + c.progress, 0) /
            enrolledCourses.length
        )
      : 0;
  const completedCourses = enrolledCourses.filter((c) => c.isCompleted).length;
  const totalAssignmentsSubmitted = enrolledCourses.reduce(
    (sum, course) => sum + (course.assignmentsSubmitted || 0),
    0
  );

  if (loading) {
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

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div
        className={`space-y-4 transition-all duration-700 transform ${
          isVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10"
        }`}
      >
        <div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-2">
            Welcome to Your Learning Journey 🚀
          </h1>
          <p className="text-base sm:text-lg text-gray-300">
            Track progress, complete courses, and unlock your potential
          </p>
        </div>
      </div>

      {/* TOP ROW: Status, Next Action, Progress (3 cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CARD 1: Continue Learning - Status */}
        {enrolledCourses.length > 0 && (
          <KPICard
            icon={BookOpen}
            label="Active Courses"
            value={enrolledCourses.length}
            status="In Progress"
            gradientFrom="from-primary-500"
            gradientTo="to-primary-600"
            borderColor="border-primary-400"
          />
        )}

        {/* CARD 2: Progress - Next Action */}
        <ActionCard
          title="Continue Current Course"
          description={
            enrolledCourses.length > 0
              ? `${enrolledCourses[0].course.title} - ${enrolledCourses[0].progress}% done`
              : "No active courses"
          }
          icon={TrendingUp}
          primaryAction={{
            label: "Resume",
            onClick: () => {
              if (enrolledCourses.length > 0) {
                window.location.href = `/dashboard/learn/lesson?id=${enrolledCourses[0].enrollmentId}`;
              }
            },
          }}
        />

        {/* CARD 3: Achievements - Progress Insight */}
        <InsightCard
          title="Your Progress"
          icon={CheckCircle}
          stats={[
            { label: "Courses", value: enrolledCourses.length },
            { label: "Completed", value: completedCourses },
            { label: "Avg Progress", value: `${averageProgress}%` },
          ]}
        >
          <p className="text-xs text-gray-400">
            {completedCourses > 0 ? (
              <>You've completed {completedCourses} course{completedCourses > 1 ? 's' : ''}!</>
            ) : (
              <>Start your first course to track progress</>
            )}
          </p>
        </InsightCard>
      </div>

      {/* CARD 4: Upcoming Activities */}
      <ActionCard
        title="Your Activities"
        description={
          totalAssignmentsSubmitted > 0
            ? `${totalAssignmentsSubmitted} assignment${totalAssignmentsSubmitted > 1 ? 's' : ''} submitted`
            : "No assignments yet"
        }
        icon={Clock}
        primaryAction={{
          label: "View All",
          onClick: () => (window.location.href = "/dashboard/activities"),
        }}
        variant="secondary"
      />

      {/* CARD 5: Messages / Notifications */}
      <ActionCard
        title="Messages & Notifications"
        description="Stay connected with facilitators and peers"
        icon={MessageSquare}
        primaryAction={{
          label: "Go to Messages",
          onClick: () => (window.location.href = "/dashboard/messages"),
        }}
        variant="primary"
      />

      {/* Empty State */}
      {enrolledCourses.length === 0 && (
        <Card className="p-12 text-center animate-fade-in">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">No Courses Yet</h3>
          <p className="text-gray-300 mb-6">
            Get started by browsing available courses and enrolling in one
          </p>
          <Link href="/programmes">
            <Button variant="primary" size="lg" className="gap-2">
              Explore Courses <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
