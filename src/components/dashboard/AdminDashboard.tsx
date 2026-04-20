"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from "@/lib/authStorage";
import {
  Globe,
  AlertTriangle,
  Activity,
  Loader,
  AlertCircle,
  Settings,
  Users,
  BarChart3,
  Database,
} from "lucide-react";

interface SystemHealthMetric {
  name: string;
  status: "healthy" | "warning" | "critical";
  value: number;
  unit: string;
}

interface SystemAlert {
  id: string;
  type: "error" | "warning" | "info";
  message: string;
  timestamp: string;
  resolved: boolean;
}

interface AdminDashboardData {
  platformStats: {
    totalUsers: number;
    totalSchools: number;
    activeToday: number;
    systemUptime: number;
  };
  systemHealth: SystemHealthMetric[];
  recentAlerts: SystemAlert[];
  topSchools: Array<{
    name: string;
    users: number;
    courses: number;
  }>;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const { success, error: errorToast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/dashboard", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(AUTH_TOKEN_KEY)}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem(AUTH_TOKEN_KEY);
          localStorage.removeItem(AUTH_USER_KEY);
          router.push("/auth/login?error=invalid_token");
          return;
        }
        throw new Error("Failed to load dashboard");
      }

      const result = await response.json();
      if (result.success) {
        setData(result.data);
        success("Dashboard loaded");
      }
    } catch (err) {
      console.error("Error loading dashboard:", err);
      errorToast("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader className="w-10 h-10 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!data) {
    return (
      <Card className="p-8 border-l-4 border-danger-500 bg-danger-500/10">
        <AlertCircle className="w-6 h-6 text-danger-400 mb-2" />
        <p className="text-danger-400">Failed to load dashboard</p>
        <Button onClick={loadDashboardData} className="mt-4">Try Again</Button>
      </Card>
    );
  }

  const criticalAlerts = data.recentAlerts.filter(a => a.type === 'error' && !a.resolved);

  return (
    <div className="space-y-8 pb-12">
      {/* Header - Global Platform Control */}
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-black text-white mb-2">🌐 Platform Control Center</h1>
          <p className="text-gray-300">System-wide monitoring, alerts, and administration</p>
        </div>

        {/* Platform Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-gray-400 text-xs font-semibold">Total Users</p>
            <p className="text-3xl font-black text-primary-400 mt-2">{data.platformStats.totalUsers}</p>
            <p className="text-xs text-gray-400 mt-1">Across all schools</p>
          </Card>
          <Card className="p-4">
            <p className="text-gray-400 text-xs font-semibold">Active Schools</p>
            <p className="text-3xl font-black text-blue-400 mt-2">{data.platformStats.totalSchools}</p>
            <p className="text-xs text-gray-400 mt-1">Using platform</p>
          </Card>
          <Card className="p-4">
            <p className="text-gray-400 text-xs font-semibold">Active Today</p>
            <p className="text-3xl font-black text-green-400 mt-2">{data.platformStats.activeToday}</p>
            <p className="text-xs text-gray-400 mt-1">Last 24 hours</p>
          </Card>
          <Card className="p-4">
            <p className="text-gray-400 text-xs font-semibold">Uptime</p>
            <p className="text-3xl font-black text-yellow-400 mt-2">{data.platformStats.systemUptime}%</p>
            <p className="text-xs text-gray-400 mt-1">This month</p>
          </Card>
        </div>
      </div>

      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <Card className="p-6 border-l-4 border-red-500 bg-red-500/10">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-red-400 flex items-center gap-2">
                🚨 System Alerts ({criticalAlerts.length})
              </p>
              <div className="space-y-2 mt-3">
                {criticalAlerts.map(alert => (
                  <div key={alert.id} className="bg-dark-700 p-3 rounded">
                    <p className="text-red-300 text-sm font-semibold">{alert.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(alert.timestamp).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* System Health Metrics */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Activity className="w-6 h-6" />
          System Health
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.systemHealth.map((metric, idx) => (
            <Card key={idx} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-white">{metric.name}</h3>
                <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                  metric.status === 'healthy' ? 'bg-green-500/20 text-green-400' :
                  metric.status === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {metric.status === 'healthy' ? '✓' : metric.status === 'warning' ? '⚠' : '✗'}
                </span>
              </div>
              <div>
                <p className="text-3xl font-black text-white">{metric.value}{metric.unit}</p>
              </div>
              <div className="w-full bg-dark-700 rounded-full h-1.5 mt-3">
                <div
                  className={`h-full rounded-full ${
                    metric.status === 'healthy' ? 'bg-green-500' :
                    metric.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(metric.value, 100)}%` }}
                />
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Top Schools Performance */}
      {data.topSchools.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Globe className="w-6 h-6" />
            Top Schools
          </h2>

          <div className="space-y-3">
            {data.topSchools.map((school, idx) => (
              <Card key={idx} className="p-4 hover:border-primary-500 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white">{school.name}</h3>
                    <div className="flex gap-4 mt-2 text-xs text-gray-400">
                      <span>{school.users} users</span>
                      <span>•</span>
                      <span>{school.courses} courses</span>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm">Manage</Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Platform Administration */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="w-6 h-6" />
          Administration
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 hover:border-primary-500 transition-colors cursor-pointer">
            <Users className="w-8 h-8 text-blue-400 mb-3" />
            <h3 className="font-semibold text-white">User Management</h3>
            <p className="text-xs text-gray-400 mt-2">Manage all platform users</p>
          </Card>
          <Card className="p-6 hover:border-primary-500 transition-colors cursor-pointer">
            <BarChart3 className="w-8 h-8 text-green-400 mb-3" />
            <h3 className="font-semibold text-white">Platform Analytics</h3>
            <p className="text-xs text-gray-400 mt-2">Global usage metrics</p>
          </Card>
          <Card className="p-6 hover:border-primary-500 transition-colors cursor-pointer">
            <Database className="w-8 h-8 text-purple-400 mb-3" />
            <h3 className="font-semibold text-white">System Settings</h3>
            <p className="text-xs text-gray-400 mt-2">Configure platform</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
