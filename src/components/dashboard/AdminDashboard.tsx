"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Users,
  BarChart3,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Award,
  FileText,
  ArrowRight,
  Download,
} from "lucide-react";

export default function AdminDashboard() {
  const analyticsData = [
    { label: "Total Users", value: "28.5k", change: "+12%", icon: Users, color: "primary" },
    { label: "Active Courses", value: "156", change: "+8%", icon: FileText, color: "secondary" },
    { label: "Completion Rate", value: "68%", change: "+5%", icon: CheckCircle, color: "green" },
    { label: "Avg. Score", value: "78.5", change: "+3%", icon: Award, color: "blue" },
  ];

  const schoolStats = [
    { name: "Lagos State College", students: 3420, courses: 45, completion: 72 },
    { name: "Abuja University", students: 2580, courses: 38, completion: 68 },
    { name: "Kano Institute", students: 1940, courses: 32, completion: 65 },
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="space-y-4 animate-fade-in" style={{ animationDelay: "0ms" }}>
        <div className="text-4xl font-black text-text-500">
          Admin Dashboard 📊
        </div>
        <p className="text-gray-300 font-medium">Manage the entire ImpactApp platform</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {analyticsData.map((metric, idx) => {
          const Icon = metric.icon;
          const colorClass =
            metric.color === "primary"
              ? "text-primary-600 bg-primary-50"
              : metric.color === "secondary"
                ? "text-secondary-600 bg-secondary-50"
                : metric.color === "green"
                  ? "text-green-600 bg-green-50"
                  : "text-blue-600 bg-blue-50";

          return (
            <div key={metric.label} className="animate-fade-in" style={{ animationDelay: `${100 + idx * 100}ms` }}>
              <Card className="p-6 hover:shadow-lg transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 ${colorClass} rounded-xl flex items-center justify-center`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold px-2.5 py-1 bg-green-100 text-green-700 rounded-full">
                  {metric.change}
                </span>
              </div>
              <h4 className="text-gray-300 text-sm font-semibold mb-1">
                {metric.label}
              </h4>
              <p className="text-3xl font-black text-text-500">{metric.value}</p>
            </Card>
            </div>
          );
        })}
      </div>

      {/* Top Schools/Institutions */}
      <div className="animate-fade-in" style={{ animationDelay: "500ms" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-text-500">
            Top Performing Institutions
          </h2>
          <Button variant="light" size="sm" className="gap-2">
            View All <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
        <div className="space-y-4">
          {schoolStats.map((school, idx) => (
            <div key={idx} className="animate-fade-in" style={{ animationDelay: `${550 + idx * 100}ms` }}>
              <Card className="p-6 hover:shadow-lg transition-all">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                <div>
                  <h4 className="font-bold text-text-500 mb-1">{school.name}</h4>
                  <p className="text-xs text-gray-300 font-semibold">Education Institution</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-300 font-semibold">Students</p>
                  <p className="text-2xl font-black text-primary-600">
                    {school.students.toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-300 font-semibold">Courses</p>
                  <p className="text-2xl font-black text-secondary-600">{school.courses}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-300 font-semibold">Completion</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-dark-600 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-500 to-secondary-500"
                        style={{ width: `${school.completion}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-text-500">{school.completion}%</span>
                  </div>
                </div>
              </div>
            </Card>
            </div>
          ))}
        </div>
      </div>

      {/* System Alerts & Actions */}
      <div className="grid md:grid-cols-2 gap-6 animate-fade-in" style={{ animationDelay: "750ms" }}>
        {/* Alerts */}
        <div>
          <h2 className="text-2xl font-bold text-text-500 mb-4">System Alerts</h2>
          <div className="space-y-3">
            <Card className="p-4 bg-dark-700/50 border-2 border-blue-500/50">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-blue-900">Maintenance Notice</h4>
                  <p className="text-xs text-blue-800">Scheduled database maintenance on March 12</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-yellow-50 border-2 border-yellow-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-yellow-900">Low Course Enrollment</h4>
                  <p className="text-xs text-yellow-800">3 courses have enrollment below 50 students</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-bold text-text-500 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Button variant="primary" className="w-full justify-start gap-2">
              <Users className="w-4 h-4" />
              Add New School
            </Button>
            <Button variant="primary" className="w-full justify-start gap-2">
              <FileText className="w-4 h-4" />
              Generate Report
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2">
              <Download className="w-4 h-4" />
              Export Data
            </Button>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-2xl font-bold text-text-500 mb-4">Recent User Activity</h2>
        <Card className="p-6">
          <div className="space-y-4">
            {[
              { action: "New user registered", detail: "Sarah Okonkwo joined from Lagos", time: "2 hours ago" },
              { action: "Course completed", detail: "Chukwu finished Financial Literacy", time: "4 hours ago" },
              { action: "Event signup", detail: "28 new registrations for Entrepreneurship Summit", time: "5 hours ago" },
            ].map((activity, idx) => (
              <div key={idx} className="flex items-start justify-between pb-4 border-b border-gray-200 last:border-0">
                <div>
                  <p className="font-semibold text-text-500">{activity.action}</p>
                  <p className="text-sm text-gray-300">{activity.detail}</p>
                </div>
                <span className="text-xs font-bold text-gray-500 whitespace-nowrap ml-4">
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
