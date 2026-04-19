"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { X, FileText, CheckCircle, AlertCircle, Clock } from "lucide-react";

interface Assignment {
  id: string;
  title: string;
  courseId: string;
  courseName: string;
  dueDate: string;
  description?: string;
  instructions?: string;
  pointsTotal: number;
  attachments?: { name: string; url: string }[];
  submission?: {
    submittedAt: string;
    content: string;
    fileUrl?: string;
    grade?: number;
    feedback?: string;
  };
}

interface Props {
  isOpen: boolean;
  assignment: Assignment | null;
  onClose: () => void;
  onSubmit?: (assignmentId: string, content: string, fileUrl?: string) => Promise<void>;
  isSubmitting?: boolean;
}

export function AssignmentDetailModal({ isOpen, assignment, onClose, onSubmit, isSubmitting = false }: Props) {
  const [submissionContent, setSubmissionContent] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !assignment) return null;

  const hasSubmission = !!assignment.submission;
  const isOverdue = new Date(assignment.dueDate) < new Date();
  const daysUntilDue = Math.ceil((new Date(assignment.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  const handleSubmit = async () => {
    if (!submissionContent.trim() && !selectedFile) return;

    try {
      if (onSubmit) {
        await onSubmit(assignment.id, submissionContent, selectedFile?.name);
        setSubmitted(true);
        setSubmissionContent("");
        setSelectedFile(null);
        setTimeout(() => {
          setSubmitted(false);
          onClose();
        }, 1500);
      }
    } catch (error) {
      console.error("Error submitting assignment:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-96 overflow-y-auto bg-dark-800 border-dark-600">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-600 sticky top-0 bg-dark-800">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white">{assignment.title}</h3>
            <p className="text-sm text-gray-400">{assignment.courseName}</p>
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
          {/* Status Section */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-dark-700 rounded-lg p-4">
              <p className="text-xs text-gray-400 mb-1">Due Date</p>
              <div className="flex items-end gap-2">
                <p className="text-white font-semibold">{new Date(assignment.dueDate).toLocaleDateString()}</p>
                {!hasSubmission && (
                  <span className={`text-xs px-2 py-1 rounded ${
                    isOverdue
                      ? "bg-red-500/20 text-red-400"
                      : daysUntilDue <= 1
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-blue-500/20 text-blue-400"
                  }`}>
                    {isOverdue ? "Overdue" : daysUntilDue <= 1 ? "Due soon" : `${daysUntilDue} days`}
                  </span>
                )}
              </div>
            </div>
            <div className="bg-dark-700 rounded-lg p-4">
              <p className="text-xs text-gray-400 mb-1">Points</p>
              <p className="text-white font-semibold">{assignment.pointsTotal}</p>
            </div>
          </div>

          {/* Description */}
          {assignment.description && (
            <div>
              <h4 className="font-semibold text-white mb-2">Instructions</h4>
              <p className="text-sm text-gray-300 leading-relaxed">{assignment.description}</p>
            </div>
          )}

          {/* Attachments */}
          {assignment.attachments && assignment.attachments.length > 0 && (
            <div>
              <h4 className="font-semibold text-white mb-2">Attachments</h4>
              <div className="space-y-2">
                {assignment.attachments.map((attachment, idx) => (
                  <a
                    key={idx}
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm"
                  >
                    <FileText className="w-4 h-4" />
                    {attachment.name}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Submission Status or Form */}
          {hasSubmission ? (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <div className="flex items-start gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-green-400">Submitted</p>
                  <p className="text-sm text-gray-300">on {new Date(assignment.submission.submittedAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Grade */}
              {assignment.submission.grade !== undefined && (
                <div className="space-y-2 mt-4 pt-4 border-t border-green-500/20">
                  <p className="text-sm text-gray-300">Grade: <span className="font-bold text-white">{assignment.submission.grade}/{assignment.pointsTotal}</span></p>
                  {assignment.submission.feedback && (
                    <div>
                      <p className="text-sm text-gray-300 mb-1">Feedback:</p>
                      <p className="text-sm text-gray-400 italic">{assignment.submission.feedback}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4 p-4 bg-dark-700 rounded-lg">
              <h4 className="font-semibold text-white">Submit Your Work</h4>
              
              <textarea
                value={submissionContent}
                onChange={(e) => setSubmissionContent(e.target.value)}
                placeholder="Type your submission here or upload a file..."
                className="w-full h-24 bg-dark-600 text-white border border-dark-500 rounded px-3 py-2 focus:outline-none focus:border-primary-500 text-sm resize-none"
              />

              <div className="border-2 border-dashed border-dark-500 rounded-lg p-4 text-center">
                <input
                  type="file"
                  id="file-upload"
                  onChange={(e) => setSelectedFile(e.files?.[0] || null)}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt,.jpg,.png"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">
                    {selectedFile ? selectedFile.name : "Click to upload or drag file"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">PDF, DOC, TXT, JPG, PNG (max 10MB)</p>
                </label>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={handleSubmit}
                  disabled={(!submissionContent.trim() && !selectedFile) || isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Assignment"}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {submitted && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
              <p className="text-sm text-green-400">✓ Submitted successfully!</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
