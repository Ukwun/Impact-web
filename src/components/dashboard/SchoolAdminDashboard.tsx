"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useUserProgress } from "@/hooks/useLMS";
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
  const [isVisible, setIsVisible] = useState(false);
  const { progress } = useUserProgress();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const schoolMetrics = {
    totalStudents: 1250,
    totalFacilitators: 45,
    completionRate: 72,
    averageScore: 81,
    courseEnrollment: 3421,
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
            onClick: () => console.log("Manage facilitators"),
          }}
        />

        {/* CARD 3: Performance Overview - Progress Insight */}
        <InsightCard
          title="School Performance"
          icon={TrendingUp}
          stats={[
            { label: "Students", value: schoolMetrics.totalStudents },
            { label: "Completion", value: `${schoolMetrics.completionRate}%` },
            { label: "Avg Score", value: `${schoolMetrics.averageScore}%` },
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
          onClick: () => console.log("View attendance reports"),
        }}
        secondaryAction={{
          label: "Send Alert",
          onClick: () => console.log("Send engagement alert"),
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
          onClick: () => console.log("View all alerts"),
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
