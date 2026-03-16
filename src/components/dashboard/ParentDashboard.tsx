"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  User,
  TrendingUp,
  Award,
  BookOpen,
  AlertCircle,
  MessageSquare,
  Calendar,
  CheckCircle,
  Clock,
  Target,
  Loader,
  Plus,
} from "lucide-react";

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
  const [children, setChildren] = useState<ChildData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchChildren();
  }, []);

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

  const alerts = children.length > 0
    ? children.map(child => ({
        id: child.id,
        type: child.overallProgress > 80 ? "success" : child.overallProgress > 50 ? "warning" : "info",
        child: child.name,
        message: `Progress: ${child.overallProgress}% - ${child.overallProgress > 80 ? 'Excellent work!' : child.overallProgress > 50 ? 'Keep it up!' : 'Needs attention'}`,
        date: "Today",
      }))
    : [
        {
          id: "no-children",
          type: "info" as const,
          child: "No Children Linked",
          message: "Link your children's accounts to monitor their progress",
          date: "Now",
        },
      ];

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
      <div className="animate-fade-in" style={{ animationDelay: "0ms" }}>
        <h1 className="text-5xl font-black text-text-500 mb-2">
          Parent Dashboard 👨‍👩‍👧‍👦
        </h1>
        <p className="text-lg text-gray-300">Monitor your children's learning progress and celebrate achievements</p>
      </div>

      {/* Children Overview */}
      <div className="space-y-6 animate-fade-in" style={{ animationDelay: "100ms" }}>
        {children.length === 0 ? (
          <Card className="p-8 text-center">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-300 mb-2">No Children Linked</h3>
            <p className="text-gray-400 mb-6">Link your children's accounts to start monitoring their progress</p>
            <Button variant="primary" className="gap-2">
              <Plus className="w-4 h-4" />
              Link Child Account
            </Button>
          </Card>
        ) : (
          children.map((child, idx) => (
            <div key={child.id} className="rounded-2xl bg-dark-700/50 border-2 border-dark-600 hover:border-primary-300 hover:shadow-xl transition-all duration-300 overflow-hidden animate-fade-in" style={{ animationDelay: `${150 + idx * 100}ms` }}>
              <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-black mb-1">{child.name}</h2>
                    <p className="text-primary-100">{child.grade} Level</p>
                  </div>
                  <Button variant="primary" size="sm" className="bg-dark-700/50 text-primary-300 hover:bg-dark-600">
                    View Details
                  </Button>
                </div>
              </div>

              <div className="p-8 space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                    <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">Progress</p>
                    <p className="text-2xl font-black text-blue-600">{child.overallProgress}%</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
                    <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-2">Avg Score</p>
                    <p className="text-2xl font-black text-green-600">{child.averageScore}%</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
                    <p className="text-xs font-bold text-purple-700 uppercase tracking-wider mb-2">Attendance</p>
                    <p className="text-2xl font-black text-purple-600">{child.attendanceRate}%</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200">
                    <p className="text-xs font-bold text-orange-700 uppercase tracking-wider mb-2">Completed</p>
                    <p className="text-2xl font-black text-orange-600">{child.completedCourses}/{child.enrolledCourses}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">Learning Progress</span>
                    <span className="text-sm font-bold text-primary-600">{child.overallProgress}%</span>
                  </div>
                  <div className="w-full h-3 bg-dark-600 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${child.overallProgress}%` }}
                      className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all duration-500"
                    ></div>
                  </div>
                </div>

                {/* Last Activity */}
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-sm">
                    <span className="font-bold text-text-500">Last Activity:</span>
                    <span className="text-gray-300 ml-2">{child.lastActivity}</span>
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Alerts & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Alerts */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-3xl font-black text-text-500 mb-1">Alerts & Updates</h2>
            <p className="text-gray-300">Important updates about your children's learning</p>
          </div>

          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`rounded-xl border-l-4 p-4 ${
                  alert.type === "success"
                    ? "bg-green-50 border-l-green-500"
                    : alert.type === "warning"
                      ? "bg-yellow-50 border-l-yellow-500"
                      : "bg-blue-50 border-l-blue-500"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 flex-1">
                    {alert.type === "success" && (
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    )}
                    {alert.type === "warning" && (
                      <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    )}
                    {alert.type === "info" && (
                      <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-text-500 text-sm">
                      {alert.child}: {alert.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{alert.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-black text-text-500 mb-1">Quick Actions</h2>
            <p className="text-gray-300">Get things done quickly</p>
          </div>

          <div className="space-y-3">
            <Button variant="primary" size="lg" className="w-full justify-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Message Facilitator
            </Button>
            <Button variant="secondary" size="lg" className="w-full justify-center gap-2">
              <Calendar className="w-5 h-5" />
              View Calendar
            </Button>
            <Button variant="outline" size="lg" className="w-full justify-center gap-2">
              <Award className="w-5 h-5" />
              View Certificates
            </Button>
            <Button variant="outline" size="lg" className="w-full justify-center gap-2">
              <BookOpen className="w-5 h-5" />
              Suggest Courses
            </Button>
          </div>
        </div>
      </div>

      {/* Parental Guidance */}
      <div className="rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 text-white p-8 border-2 border-primary-400 border-opacity-50">
        <div className="flex items-start gap-6">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white bg-opacity-20 flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-black mb-3">Parental Tips for Success</h3>
            <p className="text-primary-50 leading-relaxed">
              Regular communication with facilitators and consistent encouragement help students succeed. 
              Check in weekly to celebrate wins and address challenges. Your involvement makes a real difference!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
