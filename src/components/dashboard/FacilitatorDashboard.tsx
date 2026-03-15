"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Users,
  BookOpen,
  TrendingUp,
  BarChart3,
  Activity,
  MessageSquare,
  CheckCircle,
  Clock,
  Award,
  Plus,
  Loader,
  AlertCircle,
} from "lucide-react";
import { useUserProgress } from "@/hooks/useLMS";

export default function FacilitatorDashboard() {
  const { progress, loading, error } = useUserProgress();

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

  const facilitatorStats = {
    totalStudents,
    activeClasses,
    avgEngagement,
    assignmentsPending,
  };

  const classes = enrollments.map((e) => ({
    id: e.id,
    name: e.course.title,
    students: 1,
    progress: e.progress,
    nextLesson: e.course.description,
    nextDate: e.completedAt
      ? new Date(e.completedAt).toLocaleDateString()
      : "Ongoing",
  }));

  const recentActivities = enrollments
    .flatMap((e) =>
      e.assignmentSubmissions.slice(0, 3).map((sub) => ({
        id: sub.id,
        student: e.course.title,
        action: "Submitted Assignment",
        course: e.course.title,
        time: new Date(sub.submittedAt).toLocaleDateString(),
      }))
    )
    .slice(0, 3);

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
      <div className="space-y-6 animate-fade-in" style={{ animationDelay: "0ms" }}>
        <h1 className="text-5xl font-black text-text-500 mb-2">
          Facilitator Dashboard 👨‍🏫
        </h1>
        <p className="text-lg text-gray-300">Manage your classes and track student success</p>
      </div>

      {/* Key Stats - Redesigned */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Students Card */}
        <div className="group relative overflow-hidden rounded-xl p-6 bg-gradient-to-br from-primary-500 to-primary-600 text-white hover:shadow-xl transition-all duration-300 border border-primary-400 border-opacity-50 animate-fade-in" style={{ animationDelay: "100ms" }}>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <Users className="w-6 h-6 opacity-90" />
              <span className="text-xs font-bold opacity-80 uppercase tracking-wider">Total</span>
            </div>
            <p className="text-sm opacity-90 mb-2 font-medium">Students</p>
            <p className="text-3xl font-black">{facilitatorStats.totalStudents}</p>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-5 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-300"></div>
        </div>

        {/* Active Classes Card */}
        <div className="group relative overflow-hidden rounded-xl p-6 bg-gradient-to-br from-secondary-500 to-secondary-600 text-white hover:shadow-xl transition-all duration-300 border border-secondary-400 border-opacity-50 animate-fade-in" style={{ animationDelay: "200ms" }}>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <BookOpen className="w-6 h-6 opacity-90" />
              <span className="text-xs font-bold opacity-80 uppercase tracking-wider">Active</span>
            </div>
            <p className="text-sm opacity-90 mb-2 font-medium">Classes</p>
            <p className="text-3xl font-black">{facilitatorStats.activeClasses}</p>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-5 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-300"></div>
        </div>

        {/* Engagement Card */}
        <div className="group relative overflow-hidden rounded-xl p-6 bg-gradient-to-br from-green-500 to-green-600 text-white hover:shadow-xl transition-all duration-300 border border-green-400 border-opacity-50 animate-fade-in" style={{ animationDelay: "300ms" }}>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <TrendingUp className="w-6 h-6 opacity-90" />
              <span className="text-xs font-bold opacity-80 uppercase tracking-wider">Avg</span>
            </div>
            <p className="text-sm opacity-90 mb-2 font-medium">Engagement</p>
            <p className="text-3xl font-black">{facilitatorStats.avgEngagement}%</p>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-5 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-300"></div>
        </div>

        {/* Pending Card */}
        <div className="group relative overflow-hidden rounded-xl p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-xl transition-all duration-300 border border-blue-400 border-opacity-50 animate-fade-in" style={{ animationDelay: "400ms" }}>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <Clock className="w-6 h-6 opacity-90" />
              <span className="text-xs font-bold opacity-80 uppercase tracking-wider">Pending</span>
            </div>
            <p className="text-sm opacity-90 mb-2 font-medium">To Grade</p>
            <p className="text-3xl font-black">{facilitatorStats.assignmentsPending}</p>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-5 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-300"></div>
        </div>
      </div>

      {/* Classes Section */}
      {classes.length > 0 && (
        <div className="space-y-6 animate-fade-in" style={{ animationDelay: "550ms" }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-black text-text-500 mb-1">Your Classes</h2>
              <p className="text-gray-300">Manage and monitor all your active classes</p>
            </div>
            <Button variant="primary" size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              New Class
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {classes.map((cls, idx) => (
              <div
                key={cls.id}
                className="group relative overflow-hidden rounded-2xl bg-dark-700/50 border-2 border-dark-600 hover:border-primary-300 hover:shadow-xl transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${600 + idx * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-primary-600 opacity-0 group-hover:opacity-5 transition-opacity"></div>

                <div className="relative p-8 space-y-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-2xl font-black text-text-500 mb-2 group-hover:text-primary-600 transition-colors">
                        {cls.name}
                      </h3>
                      <p className="text-gray-300 text-sm">{cls.students} students enrolled</p>
                    </div>
                    <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <span className="text-white font-black text-xl">{cls.progress}%</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Progress</span>
                      <span className="text-sm font-bold text-primary-600">{cls.progress}%</span>
                    </div>
                    <div className="w-full h-3 bg-dark-600 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all duration-500"
                        style={{ width: `${cls.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 space-y-3">
                    <div>
                      <p className="text-xs text-gray-300 font-semibold mb-1">NEXT LESSON</p>
                      <p className="text-sm font-bold text-text-500">{cls.nextLesson}</p>
                    </div>
                    <p className="text-xs text-gray-500">Due: {cls.nextDate}</p>
                  </div>

                  <Button variant="primary" size="md" className="w-full">
                    Manage Class
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in" style={{ animationDelay: "800ms" }}>
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-3xl font-black text-text-500 mb-1">Recent Activity</h2>
            <p className="text-gray-300">Latest updates from your classes</p>
          </div>

          <div className="space-y-3">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, idx) => (
                <div
                  key={activity.id}
                  className="group rounded-xl bg-dark-700/50 border-l-4 border-l-primary-500 hover:border-l-secondary-500 p-4 hover:shadow-lg transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${850 + idx * 100}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-text-500">
                        {activity.student} <span className="text-gray-300 font-normal">{activity.action}</span>
                      </p>
                      <p className="text-sm text-gray-300">{activity.course}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary-100 to-secondary-100 mb-4">
                  <Activity className="w-8 h-8 text-primary-600" />
                </div>
                <p className="text-gray-300 font-medium">No recent activity yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6 animate-fade-in" style={{ animationDelay: "900ms" }}>
          <div>
            <h2 className="text-3xl font-black text-text-500 mb-1">Quick Actions</h2>
            <p className="text-gray-300">Get things done faster</p>
          </div>

          <div className="space-y-3">
            <Button variant="primary" size="lg" className="w-full justify-center gap-2 animate-fade-in" style={{ animationDelay: "950ms" }}>
              <CheckCircle className="w-5 h-5" />
              Grade Assignments
            </Button>
            <Button variant="secondary" size="lg" className="w-full justify-center gap-2 animate-fade-in" style={{ animationDelay: "1050ms" }}>
              <MessageSquare className="w-5 h-5" />
              Message Students
            </Button>
            <Button variant="outline" size="lg" className="w-full justify-center gap-2 animate-fade-in" style={{ animationDelay: "1150ms" }}>
              <BarChart3 className="w-5 h-5" />
              View Analytics
            </Button>
            <Button variant="outline" size="lg" className="w-full justify-center gap-2 animate-fade-in" style={{ animationDelay: "1250ms" }}>
              <Award className="w-5 h-5" />
              Award Certificates
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
