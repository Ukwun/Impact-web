"use client";

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
  Download,
  Plus,
  BarChart3,
  Clock,
  CheckCircle,
  UserCheck,
} from "lucide-react";

export default function SchoolAdminDashboard() {
  const { progress } = useUserProgress();
  const enrollments = progress?.enrollments || [];
  const schoolMetrics = {
    totalStudents: 1250,
    totalFacilitators: 45,
    courseEnrollment: 3421,
    completionRate: 72,
    averageScore: 81,
    activeEvents: 8,
  };

  const facilitators = [
    {
      id: "fac_1",
      name: "Mrs. Adeola Okafor",
      department: "Financial Literacy",
      students: 145,
      rating: 4.8,
      courseCount: 3,
    },
    {
      id: "fac_2",
      name: "Mr. Emeka Nwosu",
      department: "Technology",
      students: 98,
      rating: 4.6,
      courseCount: 2,
    },
    {
      id: "fac_3",
      name: "Dr. Chioma Adeyemi",
      department: "Leadership",
      students: 167,
      rating: 4.9,
      courseCount: 4,
    },
  ];

  const departmentStats = [
    { name: "Financial Literacy", courses: 8, students: 312, completion: 78 },
    { name: "Technology", courses: 5, students: 198, completion: 65 },
    { name: "Leadership", courses: 6, students: 245, completion: 82 },
    { name: "Entrepreneurship", courses: 4, students: 187, completion: 71 },
  ];

  const schoolAlerts = [
    {
      id: 1,
      type: "warning",
      title: "Low Enrollment Alert",
      message: "Digital Skills course has only 8/50 capacity filled",
    },
    {
      id: 2,
      type: "success",
      title: "Achievement Milestone",
      message: "500th student completed a course this month!",
    },
    {
      id: 3,
      type: "info",
      title: "System Update",
      message: "New features available: Advanced Analytics Dashboard",
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-start justify-between animate-fade-in" style={{ animationDelay: "0ms" }}>
        <div>
          <h1 className="text-5xl font-black text-white mb-2">
            School Admin Dashboard 🏫
          </h1>
          <p className="text-lg text-gray-300">Manage your school's learning ecosystem</p>
        </div>
        <Button variant="primary" size="lg" className="gap-2">
          <Plus className="w-5 h-5" />
          Add Course
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Students Card */}
        <div className="group relative overflow-hidden rounded-xl p-6 bg-gradient-to-br from-primary-500 to-primary-600 text-white hover:shadow-xl transition-all duration-300 border border-primary-400 border-opacity-50 animate-fade-in" style={{ animationDelay: "100ms" }}>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <Users className="w-6 h-6 opacity-90" />
              <span className="text-xs font-bold opacity-80 uppercase tracking-wider">Total</span>
            </div>
            <p className="text-sm opacity-90 mb-2 font-medium">Students</p>
            <p className="text-4xl font-black">{schoolMetrics.totalStudents.toLocaleString()}</p>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-5 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-300"></div>
        </div>

        {/* Facilitators Card */}
        <div className="group relative overflow-hidden rounded-xl p-6 bg-gradient-to-br from-secondary-500 to-secondary-600 text-white hover:shadow-xl transition-all duration-300 border border-secondary-400 border-opacity-50 animate-fade-in" style={{ animationDelay: "200ms" }}>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <UserCheck className="w-6 h-6 opacity-90" />
              <span className="text-xs font-bold opacity-80 uppercase tracking-wider">Active</span>
            </div>
            <p className="text-sm opacity-90 mb-2 font-medium">Facilitators</p>
            <p className="text-4xl font-black">{schoolMetrics.totalFacilitators}</p>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-5 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-300"></div>
        </div>

        {/* Enrollments Card */}
        <div className="group relative overflow-hidden rounded-xl p-6 bg-gradient-to-br from-green-500 to-green-600 text-white hover:shadow-xl transition-all duration-300 border border-green-400 border-opacity-50 animate-fade-in" style={{ animationDelay: "300ms" }}>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <BookOpen className="w-6 h-6 opacity-90" />
              <span className="text-xs font-bold opacity-80 uppercase tracking-wider">Total</span>
            </div>
            <p className="text-sm opacity-90 mb-2 font-medium">Enrollments</p>
            <p className="text-4xl font-black">{schoolMetrics.courseEnrollment.toLocaleString()}</p>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-5 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-300"></div>
        </div>

        {/* Completion Rate Card */}
        <div className="group relative overflow-hidden rounded-xl p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-xl transition-all duration-300 border border-blue-400 border-opacity-50 animate-fade-in" style={{ animationDelay: "400ms" }}>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <TrendingUp className="w-6 h-6 opacity-90" />
              <span className="text-xs font-bold opacity-80 uppercase tracking-wider">Overall</span>
            </div>
            <p className="text-sm opacity-90 mb-2 font-medium">Completion Rate</p>
            <p className="text-4xl font-black">{schoolMetrics.completionRate}%</p>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-5 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-300"></div>
        </div>

        {/* Average Score Card */}
        <div className="group relative overflow-hidden rounded-xl p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:shadow-xl transition-all duration-300 border border-purple-400 border-opacity-50 animate-fade-in" style={{ animationDelay: "500ms" }}>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <CheckCircle className="w-6 h-6 opacity-90" />
              <span className="text-xs font-bold opacity-80 uppercase tracking-wider">Average</span>
            </div>
            <p className="text-sm opacity-90 mb-2 font-medium">Student Score</p>
            <p className="text-4xl font-black">{schoolMetrics.averageScore}%</p>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-5 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-300"></div>
        </div>

        {/* Active Events Card */}
        <div className="group relative overflow-hidden rounded-xl p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white hover:shadow-xl transition-all duration-300 border border-orange-400 border-opacity-50 animate-fade-in" style={{ animationDelay: "600ms" }}>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <Clock className="w-6 h-6 opacity-90" />
              <span className="text-xs font-bold opacity-80 uppercase tracking-wider">Active</span>
            </div>
            <p className="text-sm opacity-90 mb-2 font-medium">Events Running</p>
            <p className="text-4xl font-black">{schoolMetrics.activeEvents}</p>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-5 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-300"></div>
        </div>
      </div>

      {/* Department Performance and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in" style={{ animationDelay: "700ms" }}>
        {/* Department Performance */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-3xl font-black text-text-500 mb-1">Department Performance</h2>
            <p className="text-gray-300">Course completion and engagement by department</p>
          </div>

          <div className="space-y-4">
            {departmentStats.map((dept, idx) => (
              <div key={dept.name} className="rounded-xl bg-dark-700/50 border-l-4 border-l-primary-500 hover:border-l-secondary-500 p-6 hover:shadow-lg transition-all duration-300 animate-fade-in" style={{ animationDelay: `${750 + idx * 100}ms` }}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-text-500">{dept.name}</h3>
                    <p className="text-sm text-gray-300">{dept.courses} courses • {dept.students} students</p>
                  </div>
                  <span className="text-2xl font-black text-primary-600">{dept.completion}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-3 bg-dark-600 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${dept.completion}%` }}
                      className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all duration-500"
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Critical Alerts */}
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-black text-text-500 mb-1">System Alerts</h2>
            <p className="text-gray-300">Important notifications</p>
          </div>

          <div className="space-y-3">
            {schoolAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`rounded-xl border-l-4 p-4 ${
                  alert.type === "warning"
                    ? "bg-yellow-50 border-l-yellow-500"
                    : alert.type === "success"
                      ? "bg-green-50 border-l-green-500"
                      : "bg-blue-50 border-l-blue-500"
                }`}
              >
                <p className="font-bold text-sm text-text-500">{alert.title}</p>
                <p className="text-xs text-gray-300 mt-2">{alert.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Facilitators Table */}
      <div className="rounded-2xl bg-dark-700/50 border-2 border-dark-600 hover:border-primary-300 hover:shadow-xl transition-all duration-300 overflow-hidden">
        <div className="p-8 border-b-2 border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-text-500 mb-1">Top Facilitators</h2>
            <p className="text-gray-300">Leading educators by student impact and ratings</p>
          </div>
          <Button variant="outline" size="sm">View All</Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-100 bg-gray-50">
                <th className="text-left py-4 px-8 font-bold text-text-500">Name</th>
                <th className="text-left py-4 px-8 font-bold text-text-500">Department</th>
                <th className="text-right py-4 px-8 font-bold text-text-500">Students</th>
                <th className="text-right py-4 px-8 font-bold text-text-500">Courses</th>
                <th className="text-right py-4 px-8 font-bold text-text-500">Rating</th>
              </tr>
            </thead>
            <tbody>
              {facilitators.map((fac) => (
                <tr key={fac.id} className="border-b border-dark-600 hover:bg-dark-700/50 transition-colors">
                  <td className="py-4 px-8 font-semibold text-text-500">{fac.name}</td>
                  <td className="py-4 px-8 text-gray-300">{fac.department}</td>
                  <td className="py-4 px-8 text-right text-gray-300">{fac.students}</td>
                  <td className="py-4 px-8 text-right text-gray-300">{fac.courseCount}</td>
                  <td className="py-4 px-8 text-right">
                    <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-bold text-sm">
                      ⭐ {fac.rating}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Button variant="primary" size="lg" className="h-20 flex-col justify-center gap-3">
          <Download className="w-6 h-6" />
          <span className="font-bold text-base">Export Report</span>
        </Button>
        <Button variant="secondary" size="lg" className="h-20 flex-col justify-center gap-3">
          <BarChart3 className="w-6 h-6" />
          <span className="font-bold text-base">View Analytics</span>
        </Button>
        <Button variant="outline" size="lg" className="h-20 flex-col justify-center gap-3">
          <Settings className="w-6 h-6" />
          <span className="font-bold text-base">School Settings</span>
        </Button>
        <Button variant="outline" size="lg" className="h-20 flex-col justify-center gap-3">
          <UserCheck className="w-6 h-6" />
          <span className="font-bold text-base">Manage Users</span>
        </Button>
      </div>
    </div>
  );
}
