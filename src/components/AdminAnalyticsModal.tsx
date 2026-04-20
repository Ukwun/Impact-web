import React, { useState } from 'react';
import { BarChart3, TrendingUp, Users, Zap, X } from 'lucide-react';

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

interface AdminAnalyticsModalProps {
  isOpen: boolean;
  analytics: AnalyticsData;
  onClose: () => void;
}

const AdminAnalyticsModal: React.FC<AdminAnalyticsModalProps> = ({
  isOpen,
  analytics,
  onClose,
}) => {
  const [selectedView, setSelectedView] = useState<'overview' | 'users' | 'schools'>('overview');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Platform Analytics</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* View Tabs */}
          <div className="flex gap-2 mb-6 border-b">
            <button
              onClick={() => setSelectedView('overview')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                selectedView === 'overview'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setSelectedView('users')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                selectedView === 'users'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              User Analytics
            </button>
            <button
              onClick={() => setSelectedView('schools')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                selectedView === 'schools'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Schools
            </button>
          </div>

          {selectedView === 'overview' && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                  <div className="text-gray-600 text-sm font-medium mb-1">Total Users</div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{analytics.totalUsers}</div>
                  <div className="text-green-600 text-sm font-medium flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    +{analytics.userGrowth}% this month
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
                  <div className="text-gray-600 text-sm font-medium mb-1">Active Users (30d)</div>
                  <div className="text-3xl font-bold text-gray-900">
                    {analytics.activeUsers}
                  </div>
                  <div className="text-green-600 text-sm font-medium">
                    {((analytics.activeUsers / analytics.totalUsers) * 100).toFixed(1)}% engagement
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
                  <div className="text-gray-600 text-sm font-medium mb-1">Total Schools</div>
                  <div className="text-3xl font-bold text-gray-900">{analytics.totalSchools}</div>
                  <div className="text-gray-600 text-sm">
                    {(analytics.totalUsers / analytics.totalSchools).toFixed(0)} avg per school
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-lg p-6">
                  <div className="text-gray-600 text-sm font-medium mb-1">Professional Circles</div>
                  <div className="text-3xl font-bold text-gray-900">{analytics.totalCircles}</div>
                  <div className="text-gray-600 text-sm">
                    Community engagement network
                  </div>
                </div>

                <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200 rounded-lg p-6">
                  <div className="text-gray-600 text-sm font-medium mb-1">Platform Uptime</div>
                  <div className="text-3xl font-bold text-gray-900">
                    {analytics.platformUptime.toFixed(2)}%
                  </div>
                  <div className="text-green-600 text-sm font-medium">Excellent reliability</div>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg p-6">
                  <div className="text-gray-600 text-sm font-medium mb-1">Avg Response Time</div>
                  <div className="text-3xl font-bold text-gray-900">
                    {analytics.averageResponseTime}ms
                  </div>
                  <div className="text-gray-600 text-sm">Good performance</div>
                </div>
              </div>

              {/* Discussions */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Network Activity</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-gray-600 text-sm font-medium mb-2">Total Discussions</div>
                    <div className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-blue-600" />
                      {analytics.totalDiscussions}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600 text-sm font-medium mb-2">Avg Discussions/Circle</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {(analytics.totalDiscussions / Math.max(analytics.totalCircles, 1)).toFixed(1)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedView === 'users' && (
            <div className="space-y-6">
              {/* Users by Role */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Users by Role
                </h3>
                <div className="space-y-3">
                  {Object.entries(analytics.byRole).map(([role, count]) => (
                    <div key={role}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-gray-700">{role}</span>
                        <span className="font-bold text-gray-900">{count} users</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 rounded-full h-2 transition-all"
                          style={{
                            width: `${(count / analytics.totalUsers) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Users by Status */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Users by Status</h3>
                <div className="grid grid-cols-3 gap-4">
                  {Object.entries(analytics.byStatus).map(([status, count]) => (
                    <div key={status} className="bg-white rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-gray-900">{count}</div>
                      <div className="text-sm text-gray-600 capitalize">{status}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {((count / analytics.totalUsers) * 100).toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedView === 'schools' && (
            <div className="space-y-6">
              {/* Top Schools */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b font-bold text-gray-900">
                  Top Schools by User Count
                </div>
                <div className="divide-y">
                  {analytics.topSchools.map((school, idx) => (
                    <div key={idx} className="px-6 py-4 hover:bg-gray-100 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold text-gray-900">{school.name}</h4>
                          <p className="text-sm text-gray-600">
                            {school.activeCount} active users
                          </p>
                        </div>
                        <span className="font-bold text-gray-900">{school.userCount} total</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 rounded-full h-2 transition-all"
                          style={{
                            width: `${(school.activeCount / school.userCount) * 100}%`,
                          }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {((school.activeCount / school.userCount) * 100).toFixed(1)}% active
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsModal;
