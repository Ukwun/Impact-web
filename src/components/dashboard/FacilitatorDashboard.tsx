"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Users,
  BookOpen,
  TrendingUp,
  AlertCircle,
  Activity,
  MessageSquare,
  CheckCircle,
  Clock,
  Loader,
  Plus,
} from "lucide-react";
import { useUserProgress } from "@/hooks/useLMS";
import {
  KPICard,
  ActionCard,
  InsightCard,
} from "@/components/dashboard/cards";

export default function FacilitatorDashboard() {
  const [isVisible, setIsVisible] = useState(false);
  const { progress, loading, error } = useUserProgress();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const enrollments = progress?.enrollments || [];
  const totalStudents = enrollments.length;
  const activeClasses = enrollments.filter((e) => !e.isCompleted).length;
  const avgEngagement = enrollments.length > 0
    ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length)
    : 0;
  const assignmentsPending = enrollments.reduce(
    (sum, e) => sum + e.assignmentsSubmitted,
    0
  );

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
    return (
      <Card className="p-6 border-l-4 border-red-500 bg-dark-700/50">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-red-900">Error Loading Dashboard</h3>
            <p className="text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </Card>
    );
  }

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
            Facilitator Dashboard 👨‍🏫
          </h1>
          <p className="text-base sm:text-lg text-gray-300">
            Manage classes, review assignments, and track student success
          </p>
        </div>
      </div>

      {/* TOP ROW: Status, Next Action, Progress (3 cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CARD 1: Today's Classes - Status */}
        <KPICard
          icon={BookOpen}
          label="Active Classes"
          value={activeClasses}
          status="In Session"
          gradientFrom="from-primary-500"
          gradientTo="to-primary-600"
          borderColor="border-primary-400"
        />

        {/* CARD 2: Assignments to Review - Next Action */}
        <ActionCard
          title="Assignments to Review"
          description={`${assignmentsPending} awaiting your feedback`}
          icon={CheckCircle}
          primaryAction={{
            label: "Review Now",
            onClick: () => (window.location.href = "/dashboard/grading"),
          }}
        />

        {/* CARD 3: Engagement Overview - Progress Insight */}
        <InsightCard
          title="Class Engagement"
          icon={TrendingUp}
          stats={[
            { label: "Students", value: totalStudents },
            { label: "Avg Progress", value: `${avgEngagement}%` },
            { label: "Active", value: activeClasses },
          ]}
        >
          <p className="text-xs text-gray-400">
            {avgEngagement > 75 ? "Excellent engagement" : avgEngagement > 50 ? "Good progress" : "Needs attention"}
          </p>
        </InsightCard>
      </div>

      {/* CARD 4: Student Alerts & Needs */}
      <ActionCard
        title="Student Alerts"
        description={`${totalStudents - activeClasses} students may need support`}
        icon={AlertCircle}
        primaryAction={{
          label: "View Details",
          onClick: () => console.log("View student alerts"),
        }}
        secondaryAction={{
          label: "Send Message",
          onClick: () => (window.location.href = "/dashboard/messages"),
        }}
        variant="warning"
      />

      {/* CARD 5: Messages & Communication */}
      <ActionCard
        title="Class Messages"
        description="Stay connected with your students and facilitators"
        icon={MessageSquare}
        primaryAction={{
          label: "Go to Messages",
          onClick: () => (window.location.href = "/dashboard/messages"),
        }}
        variant="primary"
      />

      {/* Quick Actions Section */}
      <div className="space-y-6 pt-6 border-t border-dark-600">
        <h2 className="text-2xl font-bold text-white">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="primary" size="lg" className="w-full justify-center gap-2">
            <Plus className="w-5 h-5" />
            Create Class
          </Button>
          <Button variant="secondary" size="lg" className="w-full justify-center gap-2">
            <Activity className="w-5 h-5" />
            View Analytics
          </Button>
          <Button variant="outline" size="lg" className="w-full justify-center gap-2">
            <BookOpen className="w-5 h-5" />
            Manage Content
          </Button>
        </div>
      </div>
    </div>
  );
}
