"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useFacilitatorAnalytics } from "@/hooks/useFetchData";
import {
  BarChart3,
  Users,
  BookOpen,
  TrendingUp,
  Alert,
  Download,
  DateRange,
  Loader,
} from "lucide-react";

interface CourseAnalytics {
  id: string;
  title: string;
  students: number;
  avgProgress: number;
  completionRate: number;
  engagementScore: number;
  lastUpdated: string;
}

interface AnalyticsMetrics {
  totalCourses: number;
  totalStudents: number;
  avgCompletionRate: number;
  avgEngagement: number;
  courses: CourseAnalytics[];
}

export default function FacilitatorAnalyticsPage() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("month");

  // Use the analytics hook with selected period
  const { 
    data: metrics, 
    loading, 
    error, 
    refetch 
  } = useFacilitatorAnalytics(selectedPeriod);

  // Handle visibility animation
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
          Course Analytics 📊
        </h1>
        <p className="text-base sm:text-lg text-gray-300">
          Track student engagement, progress, and performance across your courses
        </p>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2 flex-wrap">
        {["week", "month", "quarter", "year"].map((period) => (
          <Button
            key={period}
            variant={selectedPeriod === period ? "primary" : "outline"}
            size="sm"
            onClick={() => setSelectedPeriod(period)}
            className="capitalize"
          >
            {period === "quarter" ? "Q" : period.charAt(0).toUpperCase() + period.slice(1)}
          </Button>
        ))}
      </div>

      {/* Summary Cards */}
      {metrics && !loading ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-300">Total Courses</h3>
                <BookOpen className="w-5 h-5 text-primary-500" />
              </div>
              <p className="text-3xl font-bold text-white">{metrics.totalCourses}</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-300">Total Students</h3>
                <Users className="w-5 h-5 text-secondary-500" />
              </div>
              <p className="text-3xl font-bold text-white">{metrics.totalStudents}</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-300">Avg Completion</h3>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-white">{metrics.avgCompletionRate}%</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-300">Avg Engagement</h3>
                <BarChart3 className="w-5 h-5 text-yellow-500" />
              </div>
              <p className="text-3xl font-bold text-white">{metrics.avgEngagement}%</p>
            </Card>
          </div>

          {/* Course Analytics Table */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Course Performance</h2>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => {
                  // Export functionality
                }}
              >
                <Download className="w-4 h-4" />
                Export Report
              </Button>
            </div>

            <Card className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-600">
                    <th className="p-4 text-left text-sm font-semibold text-gray-300">Course</th>
                    <th className="p-4 text-center text-sm font-semibold text-gray-300">Students</th>
                    <th className="p-4 text-center text-sm font-semibold text-gray-300">Progress</th>
                    <th className="p-4 text-center text-sm font-semibold text-gray-300">
                      Completion
                    </th>
                    <th className="p-4 text-center text-sm font-semibold text-gray-300">
                      Engagement
                    </th>
                    <th className="p-4 text-center text-sm font-semibold text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.courses.map((course) => (
                    <tr key={course.id} className="border-b border-dark-600 hover:bg-dark-700/50">
                      <td className="p-4">
                        <div>
                          <p className="font-semibold text-white">{course.title}</p>
                          <p className="text-xs text-gray-400">Updated: {course.lastUpdated}</p>
                        </div>
                      </td>
                      <td className="p-4 text-center text-white">{course.students}</td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-full max-w-xs bg-dark-600 rounded h-2">
                            <div
                              className="bg-primary-500 h-2 rounded"
                              style={{ width: `${course.avgProgress}%` }}
                            />
                          </div>
                          <span className="text-sm text-white min-w-[40px]">
                            {course.avgProgress}%
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-center text-white">{course.completionRate}%</td>
                      <td className="p-4 text-center text-white">{course.engagementScore}%</td>
                      <td className="p-4 text-center">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            router.push(
                              `/dashboard/facilitator/content?courseId=${course.id}&tab=analytics`
                            )
                          }
                        >
                          Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        </>
      ) : loading ? (
        <Card className="p-12 flex flex-col items-center justify-center gap-4">
          <Loader className="w-8 h-8 animate-spin text-primary-600" />
          <p className="text-gray-300">Loading analytics...</p>
        </Card>
      ) : error ? (
        <Card className="p-6 border-l-4 border-red-500 bg-dark-700/50">
          <div className="flex items-start gap-4">
            <Alert className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-red-400">Error Loading Analytics</h3>
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
