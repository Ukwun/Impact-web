"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import { X, Loader, TrendingUp, AlertCircle } from "lucide-react";

interface Child {
  id: string;
  name: string;
  createdAt: string;
}

interface ChildProgress {
  childId: string;
  childName: string;
  courseId: string;
  courseName: string;
  facilitatorName: string;
  facilitatorEmail: string;
  completionPercent: number;
  gradesCount: number;
  averageGrade?: number;
  status: "active" | "completed" | "pending";
  enrolledDate: string;
  dueAssignments: number;
}

interface ChildProgressDetailModalProps {
  isOpen: boolean;
  progress: ChildProgress | null;
  onClose: () => void;
  onMessageFacilitator?: (facilitatorEmail: string, facilitatorName: string, childName: string) => void;
}

export function ChildProgressDetailModal({
  isOpen,
  progress,
  onClose,
  onMessageFacilitator,
}: ChildProgressDetailModalProps) {
  if (!isOpen || !progress) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-400";
      case "active":
        return "text-blue-400";
      case "pending":
        return "text-yellow-400";
      default:
        return "text-gray-400";
    }
  };

  const getGradeColor = (grade?: number) => {
    if (!grade) return "text-gray-400";
    if (grade >= 85) return "text-green-400";
    if (grade >= 70) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-dark-800 border border-dark-600">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-600">
          <div>
            <h2 className="text-xl font-bold text-white">{progress.childName}'s Progress</h2>
            <p className="text-sm text-gray-400 mt-1">{progress.courseName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-dark-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-dark-700 p-3 rounded-lg">
              <p className="text-xs text-gray-400">Status</p>
              <p className={`text-sm font-semibold mt-1 ${getStatusColor(progress.status)}`}>
                {progress.status.charAt(0).toUpperCase() + progress.status.slice(1)}
              </p>
            </div>
            <div className="bg-dark-700 p-3 rounded-lg">
              <p className="text-xs text-gray-400">Enrolled</p>
              <p className="text-sm font-semibold text-gray-300 mt-1">
                {new Date(progress.enrolledDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-300">Completion</p>
              <p className="text-sm font-bold text-primary-400">{progress.completionPercent}%</p>
            </div>
            <div className="w-full bg-dark-700 rounded-full h-2">
              <div
                className="bg-primary-500 h-2 rounded-full transition-all"
                style={{ width: `${progress.completionPercent}%` }}
              />
            </div>
          </div>

          {/* Grades */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-dark-700 p-3 rounded-lg">
              <p className="text-xs text-gray-400">Grades Received</p>
              <p className="text-lg font-bold text-gray-300 mt-1">{progress.gradesCount}</p>
            </div>
            <div className="bg-dark-700 p-3 rounded-lg">
              <p className="text-xs text-gray-400">Average Grade</p>
              <p className={`text-lg font-bold mt-1 ${getGradeColor(progress.averageGrade)}`}>
                {progress.averageGrade ? `${Math.round(progress.averageGrade)}%` : "N/A"}
              </p>
            </div>
          </div>

          {/* Pending Assignments */}
          {progress.dueAssignments > 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 p-3 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-yellow-300">
                  {progress.dueAssignments} Due Assignment{progress.dueAssignments !== 1 ? 's' : ''}
                </p>
                <p className="text-xs text-yellow-200 mt-1">
                  Help {progress.childName} complete these tasks
                </p>
              </div>
            </div>
          )}

          {/* Facilitator Info */}
          <div className="bg-dark-700 p-3 rounded-lg">
            <p className="text-xs text-gray-400 mb-2">Facilitator</p>
            <p className="text-sm font-semibold text-gray-300">{progress.facilitatorName}</p>
            <p className="text-xs text-gray-500 mt-0.5">{progress.facilitatorEmail}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 p-6 border-t border-dark-600 bg-dark-900/50">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="flex-1"
          >
            Close
          </Button>
          {onMessageFacilitator && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                onMessageFacilitator(progress.facilitatorEmail, progress.facilitatorName, progress.childName);
                onClose();
              }}
              className="flex-1 gap-2"
            >
              Message Teacher
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
