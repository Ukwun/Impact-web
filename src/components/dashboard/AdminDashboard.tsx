"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAdminDashboard } from "@/hooks/useLMS";
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
  Crown,
  Lock,
  Unlock,
  Loader,
  Plus,
} from "lucide-react";
import { getAllTiers } from "@/lib/membershipTierMapping";

export default function AdminDashboard() {
  const [isVisible, setIsVisible] = useState(false);
  const { progress, loading, error } = useAdminDashboard();

  // Animation trigger
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Use fetched data or provide defaults
  const analyticsData = progress?.analytics || [
    { label: "Total Users", value: "0", change: "+0%", icon: "Users", color: "primary" },
    { label: "Active Courses", value: "0", change: "+0%", icon: "FileText", color: "secondary" },
    { label: "Completion Rate", value: "0%", change: "+0%", icon: "CheckCircle", color: "green" },
    { label: "Avg. Score", value: "0", change: "+0%", icon: "Award", color: "blue" },
  ];

  const schoolStats = progress?.institutions || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Card className="p-12 flex flex-col items-center gap-4 animate-fade-in">
          <Loader className="w-10 h-10 animate-spin text-primary-500" />
          <p className="text-gray-300 text-lg">Loading admin dashboard...</p>
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
            <h3 className="font-bold text-danger-700 text-lg">Error Loading Admin Dashboard</h3>
            <p className="text-danger-600 mt-2">{error}</p>
          </div>
        </div>
      </Card>
    );
  }

  const iconMap: { [key: string]: any } = {
    Users,
    FileText,
    CheckCircle,
    Award,
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div
        className={`space-y-4 transition-all duration-700 transform ${
          isVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10"
        }`}
      >
        <div className="text-4xl font-black text-text-500">
          Admin Dashboard 📊
        </div>
        <p className="text-gray-300 font-medium">Manage the entire ImpactApp platform</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {analyticsData.map((metric, idx) => {
          const Icon = iconMap[metric.icon] || Users;
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
            {progress?.alerts.map((alert) => (
              <Card
                key={alert.id}
                className={`p-4 border-2 ${
                  alert.severity === "info"
                    ? "bg-blue-50 border-blue-500/50"
                    : alert.severity === "warning"
                      ? "bg-yellow-50 border-yellow-500/50"
                      : "bg-red-50 border-red-500/50"
                }`}
              >
                <div className="flex items-start gap-3">
                  {alert.severity === "info" && (
                    <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  )}
                  {alert.severity === "warning" && (
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  )}
                  {alert.severity === "error" && (
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h4 className={`font-bold ${
                      alert.severity === "info"
                        ? "text-blue-900"
                        : alert.severity === "warning"
                          ? "text-yellow-900"
                          : "text-red-900"
                    }`}>
                      {alert.title}
                    </h4>
                    <p className={`text-xs ${
                      alert.severity === "info"
                        ? "text-blue-800"
                        : alert.severity === "warning"
                          ? "text-yellow-800"
                          : "text-red-800"
                    }`}>
                      {alert.message}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Admin Actions */}
        <div>
          <h2 className="text-2xl font-bold text-text-500 mb-4">Recent Actions</h2>
          <div className="space-y-3">
            {progress?.actions.map((action) => (
              <Card key={action.id} className="p-4 bg-dark-700/50 border-2 border-dark-600">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-text-500">{action.action}</h4>
                    <p className="text-xs text-gray-300 mt-1">{action.target}</p>
                    <p className="text-xs text-gray-400 mt-2">{action.timestamp}</p>
                  </div>
                  <span className="text-xs font-bold text-primary-600 px-2 py-1 bg-primary-50 rounded">
                    {action.user}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Membership Tiers Management */}
      <div className="animate-fade-in" style={{ animationDelay: "900ms" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-text-500">
            Membership Tiers
          </h2>
          <Button variant="primary" size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Add Tier
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {getAllTiers().map((tier, idx) => (
            <div key={tier.id} className="animate-fade-in" style={{ animationDelay: `${950 + idx * 100}ms` }}>
              <Card className="p-6 relative overflow-hidden hover:shadow-xl transition-all">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 opacity-10 rounded-full -mr-10 -mt-10"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-text-500">{tier.name}</h3>
                    {tier.id === "premium" && <Crown className="w-5 h-5 text-yellow-500" />}
                  </div>
                  <p className="text-sm text-gray-300 mb-4">{tier.description}</p>
                  <div className="space-y-2 mb-4">
                    <p className="text-xs text-gray-400">
                      <span className="font-semibold text-text-500">Tier Type: </span>{tier.tierType}
                    </p>
                    <p className="text-xs text-gray-400">
                      <span className="font-semibold text-text-500">Members: </span>~{Math.floor(Math.random() * 500 + 100)}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    Manage
                  </Button>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

