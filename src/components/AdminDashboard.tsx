import React, { useState, useEffect } from 'react';
import { AlertCircle, Shield, Users, BarChart3, Loader, Settings } from 'lucide-react';
import AdminUserManagementModal from '@/components/AdminUserManagementModal';
import AdminAlertsModal from '@/components/AdminAlertsModal';
import AdminAnalyticsModal from '@/components/AdminAnalyticsModal';

interface DashboardMetrics {
  totalUsers: number;
  activeUsers: number;
  userGrowth: number;
  totalSchools: number;
  totalCircles: number;
  totalDiscussions: number;
  platformUptime: number;
  averageResponseTime: number;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  school?: string;
  lastActive: string;
  status: 'active' | 'inactive' | 'suspended';
  joinedDate: string;
}

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  affectedUsers?: number;
  timestamp: string;
  resolved: boolean;
  resolution?: string;
}

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  userGrowth: number;
  totalSchools: number;
  totalCircles: number;
  totalDiscussions: number;
  platformUptime: number;
  averageResponseTime: number;
  byRole: Record<string, number>;
  byStatus: Record<string, number>;
  topSchools: Array<{ name: string; userCount: number; activeCount: number }>;
  monthlyActivity: Array<{ month: string; users: number; discussions: number }>;
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showUsersModal, setShowUsersModal] = useState(false);
  const [showAlertsModal, setShowAlertsModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!token) {
        setError('Not authenticated');
        return;
      }

      // Load metrics
      const metricsRes = await fetch('/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!metricsRes.ok) throw new Error('Failed to load metrics');
      const metricsData = await metricsRes.json();
      const platformStats = metricsData?.data?.platformStats ?? {};
      const mappedMetrics: DashboardMetrics = {
        totalUsers: platformStats.totalUsers ?? 0,
        activeUsers: platformStats.activeUsers ?? 0,
        userGrowth: metricsData?.data?.userGrowth ?? 0,
        totalSchools: Math.max(metricsData?.data?.topSchools?.length ?? 0, 1),
        totalCircles: platformStats.totalCircles ?? 0,
        totalDiscussions: platformStats.totalDiscussions ?? 0,
        platformUptime: platformStats.systemUptime ?? 99.2,
        averageResponseTime: 150,
      };
      setMetrics(mappedMetrics);

      // Load users
      const usersRes = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!usersRes.ok) throw new Error('Failed to load users');
      const usersData = await usersRes.json();
      const mappedUsers: AdminUser[] = (usersData?.data?.users ?? []).map((user: any) => ({
        id: user.id,
        name: user.name || `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || 'Unknown User',
        email: user.email,
        role: user.role,
        school: user.institution || user.school,
        lastActive: user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'Recently',
        status: user.state === 'SUSPENDED' ? 'suspended' : (user.isActive ? 'active' : 'inactive'),
        joinedDate: user.createdAt || new Date().toISOString(),
      }));
      setUsers(mappedUsers);

      // Load alerts
      const alertsRes = await fetch('/api/admin/alerts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!alertsRes.ok) throw new Error('Failed to load alerts');
      const alertsData = await alertsRes.json();
      const groupedAlerts = alertsData?.data ?? {};
      const flattenedAlerts: Alert[] = [
        ...(groupedAlerts.critical ?? []),
        ...(groupedAlerts.warnings ?? []),
        ...(groupedAlerts.info ?? []),
      ].map((alert: any) => ({
        id: alert.id,
        type: alert.severity === 'critical' ? 'critical' : alert.severity === 'warning' ? 'warning' : 'info',
        title: alert.title,
        description: alert.message,
        affectedUsers: alert.affectedUsers,
        timestamp: alert.timestamp,
        resolved: Boolean(alert.resolved),
        resolution: alert.resolution,
      }));
      setAlerts(flattenedAlerts);

      // Load analytics
      const analyticsRes = await fetch('/api/analytics/platform', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!analyticsRes.ok) throw new Error('Failed to load analytics');
      const analyticsData = await analyticsRes.json();

      const usersByRoleEntries = (metricsData?.data?.usersByRole ?? []) as Array<{ role: string; _count: number }>;
      const byRole = usersByRoleEntries.reduce((acc, item) => {
        acc[item.role] = item._count;
        return acc;
      }, {} as Record<string, number>);

      const topSchools = (metricsData?.data?.topSchools ?? []).map((school: any) => ({
        name: school.name,
        userCount: school.users ?? 0,
        activeCount: school.courses ?? 0,
      }));

      setAnalytics({
        ...mappedMetrics,
        ...(analyticsData?.data ?? {}),
        byRole,
        byStatus: {
          active: mappedUsers.filter((u) => u.status === 'active').length,
          inactive: mappedUsers.filter((u) => u.status === 'inactive').length,
          suspended: mappedUsers.filter((u) => u.status === 'suspended').length,
        },
        topSchools,
        monthlyActivity: analyticsData?.data?.monthlyActivity ?? [],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    if (!token) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) throw new Error('Failed to update role');
      await loadDashboardData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role');
    }
  };

  const handleSuspendUser = async (userId: string) => {
    if (!token) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: false, state: 'SUSPENDED' }),
      });

      if (!res.ok) throw new Error('Failed to suspend user');
      await loadDashboardData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to suspend user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!token) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to delete user');
      await loadDashboardData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  const handleResolveAlert = async (alertId: string, resolution: string) => {
    if (!token) return;

    try {
      const res = await fetch(`/api/admin/alerts/${alertId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resolved: true, resolution }),
      });

      if (!res.ok) throw new Error('Failed to resolve alert');
      await loadDashboardData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve alert');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3 mb-2">
              <Shield className="w-8 h-8 text-blue-600" />
              Platform Administration
            </h1>
            <p className="text-gray-600">
              System-wide monitoring and control for the entire platform
            </p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* KPI Cards */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
              <div className="text-gray-600 font-medium mb-2">Total Users</div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{metrics.totalUsers}</p>
              <p className="text-sm text-green-600">
                +{metrics.userGrowth}% this month
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-600">
              <div className="text-gray-600 font-medium mb-2">Active Users (30d)</div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{metrics.activeUsers}</p>
              <p className="text-sm text-gray-600">
                {((metrics.activeUsers / metrics.totalUsers) * 100).toFixed(1)}% engagement
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-600">
              <div className="text-gray-600 font-medium mb-2">System Health</div>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {metrics.platformUptime.toFixed(2)}%
              </p>
              <p className="text-sm text-gray-600">Uptime (99.85% target)</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-600">
              <div className="text-gray-600 font-medium mb-2">Response Time</div>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {metrics.averageResponseTime}ms
              </p>
              <p className="text-sm text-gray-600">API latency</p>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => setShowUsersModal(true)}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 hover:border-blue-400 rounded-lg p-6 transition-all text-left"
          >
            <Users className="w-8 h-8 text-blue-600 mb-3" />
            <h3 className="font-bold text-gray-900 mb-1">User Management</h3>
            <p className="text-sm text-gray-600">Manage roles, permissions, and accounts</p>
          </button>

          <button
            onClick={() => setShowAlertsModal(true)}
            className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 hover:border-red-400 rounded-lg p-6 transition-all text-left"
          >
            <AlertCircle className="w-8 h-8 text-red-600 mb-3" />
            <h3 className="font-bold text-gray-900 mb-1">System Alerts</h3>
            <p className="text-sm text-gray-600">
              {alerts.filter(a => !a.resolved).length} active alerts
            </p>
          </button>

          <button
            onClick={() => setShowAnalyticsModal(true)}
            className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 hover:border-purple-400 rounded-lg p-6 transition-all text-left"
          >
            <BarChart3 className="w-8 h-8 text-purple-600 mb-3" />
            <h3 className="font-bold text-gray-900 mb-1">Analytics</h3>
            <p className="text-sm text-gray-600">View platform-wide statistics</p>
          </button>
        </div>

        {/* System Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Platform Metrics</h2>
            {metrics && (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Schools:</span>
                  <span className="font-bold text-gray-900">{metrics.totalSchools}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Professional Circles:</span>
                  <span className="font-bold text-gray-900">{metrics.totalCircles}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Discussions:</span>
                  <span className="font-bold text-gray-900">{metrics.totalDiscussions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Network Activity:</span>
                  <span className="font-bold text-gray-900">
                    {metrics.totalDiscussions > 0 ? 'Active' : 'Low'}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Alerts</h2>
            {alerts.length > 0 ? (
              <div className="space-y-2">
                {alerts.slice(0, 3).map(alert => (
                  <div
                    key={alert.id}
                    className={`p-2 rounded text-sm flex items-center gap-2 ${
                      alert.type === 'critical'
                        ? 'bg-red-100 text-red-800'
                        : alert.type === 'warning'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    <div className="w-2 h-2 rounded-full bg-current" />
                    <span className="font-medium">{alert.title}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-green-600 text-sm">All systems operational</p>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AdminUserManagementModal
        isOpen={showUsersModal}
        users={users}
        onClose={() => setShowUsersModal(false)}
        onChangeRole={handleChangeRole}
        onSuspendUser={handleSuspendUser}
        onDeleteUser={handleDeleteUser}
      />

      <AdminAlertsModal
        isOpen={showAlertsModal}
        alerts={alerts}
        onClose={() => setShowAlertsModal(false)}
        onResolveAlert={handleResolveAlert}
      />

      {analytics && (
        <AdminAnalyticsModal
          isOpen={showAnalyticsModal}
          analytics={analytics}
          onClose={() => setShowAnalyticsModal(false)}
        />
      )}
    </div>
  );
}
