"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Upload,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  MessageSquare,
  Download,
  Trash2,
  X,
} from "lucide-react";

interface AssignmentProps {
  assignment: {
    id: string;
    title: string;
    description: string;
    instructions?: string;
    dueDate: string;
    maxPoints: number;
    rubric: Array<{ criterion?: string; criteria?: string; points: number }>;
  };
}

export default function AssignmentComponent({ assignment }: AssignmentProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles([...files, ...droppedFiles]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles([...files, ...Array.from(e.target.files)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (files.length === 0) {
      alert("Please upload at least one file");
      return;
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card className="p-12 text-center bg-dark-700/50 border-2 border-green-500 text-white">
          <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-6" />
          <h2 className="text-4xl font-black text-green-700 mb-2">
            Assignment Submitted! ✓
          </h2>
          <p className="text-lg text-green-600 font-semibold mb-8">
            Your work has been received and is pending review
          </p>

          {/* Submission Details */}
          <Card className="p-6 bg-dark-700/50 rounded-xl mb-8 border border-dark-600">
            <div className="space-y-4 text-left">
              <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <span className="font-semibold text-text-500">Submitted Files:</span>
                <span className="font-bold text-primary-600">{files.length}</span>
              </div>
              <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <span className="font-semibold text-text-500">Submission Time:</span>
                <span className="font-bold text-text-500">Just now</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-text-500">Status:</span>
                <span className="px-3.5 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
                  Pending Review
                </span>
              </div>
            </div>
          </Card>

          {/* Uploaded Files */}
          <div className="mb-8 text-left">
            <h4 className="font-bold text-text-500 mb-3">Your Files:</h4>
            <div className="space-y-2">
              {files.map((file, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-dark-700/30 rounded-lg border border-dark-600">
                  <FileText className="w-5 h-5 text-primary-600" />
                  <span className="font-semibold text-text-500 flex-1">{file.name}</span>
                  <span className="text-xs text-gray-300">{(file.size / 1024).toFixed(1)} KB</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Button variant="primary" className="w-full justify-center">
              View Assignment Feedback
            </Button>
            <Button variant="light" className="w-full justify-center">
              Back to Course
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Assignment Header */}
      <Card className="p-8">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-black text-text-500 mb-2">
                {assignment.title}
              </h1>
              <p className="text-gray-300 text-lg">{assignment.description}</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-black text-primary-600 mb-2">
                {assignment.maxPoints}
              </div>
              <p className="text-sm text-gray-300 font-semibold">Points</p>
            </div>
          </div>

          {/* Due Date Alert */}
          <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl flex items-start gap-3">
            <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-yellow-900">Due on {assignment.dueDate}</p>
              <p className="text-sm text-yellow-800">Submit before the deadline to avoid late penalties</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Instructions */}
      {assignment.instructions && (
      <Card className="p-8">
        <h2 className="text-2xl font-bold text-text-500 mb-4">Instructions</h2>
        <div className="prose prose-sm max-w-none">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {assignment.instructions}
          </p>
        </div>
      </Card>
      )}

      {/* Rubric */}
      <Card className="p-8">
        <h2 className="text-2xl font-bold text-text-500 mb-4">Grading Rubric</h2>
        <div className="space-y-3">
          {assignment.rubric.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="font-semibold text-text-500">{item.criterion || item.criteria}</p>
              <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-bold">
                {item.points} pts
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between p-4 bg-dark-700/50 rounded-lg border-2 border-primary-500 font-bold">
            <p className="text-text-500">Total</p>
            <span className="px-3 py-1 bg-primary-500 text-white rounded-full text-sm">
              {assignment.rubric.reduce((acc, item) => acc + item.points, 0)} pts
            </span>
          </div>
        </div>
      </Card>

      {/* File Upload Section */}
      <Card className="p-8">
        <h2 className="text-2xl font-bold text-text-500 mb-6">Submit Your Work</h2>

        {/* Drag and Drop Area */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-3 border-dashed rounded-2xl p-12 text-center transition-all ${
            dragActive
              ? "border-primary-500 bg-primary-50"
              : "border-gray-300 bg-gray-50 hover:border-primary-400"
          }`}
        >
          <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-text-500 mb-2">
            Drag files here or click to browse
          </h3>
          <p className="text-gray-300 mb-6">
            Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 25MB per file)
          </p>
          <input
            type="file"
            id="file-upload"
            onChange={handleFileChange}
            multiple
            className="hidden"
          />
          <Button
            variant="primary"
            onClick={() => document.getElementById("file-upload")?.click()}
            className="gap-2"
          >
            <Upload className="w-4 h-4" />
            Choose Files
          </Button>
        </div>

        {/* Uploaded Files */}
        {files.length > 0 && (
          <div className="mt-8 space-y-3">
            <h4 className="font-bold text-text-500">Uploaded Files ({files.length})</h4>
            {files.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 bg-dark-700/50 border-2 border-primary-500 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-primary-600" />
                  <div>
                    <p className="font-semibold text-text-500">{file.name}</p>
                    <p className="text-xs text-gray-300">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(idx)}
                  className="p-2 hover:bg-primary-200 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-primary-600" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Submission Comments */}
        <div className="mt-8">
          <label className="block font-bold text-text-500 mb-3">
            <MessageSquare className="w-4 h-4 inline mr-2" />
            Add Comments (Optional)
          </label>
          <textarea
            value={submissionMessage}
            onChange={(e) => setSubmissionMessage(e.target.value)}
            placeholder="Share any notes or context about your submission..."
            className="w-full h-24 p-4 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none resize-none"
          ></textarea>
        </div>

        {/* Submit Button */}
        <Button
          variant="primary"
          size="lg"
          onClick={handleSubmit}
          disabled={files.length === 0}
          className="w-full justify-center mt-6 gap-2"
        >
          <Upload className="w-5 h-5" />
          Submit Assignment
        </Button>
      </Card>

      {/* Help Section */}
      <Card className="p-6 bg-dark-700/50 border-2 border-blue-500">
        <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Need Help?
        </h3>
        <p className="text-sm text-blue-800 mb-3">
          Contact your instructor or visit the help center for more information about this assignment.
        </p>
        <Button variant="light" size="sm" className="gap-2">
          <MessageSquare className="w-4 h-4" />
          Send Message
        </Button>
      </Card>
    </div>
  );
}
