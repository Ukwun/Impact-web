"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { X, Save, Loader } from "lucide-react";
import { AUTH_TOKEN_KEY } from "@/lib/authStorage";

interface Submission {
  id: string;
  studentName: string;
  studentEmail: string;
  assignmentTitle: string;
  submittedAt: string;
  grade?: number;
  feedback?: string;
}

interface GradeSubmissionModalProps {
  isOpen: boolean;
  submission: Submission | null;
  onClose: () => void;
  onSubmit: (submissionId: string, grade: number, feedback: string) => Promise<void>;
}

export function GradeSubmissionModal({
  isOpen,
  submission,
  onClose,
  onSubmit,
}: GradeSubmissionModalProps) {
  const [grade, setGrade] = useState<number>(submission?.grade || 0);
  const [feedback, setFeedback] = useState<string>(submission?.feedback || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success, error: errorToast } = useToast();

  if (!isOpen || !submission) return null;

  const handleSubmit = async () => {
    if (grade < 0 || grade > 100) {
      errorToast("Error", "Grade must be between 0 and 100");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(submission.id, grade, feedback);
      success("Submission Graded", `${submission.studentName}'s work has been graded`);
      setGrade(0);
      setFeedback("");
      onClose();
    } catch (err) {
      errorToast("Error", err instanceof Error ? err.message : "Failed to save grade");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-dark-800 border border-dark-600">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-600">
          <div>
            <h2 className="text-xl font-bold text-white">Grade Submission</h2>
            <p className="text-sm text-gray-400 mt-1">
              {submission.studentName} • {submission.assignmentTitle}
            </p>
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
          {/* Grade Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Grade (0-100)
            </label>
            <Input
              type="number"
              min="0"
              max="100"
              value={grade}
              onChange={(e) => setGrade(parseInt(e.target.value) || 0)}
              placeholder="Enter grade"
              className="w-full"
            />
            <p className="text-xs text-gray-400 mt-1">
              Current: <span className="font-semibold">{grade}%</span>
            </p>
          </div>

          {/* Feedback */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Feedback for Student
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Provide constructive feedback..."
              className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none resize-none"
              rows={4}
            />
          </div>

          {/* Submitted Info */}
          <div className="bg-dark-700 p-3 rounded-lg text-sm text-gray-300">
            <p>
              <span className="text-gray-400">Submitted:</span>{" "}
              {new Date(submission.submittedAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 p-6 border-t border-dark-600 bg-dark-900/50">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Grade
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
