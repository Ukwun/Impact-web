"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { X, Calendar, CheckCircle, Clock, AlertCircle, Loader } from "lucide-react";

interface Assignment {
  id: string;
  courseId: string;
  courseName: string;
  title: string;
  dueDate: string;
  status: "pending" | "submitted" | "graded";
  submittedDate?: string;
  grade?: number;
  feedback?: string;
}

interface ChildAssignmentsModalProps {
  isOpen: boolean;
  childName: string;
  assignments: Assignment[];
  isLoading?: boolean;
  onClose: () => void;
  onViewDetails?: (assignmentId: string) => void;
}

export function ChildAssignmentsModal({
  isOpen,
  childName,
  assignments,
  isLoading = false,
  onClose,
  onViewDetails,
}: ChildAssignmentsModalProps) {
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "submitted" | "graded">("all");

  if (!isOpen) return null;

  const filteredAssignments = assignments.filter((a) => filterStatus === "all" || a.status === filterStatus);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "graded":
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "submitted":
        return <Clock className="w-4 h-4 text-blue-400" />;
      case "pending":
        return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      default:
        return null;
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case "graded":
        return "bg-green-500/10 border-green-500/30";
      case "submitted":
        return "bg-blue-500/10 border-blue-500/30";
      case "pending":
        return "bg-yellow-500/10 border-yellow-500/30";
      default:
        return "bg-gray-500/10 border-gray-500/30";
    }
  };

  const isOverdue = (dueDate: string, status: string) => {
    return status === "pending" && new Date(dueDate) < new Date();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-dark-800 border border-dark-600 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-600">
          <div>
            <h2 className="text-xl font-bold text-white">Assignments</h2>
            <p className="text-sm text-gray-400 mt-1">{childName}'s Tasks & Progress</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-dark-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Filter */}
        <div className="p-4 border-b border-dark-600 flex gap-2">
          {(["all", "pending", "submitted", "graded"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                filterStatus === status
                  ? "bg-primary-600 text-white"
                  : "bg-dark-700 text-gray-400 hover:bg-dark-600"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Assignments List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="w-5 h-5 text-primary-500 animate-spin" />
            </div>
          ) : filteredAssignments.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              {filterStatus === "all" ? "No assignments yet" : `No ${filterStatus} assignments`}
            </div>
          ) : (
            <div className="divide-y divide-dark-600">
              {filteredAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className={`p-4 border-l-4 border-l-transparent hover:bg-dark-700/50 transition-colors ${
                    isOverdue(assignment.dueDate, assignment.status) ? "border-l-red-500" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(assignment.status)}
                        <h3 className="font-semibold text-white">{assignment.title}</h3>
                      </div>
                      <p className="text-xs text-gray-400 mb-2">{assignment.courseName}</p>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Due: {new Date(assignment.dueDate).toLocaleDateString()}
                        </div>
                        {assignment.submittedDate && (
                          <div className="text-blue-400">
                            Submitted: {new Date(assignment.submittedDate).toLocaleDateString()}
                          </div>
                        )}
                        {assignment.grade !== undefined && (
                          <div className="text-green-400 font-semibold">
                            Grade: {assignment.grade}%
                          </div>
                        )}
                      </div>
                      {assignment.feedback && (
                        <div className="mt-3 p-2 bg-dark-700 rounded text-xs text-gray-300">
                          <p className="font-semibold text-gray-400 mb-1">Feedback:</p>
                          <p>{assignment.feedback.substring(0, 150)}...</p>
                        </div>
                      )}
                    </div>
                    {onViewDetails && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewDetails(assignment.id)}
                      >
                        View
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-dark-600 bg-dark-900/50 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </Card>
    </div>
  );
}
