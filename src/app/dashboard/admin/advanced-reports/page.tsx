'use client';

import { useState, useEffect } from 'react';
import {
  Calendar,
  Download,
  Filter,
  MoreVertical,
  RefreshCw,
  Trash2,
  Eye,
  FileText,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { useAdminReports } from '@/hooks/useFetchData';
import { exportAsCSV, exportAsJSON } from '@/lib/exportUtils';
import { useNotifications } from '@/context/NotificationContext';
import { createNotification } from '@/types/notification';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  metrics: string[];
}

interface ScheduledReport {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  recipients: string[];
  format: 'csv' | 'json' | 'html';
  lastRun: Date;
  nextRun: Date;
  enabled: boolean;
}

interface ReportHistory {
  id: string;
  name: string;
  createdAt: Date;
  generatedBy: string;
  recordCount: number;
  size: string;
}

const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: 'user-activity',
    name: 'User Activity Report',
    description: 'Track user engagement, login patterns, and activity metrics',
    metrics: ['Total Users', 'Active Users', 'New Users', 'User Retention'],
  },
  {
    id: 'course-performance',
    name: 'Course Performance Report',
    description: 'Analyze course enrollment, completion rates, and learner satisfaction',
    metrics: ['Total Enrollments', 'Completion Rate', 'Avg Rating', 'Dropoff Points'],
  },
  {
    id: 'revenue-analytics',
    name: 'Revenue Analytics',
    description: 'Financial performance and transaction analysis',
    metrics: ['Total Revenue', 'Transactions', 'Avg Transaction', 'Revenue Trend'],
  },
  {
    id: 'event-analysis',
    name: 'Event Analysis Report',
    description: 'Event attendance, engagement, and feedback metrics',
    metrics: ['Total Events', 'Avg Attendance', 'Engagement Rate', 'Feedback Score'],
  },
  {
    id: 'system-health',
    name: 'System Health Report',
    description: 'Platform performance, uptime, and infrastructure metrics',
    metrics: ['Uptime %', 'Avg Response Time', 'Error Rate', 'Active Sessions'],
  },
  {
    id: 'member-benefits',
    name: 'Member Benefits Report',
    description: 'Track member tier usage and benefit redemption',
    metrics: ['Members by Tier', 'Benefit Redemptions', 'Avg Spend', 'Satisfaction'],
  },
];

export default function AdvancedReportsPage() {
  const { reports, isLoading, error } = useAdminReports('all');
  const { addNotification } = useNotifications();

  const [activeTab, setActiveTab] = useState<'reports' | 'templates' | 'scheduled' | 'history'>(
    'reports'
  );
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [dateRange, setDateRange] = useState({ start: '2024-01-01', end: '2024-12-31' });
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'html'>('csv');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [reportHistory, setReportHistory] = useState<ReportHistory[]>([]);
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([]);

  // Load report history on mount
  useEffect(() => {
    loadReportHistory();
  }, []);

  const loadReportHistory = () => {
    // TODO: Fetch from API
    setReportHistory([
      {
        id: 'report-1',
        name: 'User Activity Report',
        createdAt: new Date('2024-12-15'),
        generatedBy: 'admin@example.com',
        recordCount: 15234,
        size: '2.3 MB',
      },
      {
        id: 'report-2',
        name: 'Course Performance Report',
        createdAt: new Date('2024-12-14'),
        generatedBy: 'admin@example.com',
        recordCount: 8923,
        size: '1.8 MB',
      },
      {
        id: 'report-3',
        name: 'Revenue Analytics',
        createdAt: new Date('2024-12-10'),
        generatedBy: 'finance@example.com',
        recordCount: 5234,
        size: '892 KB',
      },
    ]);
  };

  const handleGenerateReport = async () => {
    if (!selectedTemplate) {
      addNotification(
        createNotification(
          'Select Template',
          'Please select a report template first',
          'warning',
          { priority: 'medium' }
        )
      );
      return;
    }

    setIsGenerating(true);
    try {
      // Simulate report generation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Create sample data based on template
      const data = generateReportData(selectedTemplate.id);

      // Export based on format
      if (exportFormat === 'csv') {
        exportAsCSV(data, `${selectedTemplate.name}-${new Date().toISOString().split('T')[0]}`);
      } else if (exportFormat === 'json') {
        exportAsJSON(data, `${selectedTemplate.name}-${new Date().toISOString().split('T')[0]}`);
      }

      // Add to history
      const newReport: ReportHistory = {
        id: `report-${Date.now()}`,
        name: selectedTemplate.name,
        createdAt: new Date(),
        generatedBy: 'current-user@example.com',
        recordCount: data.length,
        size: `${Math.random() * 5}.2 MB`,
      };
      setReportHistory((prev) => [newReport, ...prev]);

      addNotification(
        createNotification(
          'Report Generated',
          `${selectedTemplate.name} has been generated and downloaded`,
          'success',
          { priority: 'low', duration: 4000 }
        )
      );
    } catch (err) {
      addNotification(
        createNotification(
          'Generation Failed',
          'Failed to generate report. Please try again.',
          'error',
          { priority: 'high' }
        )
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const generateReportData = (templateId: string) => {
    // Generate sample data based on template
    const baseData = Array.from({ length: 100 }, (_, i) => ({
      id: i + 1,
      date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
      value: Math.floor(Math.random() * 10000),
      category: ['A', 'B', 'C'][Math.floor(Math.random() * 3)],
    }));

    if (templateId === 'user-activity') {
      return baseData.map((d) => ({
        ...d,
        users: d.value,
        activeUsers: Math.floor(d.value * 0.65),
        newUsers: Math.floor(d.value * 0.15),
        retention: (Math.random() * 40 + 60).toFixed(2),
      }));
    }

    if (templateId === 'course-performance') {
      return baseData.map((d) => ({
        ...d,
        enrollments: d.value,
        completions: Math.floor(d.value * 0.72),
        avgRating: (Math.random() * 2 + 3.5).toFixed(2),
        dropoffRate: (Math.random() * 30).toFixed(2),
      }));
    }

    return baseData;
  };

  const handleScheduleReport = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    setShowScheduleModal(true);
  };

  const handleDeleteReport = (reportId: string) => {
    setReportHistory((prev) => prev.filter((r) => r.id !== reportId));
    addNotification(
      createNotification(
        'Report Deleted',
        'Report has been permanently deleted',
        'info',
        { priority: 'low', duration: 3000 }
      )
    );
  };

  const handleRefresh = () => {
    loadReportHistory();
    addNotification(
      createNotification('Refreshed', 'Report history updated', 'info', {
        priority: 'low',
        duration: 2000,
      })
    );
  };

  return (
    <div className="min-h-screen bg-dark-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Advanced Reports</h1>
            <p className="text-gray-400">Generate and manage comprehensive platform reports</p>
          </div>
          <button
            onClick={handleRefresh}
            className="p-2 text-gray-400 hover:text-white hover:bg-dark-600 rounded-lg transition"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-dark-600">
          {(['reports', 'templates', 'scheduled', 'history'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-medium border-b-2 transition ${
                activeTab === tab
                  ? 'border-primary-500 text-primary-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'reports' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Generator Panel */}
            <div className="lg:col-span-2 space-y-6">
              {/* Template Selection */}
              <div className="bg-dark-700 rounded-lg border border-dark-600 p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Select Template</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                  {REPORT_TEMPLATES.map((template) => (
                    <div
                      key={template.id}
                      onClick={() => setSelectedTemplate(template)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                        selectedTemplate?.id === template.id
                          ? 'border-primary-500 bg-primary-500/10'
                          : 'border-dark-600 hover:border-dark-500 bg-dark-800'
                      }`}
                    >
                      <p className="font-medium text-white text-sm mb-1">{template.name}</p>
                      <p className="text-xs text-gray-400">{template.description}</p>
                    </div>
                  ))}
                </div>

                {selectedTemplate && (
                  <div className="bg-dark-800 rounded p-4 mb-6">
                    <p className="text-sm font-medium text-gray-300 mb-2">Included Metrics:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedTemplate.metrics.map((metric) => (
                        <span key={metric} className="px-3 py-1 bg-primary-500/20 rounded text-xs text-primary-400">
                          {metric}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Date Range & Format */}
              <div className="bg-dark-700 rounded-lg border border-dark-600 p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Configure Report</h2>

                {/* Date Range */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Start Date</label>
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                      className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">End Date</label>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                      className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded text-white text-sm"
                    />
                  </div>
                </div>

                {/* Export Format */}
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Export Format</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['csv', 'json', 'html'].map((format) => (
                      <button
                        key={format}
                        onClick={() => setExportFormat(format as 'csv' | 'json' | 'html')}
                        className={`px-4 py-2 rounded border transition text-sm font-medium ${
                          exportFormat === format
                            ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                            : 'border-dark-600 bg-dark-800 text-gray-400 hover:border-dark-500'
                        }`}
                      >
                        .{format}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleGenerateReport}
                  disabled={!selectedTemplate || isGenerating}
                  className="w-full px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  {isGenerating ? 'Generating...' : 'Generate & Export'}
                </button>
                <button
                  onClick={() => handleScheduleReport(selectedTemplate!)}
                  disabled={!selectedTemplate}
                  className="w-full px-4 py-2 bg-dark-600 text-white rounded-lg font-medium hover:bg-dark-500 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                >
                  <Clock className="w-4 h-4" />
                  Schedule
                </button>
              </div>
            </div>

            {/* Stats Panel */}
            <div className="space-y-4">
              <div className="bg-primary-500/10 border border-primary-500/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-400">Total Reports</p>
                  <FileText className="w-4 h-4 text-primary-400" />
                </div>
                <p className="text-2xl font-bold text-white">{reportHistory.length}</p>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-400">Data Points</p>
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                </div>
                <p className="text-2xl font-bold text-white">
                  {reportHistory.reduce((sum, r) => sum + r.recordCount, 0).toLocaleString()}
                </p>
              </div>

              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-400">Scheduled</p>
                  <Clock className="w-4 h-4 text-green-400" />
                </div>
                <p className="text-2xl font-bold text-white">{scheduledReports.length}</p>
              </div>
            </div>
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {REPORT_TEMPLATES.map((template) => (
              <div key={template.id} className="bg-dark-700 rounded-lg border border-dark-600 p-6">
                <h3 className="text-lg font-semibold text-white mb-2">{template.name}</h3>
                <p className="text-sm text-gray-400 mb-4">{template.description}</p>

                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">Metrics included:</p>
                  <div className="space-y-1">
                    {template.metrics.map((metric) => (
                      <div key={metric} className="text-xs text-gray-300 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                        {metric}
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedTemplate(template);
                    setActiveTab('reports');
                  }}
                  className="w-full px-4 py-2 bg-primary-500 text-white rounded font-medium hover:bg-primary-600 transition text-sm"
                >
                  Use Template
                </button>
              </div>
            ))}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="bg-dark-700 rounded-lg border border-dark-600 overflow-hidden">
            {reportHistory.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No reports generated yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-dark-800 border-b border-dark-600">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                        Report Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                        Generated By
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                        Records
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                        Size
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-600">
                    {reportHistory.map((report) => (
                      <tr key={report.id} className="hover:bg-dark-800 transition">
                        <td className="px-6 py-4 text-sm text-white font-medium">{report.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-400">
                          {report.createdAt.toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400">{report.generatedBy}</td>
                        <td className="px-6 py-4 text-sm text-gray-400">{report.recordCount.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm text-gray-400">{report.size}</td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center gap-2">
                            <button
                              className="text-gray-400 hover:text-blue-400 transition"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteReport(report.id)}
                              className="text-gray-400 hover:text-red-400 transition"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Scheduled Tab */}
        {activeTab === 'scheduled' && (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 mb-4">No scheduled reports yet</p>
            <button
              onClick={() => setActiveTab('templates')}
              className="px-4 py-2 bg-primary-500 text-white rounded font-medium hover:bg-primary-600 transition"
            >
              Schedule a Report
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
