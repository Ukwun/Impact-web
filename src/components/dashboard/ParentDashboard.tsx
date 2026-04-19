"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from "@/lib/authStorage";
import {
  User,
  TrendingUp,
  Award,
  BookOpen,
  AlertCircle,
  MessageSquare,
  Calendar,
  Bell,
  Loader,
  Plus,
} from "lucide-react";
import {
  KPICard,
  ActionCard,
  InsightCard,
} from "@/components/dashboard/cards";

interface ChildData {
  id: string;
  name: string;
  grade: string;
  overallProgress: number;
  enrolledCourses: number;
  completedCourses: number;
  averageScore: number;
  lastActivity: string;
  attendanceRate: number;
  certificates: number;
}

export default function ParentDashboard() {
  const router = useRouter();
  const [children, setChildren] = useState<ChildData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    fetchChildren();
  }, []);

  // Handle invalid token errors
  useEffect(() => {
    if (error && (error.toLowerCase().includes("invalid token") || error.includes("401"))) {
      console.error("❌ Invalid token detected, clearing auth and redirecting to login");
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
      router.push("/auth/login?error=invalid_token");
    }
  }, [error, router]);

  const fetchChildren = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/parent-child');
      if (!response.ok) {
        throw new Error('Failed to fetch children data');
      }
      const data = await response.json();
      setChildren(data.children || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load children');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="p-8 flex flex-col items-center gap-4">
          <Loader className="w-8 h-8 animate-spin text-primary-600" />
          <p className="text-gray-300">Loading dashboard...</p>
        </Card>
      </div>
    );
  }

  if (error) {
    // If it's a token error, show loading while redirecting
    if (error.toLowerCase().includes("invalid token") || error.includes("401")) {
      return (
        <div className="flex items-center justify-center h-96">
          <Card className="p-8 flex flex-col items-center gap-4">
            <Loader className="w-8 h-8 animate-spin text-primary-600" />
            <p className="text-gray-300">Redirecting to login...</p>
          </Card>
        </div>
      );
    }

    // For other errors, show error message with retry option
    return (
      <Card className="p-6 border-l-4 border-red-500 bg-dark-700/50">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-red-900">Error Loading Dashboard</h3>
            <p className="text-red-700 mt-1">{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Try Again
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Show child linking state if no children linked
  if (children.length === 0) {
    return (
      <div className="space-y-8 pb-12">
        <div
          className={`space-y-4 transition-all duration-700 transform ${
            isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          }`}
        >
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-2">
              Parent Dashboard 👨‍👩‍👧‍👦
            </h1>
            <p className="text-base sm:text-lg text-gray-300">
              Monitor your children's learning and celebrate their achievements
            </p>
          </div>
        </div>

        <Card className="p-12 text-center animate-fade-in">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">No Children Linked</h3>
          <p className="text-gray-300 mb-6">
            Link your children's accounts to start monitoring their learning progress
          </p>
          <Button variant="primary" size="lg" className="gap-2">
            <Plus className="w-4 h-4" />
            Link Child Account
          </Button>
        </Card>
      </div>
    );
  }

  // Use first child as primary for dashboard overview
  const primaryChild = children[0];
  const secondaryChildren = children.slice(1);

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
            Parent Dashboard 👨‍👩‍👧‍👦
          </h1>
          <p className="text-base sm:text-lg text-gray-300">
            Monitor {children.length} child{children.length > 1 ? "ren" : ""}'s learning progress and celebrate achievements
          </p>
        </div>
      </div>

      {/* TOP ROW: Status, Next Action, Progress (3 cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CARD 1: Child Progress Snapshot - Status */}
        <KPICard
          icon={User}
          label={`${primaryChild.name}'s Progress`}
          value={primaryChild.overallProgress}
          unit="%"
          status={primaryChild.overallProgress > 75 ? "Excellent" : primaryChild.overallProgress > 50 ? "Good" : "Needs Help"}
          gradientFrom={primaryChild.overallProgress > 75 ? "from-green-500" : primaryChild.overallProgress > 50 ? "from-blue-500" : "from-amber-500"}
          gradientTo={primaryChild.overallProgress > 75 ? "to-green-600" : primaryChild.overallProgress > 50 ? "to-blue-600" : "to-amber-600"}
          borderColor={primaryChild.overallProgress > 75 ? "border-green-400" : primaryChild.overallProgress > 50 ? "border-blue-400" : "border-amber-400"}
        />

        {/* CARD 2: Course Engagement - Next Action */}
        <ActionCard
          title="Courses & Learning"
          description={`${primaryChild.completedCourses}/${primaryChild.enrolledCourses} courses completed`}
          icon={BookOpen}
          primaryAction={{
            label: "View Progress",
            onClick: () => console.log("View progress details"),
          }}
        />

        {/* CARD 3: Achievements & Certificates - Progress Insight */}
        <InsightCard
          title="Achievements"
          icon={Award}
          stats={[
            { label: "Certificates", value: primaryChild.certificates },
            { label: "Avg Score", value: `${primaryChild.averageScore}%` },
            { label: "Attendance", value: `${primaryChild.attendanceRate}%` },
          ]}
        >
          <p className="text-xs text-gray-400">
            {primaryChild.name} is performing {primaryChild.averageScore > 80 ? "excellently" : primaryChild.averageScore > 60 ? "well" : "keep supporting"}
          </p>
        </InsightCard>
      </div>

      {/* CARD 4: Recent Feedback & Updates */}
      <ActionCard
        title="Latest Updates"
        description={`Last activity: ${primaryChild.lastActivity}`}
        icon={Calendar}
        primaryAction={{
          label: "View Timeline",
          onClick: () => console.log("View activity timeline"),
        }}
        secondaryAction={{
          label: "Message Facilitator",
          onClick: () => console.log("Open message composer"),
        }}
        variant="secondary"
      />

      {/* CARD 5: Communication & Notifications */}
      <ActionCard
        title="Messages & Notifications"
        description={`Stay connected with ${primaryChild.name}'s learning team`}
        icon={MessageSquare}
        primaryAction={{
          label: "Go to Messages",
          onClick: () => (window.location.href = "/dashboard/messages"),
        }}
        variant="primary"
      />

      {/* Additional Children (if more than 1) */}
      {secondaryChildren.length > 0 && (
        <div className="space-y-6 pt-6 border-t border-dark-600">
          <h2 className="text-2xl font-bold text-white">Other Children</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {secondaryChildren.map((child) => (
              <Card key={child.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">{child.name}</h3>
                    <p className="text-sm text-gray-400">{child.grade} Level</p>
                  </div>
                  <div className="text-2xl font-black text-primary-400">
                    {child.overallProgress}%
                  </div>
                </div>
                <div className="h-2 bg-dark-600 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-500 to-secondary-500"
                    style={{ width: `${child.overallProgress}%` }}
                  ></div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    View Profile
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Info Card */}
      <Card className="p-6 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 border-l-4 border-primary-500">
        <h3 className="text-lg font-bold text-white mb-2">💡 Tip for Success</h3>
        <p className="text-gray-300 text-sm">
          Regular communication with facilitators and consistent encouragement help students succeed. Check in weekly to celebrate wins!
        </p>
      </Card>
    </div>
  );
}
