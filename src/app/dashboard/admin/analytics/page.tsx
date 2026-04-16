'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Loader,
  AlertCircle,
  TrendingUp,
  Users,
  Calendar,
  CheckCircle,
  Download,
  Filter,
} from 'lucide-react';

interface EventAnalytics {
  totalEvents: number;
  totalRegistrations: number;
  attendanceRate: number;
  averageCapacityUtilization: number;
  eventsByType: { type: string; count: number }[];
  registrationsTrend: { date: string; registrations: number }[];
  topEvents: {
    id: string;
    title: string;
    registrations: number;
    capacity: number;
  }[];
  registrationStatus: { status: string; count: number }[];
}

export default function EventAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<EventAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/admin/events/analytics?timeRange=${timeRange}`
      );
      if (!response.ok) throw new Error('Failed to fetch analytics');

      const data = await response.json();
      setAnalytics(data.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load analytics';
      setError(message);
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!analytics) return;

    // Create CSV content
    const csvContent = [
      ['Event Analytics Report', new Date().toLocaleDateString()],
      [],
      ['Total Events', analytics.totalEvents],
      ['Total Registrations', analytics.totalRegistrations],
      ['Attendance Rate', `${analytics.attendanceRate}%`],
      ['Avg Capacity Utilization', `${analytics.averageCapacityUtilization}%`],
      [],
      ['Events by Type'],
      ['Type', 'Count'],
      ...analytics.eventsByType.map((item) => [item.type, item.count]),
      [],
      ['Top Events'],
      ['Title', 'Registrations', 'Capacity'],
      ...analytics.topEvents.map((item) => [
        item.title,
        item.registrations,
        item.capacity,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `event-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <h1 className="text-4xl font-black text-white">Event Analytics</h1>
        <Card className="p-12 text-center">
          <Loader className="w-8 h-8 text-primary-500 mx-auto mb-4 animate-spin" />
          <p className="text-gray-400">Loading analytics...</p>
        </Card>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="space-y-8">
        <h1 className="text-4xl font-black text-white">Event Analytics</h1>
        <Card className="p-6 bg-danger-500/10 border border-danger-500/30">
          <div className="flex gap-3 items-start">
            <AlertCircle className="w-5 h-5 text-danger-500 mt-0.5" />
            <div>
              <p className="font-semibold text-danger-700">
                {error || 'Failed to load analytics'}
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const COLORS = ['#6366F1', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-white">Event Analytics</h1>
          <p className="text-gray-400">Track event registrations and attendance metrics</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as 'week' | 'month' | 'year')}
            className="px-4 py-2 bg-dark-600 border border-dark-500 rounded-lg text-white focus:border-primary-500 focus:outline-none"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="year">Last Year</option>
          </select>
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleExportCSV}
          >
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Events */}
        <Card className="p-6 bg-gradient-to-br from-primary-500/20 to-primary-600/10">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400 font-semibold mb-2">Total Events</p>
              <h3 className="text-4xl font-black text-primary-400">
                {analytics.totalEvents}
              </h3>
            </div>
            <div className="p-3 rounded-lg bg-primary-500/20">
              <Calendar className="w-6 h-6 text-primary-400" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-dark-600 text-xs text-gray-400">
            All published events
          </div>
        </Card>

        {/* Total Registrations */}
        <Card className="p-6 bg-gradient-to-br from-secondary-500/20 to-secondary-600/10">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400 font-semibold mb-2">Total Registrations</p>
              <h3 className="text-4xl font-black text-secondary-400">
                {analytics.totalRegistrations}
              </h3>
            </div>
            <div className="p-3 rounded-lg bg-secondary-500/20">
              <Users className="w-6 h-6 text-secondary-400" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-dark-600 text-xs text-gray-400">
            User registrations
          </div>
        </Card>

        {/* Attendance Rate */}
        <Card className="p-6 bg-gradient-to-br from-blue-500/20 to-blue-600/10">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400 font-semibold mb-2">Attendance Rate</p>
              <h3 className="text-4xl font-black text-blue-400">
                {analytics.attendanceRate}%
              </h3>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/20">
              <CheckCircle className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-dark-600 text-xs text-gray-400">
            Registered vs attended
          </div>
        </Card>

        {/* Capacity Utilization */}
        <Card className="p-6 bg-gradient-to-br from-green-500/20 to-green-600/10">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400 font-semibold mb-2">Avg Capacity</p>
              <h3 className="text-4xl font-black text-green-400">
                {analytics.averageCapacityUtilization}%
              </h3>
            </div>
            <div className="p-3 rounded-lg bg-green-500/20">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-dark-600 text-xs text-gray-400">
            Capacity utilization
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registrations Trend */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-white mb-4">Registrations Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.registrationsTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
              />
              <Line
                type="monotone"
                dataKey="registrations"
                stroke="#6366F1"
                dot={{ fill: '#6366F1' }}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Events by Type */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-white mb-4">Events by Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.eventsByType}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.type}: ${entry.count}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {analytics.eventsByType.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Registration Status */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-white mb-4">Registration Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.registrationStatus}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="status" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
              />
              <Bar dataKey="count" fill="#6366F1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Top Events */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-white mb-4">Top Events by Registrations</h3>
          <div className="space-y-4">
            {analytics.topEvents.map((event, index) => {
              const utilization = Math.round(
                (event.registrations / event.capacity) * 100
              );
              return (
                <div
                  key={event.id}
                  className="p-4 rounded-lg bg-dark-700/50 border border-dark-600"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold px-2 py-1 rounded bg-primary-500/20 text-primary-400">
                          #{index + 1}
                        </span>
                        <h4 className="font-semibold text-white line-clamp-1">
                          {event.title}
                        </h4>
                      </div>
                      <p className="text-xs text-gray-400">
                        {event.registrations} / {event.capacity} registrations
                      </p>
                    </div>
                    <span className="text-sm font-bold text-secondary-400">
                      {utilization}%
                    </span>
                  </div>
                  <div className="w-full bg-dark-600 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-500 to-secondary-500"
                      style={{ width: `${utilization}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Detailed Metrics Table */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-white mb-4">Events Breakdown by Type</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-dark-600">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400">
                  Event Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400">
                  Count
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400">
                  Percentage
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-600">
              {analytics.eventsByType.map((item) => (
                <tr key={item.type} className="hover:bg-dark-700/50 transition-colors">
                  <td className="px-6 py-3 text-sm text-white font-semibold">
                    {item.type}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-400">{item.count}</td>
                  <td className="px-6 py-3 text-sm text-gray-400">
                    {((item.count / analytics.totalEvents) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
