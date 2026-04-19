"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAdminReports } from "@/hooks/useFetchData";
import { exportAsCSV, exportAsJSON } from "@/lib/exportUtils";
import {
  BarChart3,
  TrendingUp,
  Users,
  BookOpen,
  Loader,
  AlertCircle,
  Download,
  Filter,
  ArrowUpRight,
  ChevronDown,
} from "lucide-react";

interface Report {
  id: string;
  title: string;
  description: string;
  metrics: {
    label: string;
    value: string | number;
    change?: string;
  }[];
  generatedAt: string;
  downloadUrl?: string;
}

interface ReportsData {
  reports: Report[];
  systemHealth: {
    uptime: number;
    errorRate: number;
    avgResponseTime: number;
  };
}

export default function AdminReportsPage() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [openExportDropdown, setOpenExportDropdown] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  // Use the reports hook with selected filter
  const { 
    data: reports, 
    loading, 
    error, 
    refetch 
  } = useAdminReports(selectedFilter);

  const handleExportReport = async (report: Report, format: 'csv' | 'json') => {
    setExporting(true);
    try {
      const data = report.metrics.map((m) => ({
        metric: m.label,
        value: m.value,
        change: m.change || 'N/A',
      }));

      const filename = `${report.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}`;

      if (format === 'csv') {
        exportAsCSV(data, filename);
      } else {
        exportAsJSON(
          {
            title: report.title,
            description: report.description,
            generatedAt: report.generatedAt,
            metrics: data,
          },
          filename
        );
      }

      setOpenExportDropdown(null);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div
      className={`space-y-8 pb-12 transition-all duration-700 transform ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-2">
          Reports & Analytics 📈
        </h1>
        <p className="text-base sm:text-lg text-gray-300">
          Comprehensive system and performance analytics
        </p>
      </div>

      {/* System Health Cards */}
      {reports && !loading ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-300">System Uptime</h3>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-white">{reports.systemHealth.uptime}%</p>
              <p className="text-xs text-green-400 mt-2">✓ Excellent</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-300">Error Rate</h3>
                <AlertCircle className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-white">{reports.systemHealth.errorRate}%</p>
              <p className="text-xs text-blue-400 mt-2">✓ Normal</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-300">Avg Response</h3>
                <BarChart3 className="w-5 h-5 text-yellow-500" />
              </div>
              <p className="text-3xl font-bold text-white">{reports.systemHealth.avgResponseTime}ms</p>
              <p className="text-xs text-yellow-400 mt-2">✓ Healthy</p>
            </Card>
          </div>

          {/* Filter and Action Buttons */}
          <div className="flex gap-2 flex-wrap items-center">
            <div className="flex gap-2">
              {["all", "platform", "engagement", "financial"].map((filter) => (
                <Button
                  key={filter}
                  variant={selectedFilter === filter ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setSelectedFilter(filter)}
                  className="capitalize gap-2"
                >
                  <Filter className="w-4 h-4" />
                  {filter === "all" ? "All Reports" : filter}
                </Button>
              ))}
            </div>
          </div>

          {/* Reports Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reports.reports.map((report) => (
              <Card key={report.id} className="p-6 flex flex-col">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-white mb-1">{report.title}</h3>
                  <p className="text-sm text-gray-400">{report.description}</p>
                  <p className="text-xs text-gray-500 mt-2">Generated: {report.generatedAt}</p>
                </div>

                <div className="space-y-3 flex-1">
                  {report.metrics.map((metric, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-dark-600/50 rounded">
                      <div>
                        <p className="text-sm text-gray-400">{metric.label}</p>
                        <p className="text-xl font-bold text-white mt-1">{metric.value}</p>
                      </div>
                      {metric.change && (
                        <div className="flex items-center gap-1 text-green-400">
                          <ArrowUpRight className="w-4 h-4" />
                          <span className="text-sm font-semibold">{metric.change}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="gap-2 w-full mt-6"
                    onClick={() => setOpenExportDropdown(openExportDropdown === report.id ? null : report.id)}
                    disabled={exporting}
                  >
                    <Download className="w-4 h-4" />
                    Export Report
                    <ChevronDown className="w-4 h-4 ml-auto" />
                  </Button>

                  {openExportDropdown === report.id && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => handleExportReport(report, 'csv')}
                        disabled={exporting}
                      >
                        .CSV
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => handleExportReport(report, 'json')}
                        disabled={exporting}
                      >
                        .JSON
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </>
      ) : loading ? (
        <Card className="p-12 flex flex-col items-center justify-center gap-4">
          <Loader className="w-8 h-8 animate-spin text-primary-600" />
          <p className="text-gray-300">Loading reports...</p>
        </Card>
      ) : error ? (
        <Card className="p-6 border-l-4 border-red-500 bg-dark-700/50">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-red-400">Error Loading Reports</h3>
              <p className="text-red-300 text-sm mt-1">{error}</p>
              <Button onClick={() => refetch()} className="mt-4" size="sm">
                Try Again
              </Button>
            </div>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
