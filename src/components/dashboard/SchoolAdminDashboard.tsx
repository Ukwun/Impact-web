"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useSchoolMetrics } from "@/hooks/useRoleDashboards";
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from "@/lib/authStorage";
import {
  Building2,
  Users,
  TrendingUp,
  BookOpen,
  AlertCircle,
  Settings,
  Plus,
  BarChart3,
  Loader,
  UserCheck,
} from "lucide-react";
import {
  KPICard,
  ActionCard,
  InsightCard,
} from "@/components/dashboard/cards";

export default function SchoolAdminDashboard() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const { data: schoolData, loading: schoolLoading, error: schoolError } = useSchoolMetrics();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Handle invalid token errors
  useEffect(() => {
    if (schoolError && (schoolError.toLowerCase().includes("invalid token") || schoolError.includes("401"))) {
      console.error("❌ Invalid token detected, clearing auth and redirecting to login");
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
      router.push("/auth/login?error=invalid_token");
    }
  }, [schoolError, router]);

  if (schoolLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="p-8 flex flex-col items-center gap-4">
          <Loader className="w-8 h-8 animate-spin text-primary-600" />
          <p className="text-gray-300">Loading dashboard...</p>
        </Card>
      </div>
    );
  }

  if (schoolError) {
    return (
      <Card className="p-8 border-l-4 border-danger-500 bg-danger-50">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-7 h-7 text-danger-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-danger-700 text-lg">Error Loading Dashboard</h3>
            <p className="text-danger-600 mt-2">{schoolError}</p>
            <Button onClick={() => router.refresh()} className="mt-4">
              Try Again
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  const schoolMetrics = schoolData?.metrics || {
    totalStudents: 0,
    totalFacilitators: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    completionRate: 0,
    averageProgress: 0,
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div
        className={`space-y-4 transition-all duration-700 transform ${
          isVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10"
        }`}
      >
        <div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-2">
            School Admin Dashboard 🏫
          </h1>
          <p className="text-base sm:text-lg text-gray-300">
            Manage your school's learning ecosystem and performance
          </p>
        </div>
      </div>

      {/* TOP ROW: Status, Next Action, Progress (3 cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CARD 1: School Overview - Status */}
        <KPICard
          icon={Building2}
          label="Total Students"
          value={schoolMetrics.totalStudents}
          status="Active"
          gradientFrom="from-primary-500"
          gradientTo="to-primary-600"
          borderColor="border-primary-400"
        />

        {/* CARD 2: Facilitator Management - Next Action */}
        <ActionCard
          title="Facilitator Team"
          description={`${schoolMetrics.totalFacilitators} active instructors`}
          icon={UserCheck}
          primaryAction={{
            label: "Manage Team",
            onClick: () => router.push("/dashboard/admin/facilitators"),
          }}
        />

        {/* CARD 3: Performance Overview - Progress Insight */}
        <InsightCard
          title="School Performance"
          icon={TrendingUp}
          stats={[
            { label: "Students", value: schoolMetrics.totalStudents },
            { label: "Completion", value: `${schoolMetrics.completionRate}%` },
            { label: "Avg Progress", value: `${schoolMetrics.averageProgress}%` },
          ]}
        >
          <p className="text-xs text-gray-400">
            {schoolMetrics.completionRate > 70 ? "Strong performance" : "Needs improvement"}
          </p>
        </InsightCard>
      </div>

      {/* CARD 4: Attendance & Engagement */}
      <ActionCard
        title="Attendance & Engagement"
        description="Track overall engagement patterns and attendance rates"
        icon={BarChart3}
        primaryAction={{
          label: "View Reports",
          onClick: () => router.push("/dashboard/admin/reports"),
        }}
        secondaryAction={{
          label: "Send Alert",
          onClick: () => router.push("/dashboard/admin/alerts"),
        }}
        variant="secondary"
      />

      {/* CARD 5: Alerts & Notifications */}
      <ActionCard
        title="School Alerts"
        description="System notifications and important updates"
        icon={AlertCircle}
        primaryAction={{
          label: "View All Alerts",
          onClick: () => router.push("/dashboard/admin/alerts"),
        }}
        variant="warning"
      />

      {/* Quick Actions Section */}
      <div className="space-y-6 pt-6 border-t border-dark-600">
        <h2 className="text-2xl font-bold text-white">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="primary" size="lg" className="w-full justify-center gap-2">
            <Plus className="w-5 h-5" />
            Add Course
          </Button>
          <Button variant="secondary" size="lg" className="w-full justify-center gap-2">
            <Users className="w-5 h-5" />
            Manage Users
          </Button>
          <Button variant="outline" size="lg" className="w-full justify-center gap-2">
            <Settings className="w-5 h-5" />
            Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
