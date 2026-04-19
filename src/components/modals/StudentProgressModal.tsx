"use client";

import { Card } from "@/components/ui/Card";
import { X, BookOpen, Clock, TrendingUp } from "lucide-react";

interface CourseProgress {
  courseId: string;
  courseName: string;
  facilitatorName: string;
  completionPercent: number;
  lessonsCompleted: number;
  lessonsTotal: number;
  assignmentsSubmitted: number;
  assignmentsTotal: number;
  averageGrade?: number;
  status: "active" | "completed" | "pending";
  enrolledDate: string;
}

interface Props {
  isOpen: boolean;
  progress: CourseProgress | null;
  onClose: () => void;
}

export function StudentProgressModal({ isOpen, progress, onClose }: Props) {
  if (!isOpen || !progress) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-400";
      case "active":
        return "bg-blue-500/20 text-blue-400";
      case "pending":
        return "bg-yellow-500/20 text-yellow-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const getGradeColor = (grade?: number) => {
    if (!grade) return "text-gray-400";
    if (grade >= 90) return "text-green-400";
    if (grade >= 80) return "text-blue-400";
    if (grade >= 70) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl bg-dark-800 border-dark-600">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-600">
          <div>
            <h3 className="text-lg font-bold text-white">{progress.courseName}</h3>
            <p className="text-sm text-gray-400">Facilitator: {progress.facilitatorName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(progress.status)}`}>
              {progress.status.charAt(0).toUpperCase() + progress.status.slice(1)}
            </span>
            <span className="text-xs text-gray-400">Enrolled: {new Date(progress.enrolledDate).toLocaleDateString()}</span>
          </div>

          {/* Progress Bars */}
          <div className="space-y-4">
            {/* Overall Completion */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary-400" />
                  <span className="text-sm font-semibold text-white">Progress</span>
                </div>
                <span className="text-sm font-bold text-primary-400">{progress.completionPercent}%</span>
              </div>
              <div className="w-full bg-dark-700 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all"
                  style={{ width: `${progress.completionPercent}%` }}
                />
              </div>
            </div>

            {/* Lessons */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-semibold text-white">Lessons</span>
                </div>
                <span className="text-sm font-bold text-blue-400">{progress.lessonsCompleted}/{progress.lessonsTotal}</span>
              </div>
              <div className="w-full bg-dark-700 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${(progress.lessonsCompleted / progress.lessonsTotal) * 100}%` }}
                />
              </div>
            </div>

            {/* Assignments */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-semibold text-white">Assignments</span>
                </div>
                <span className="text-sm font-bold text-yellow-400">{progress.assignmentsSubmitted}/{progress.assignmentsTotal}</span>
              </div>
              <div className="w-full bg-dark-700 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-yellow-500 h-2 rounded-full transition-all"
                  style={{ width: `${(progress.assignmentsSubmitted / progress.assignmentsTotal) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-dark-700 rounded-lg p-4">
              <p className="text-xs text-gray-400 mb-2">Completion</p>
              <p className="text-2xl font-bold text-white">{progress.completionPercent}%</p>
            </div>

            {progress.averageGrade !== undefined && (
              <div className="bg-dark-700 rounded-lg p-4">
                <p className="text-xs text-gray-400 mb-2">Average Grade</p>
                <p className={`text-2xl font-bold ${getGradeColor(progress.averageGrade)}`}>
                  {Math.round(progress.averageGrade)}%
                </p>
              </div>
            )}

            <div className="bg-dark-700 rounded-lg p-4">
              <p className="text-xs text-gray-400 mb-2">Lessons Done</p>
              <p className="text-2xl font-bold text-white">{progress.lessonsCompleted}/{progress.lessonsTotal}</p>
            </div>

            <div className="bg-dark-700 rounded-lg p-4">
              <p className="text-xs text-gray-400 mb-2">Submissions</p>
              <p className="text-2xl font-bold text-white">{progress.assignmentsSubmitted}/{progress.assignmentsTotal}</p>
            </div>
          </div>

          {/* Insights */}
          {progress.completionPercent === 100 ? (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
              <p className="text-sm text-green-400 font-semibold">🎉 Course completed!</p>
            </div>
          ) : (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <p className="text-sm text-blue-400">
                {progress.completionPercent >= 75
                  ? "You're almost there! Keep up the great work."
                  : progress.completionPercent >= 50
                  ? `Continue with your studies. You're ${progress.completionPercent}% through.`
                  : "Get started on this course to improve your progress."}
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
