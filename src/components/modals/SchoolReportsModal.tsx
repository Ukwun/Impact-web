"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { X, Download, BarChart3 } from "lucide-react";

interface CourseStats {
  courseId: string;
  courseName: string;
  totalEnrolled: number;
  completed: number;
  completionPercent: number;
  avgGrade?: number;
}

interface Props {
  isOpen: boolean;
  reportType: "enrollment" | "completion";
  data: CourseStats[];
  onClose: () => void;
  onDownload?: () => void;
}

export function SchoolReportsModal({
  isOpen,
  reportType,
  data,
  onClose,
  onDownload,
}: Props) {
  if (!isOpen) return null;

  const title =
    reportType === "enrollment"
      ? "Enrollment Report"
      : "Completion & Performance Report";

  const totalEnrolled = data.reduce((sum, c) => sum + c.totalEnrolled, 0);
  const totalCompleted = data.reduce((sum, c) => sum + c.completed, 0);
  const avgCompletionPercent =
    data.length > 0
      ? Math.round(
          data.reduce((sum, c) => sum + c.completionPercent, 0) / data.length
        )
      : 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden bg-dark-800 border-dark-600">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-600 sticky top-0 bg-dark-800">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary-400" />
              {title}
            </h3>
            <p className="text-sm text-gray-400">
              {data.length} course{data.length !== 1 ? "s" : ""} analyzed
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-dark-700 rounded-lg p-4 text-center">
              <p className="text-gray-400 text-sm mb-1">Total Enrolled</p>
              <p className="text-2xl font-bold text-primary-400">{totalEnrolled}</p>
            </div>
            <div className="bg-dark-700 rounded-lg p-4 text-center">
              <p className="text-gray-400 text-sm mb-1">Completed</p>
              <p className="text-2xl font-bold text-green-400">{totalCompleted}</p>
            </div>
            <div className="bg-dark-700 rounded-lg p-4 text-center">
              <p className="text-gray-400 text-sm mb-1">Avg Completion</p>
              <p className="text-2xl font-bold text-blue-400">
                {avgCompletionPercent}%
              </p>
            </div>
          </div>

          {/* Course Breakdown */}
          <div>
            <h4 className="font-bold text-white mb-3">Course Breakdown</h4>
            <div className="space-y-3">
              {data.map((course) => (
                <div key={course.courseId} className="bg-dark-700 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-white">{course.courseName}</p>
                      <p className="text-xs text-gray-400">
                        {course.completed}/{course.totalEnrolled} completed
                      </p>
                    </div>
                    <span className="text-sm font-bold text-primary-400">
                      {course.completionPercent}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-dark-600 rounded-full h-2 mb-3">
                    <div
                      className="bg-primary-500 h-2 rounded-full"
                      style={{ width: `${course.completionPercent}%` }}
                    />
                  </div>

                  {/* Stats Row */}
                  {reportType === "completion" && (
                    <div className="flex gap-4 text-xs">
                      <div>
                        <span className="text-gray-400">Completion Rate: </span>
                        <span className="text-white font-semibold">
                          {Math.round(
                            (course.completed / course.totalEnrolled) * 100
                          )}
                          %
                        </span>
                      </div>
                      {course.avgGrade !== undefined && (
                        <div>
                          <span className="text-gray-400">Avg Grade: </span>
                          <span className="text-white font-semibold">
                            {course.avgGrade}%
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Insights */}
          {reportType === "completion" && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <p className="text-sm text-blue-300">
                📊 <strong>Insight:</strong> Schools with 75%+ completion rates
                show significantly higher student engagement. Focus on improving
                facilitator-student communication and providing timely feedback.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-dark-600 p-4 flex gap-2 bg-dark-800 sticky bottom-0">
          {onDownload && (
            <Button variant="outline" className="flex-1 gap-2" onClick={onDownload}>
              <Download className="w-4 h-4" />
              Download Report
            </Button>
          )}
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Close
          </Button>
        </div>
      </Card>
    </div>
  );
}
