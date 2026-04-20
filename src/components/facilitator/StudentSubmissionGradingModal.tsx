import React, { useState, useEffect } from 'react';
import { X, Send, CheckCircle } from 'lucide-react';

interface StudentSubmission {
  id: string;
  studentId: string;
  studentName: string;
  lessonId: string;
  lessonTitle: string;
  submittedAt: string;
  content: string;
  attachmentUrl?: string;
}

interface GradingData {
  submissionId: string;
  score: number;
  feedback: string;
  status: 'graded' | 'pending_review';
}

interface StudentSubmissionGradingModalProps {
  isOpen: boolean;
  onClose: () => void;
  submissions: StudentSubmission[];
  onGradeSubmission: (gradeData: GradingData) => Promise<void>;
}

export const StudentSubmissionGradingModal: React.FC<StudentSubmissionGradingModalProps> = ({
  isOpen,
  onClose,
  submissions,
  onGradeSubmission,
}) => {
  const [selectedSubmission, setSelectedSubmission] = useState<StudentSubmission | null>(null);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'queue' | 'grading'>('queue');

  const ungroundSubmissions = submissions.filter(s => !s.id.includes('graded'));

  const handleSelectSubmission = (submission: StudentSubmission) => {
    setSelectedSubmission(submission);
    setScore(0);
    setFeedback('');
    setError('');
    setSuccessMessage('');
    setActiveTab('grading');
  };

  const handleGradeSubmission = async () => {
    if (!selectedSubmission) return;

    if (score < 0 || score > 100) {
      setError('Score must be between 0 and 100');
      return;
    }

    if (!feedback.trim()) {
      setError('Please provide feedback for the student');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onGradeSubmission({
        submissionId: selectedSubmission.id,
        score,
        feedback,
        status: 'graded',
      });

      setSuccessMessage(`✓ Graded ${selectedSubmission.studentName}'s submission`);
      setTimeout(() => {
        setSelectedSubmission(null);
        setScore(0);
        setFeedback('');
        setSuccessMessage('');
        setActiveTab('queue');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to grade submission');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <h2 className="text-2xl font-bold text-gray-900">Grade Student Submissions</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b bg-gray-50">
          <button
            onClick={() => setActiveTab('queue')}
            className={`flex-1 px-4 py-3 font-medium transition-colors ${
              activeTab === 'queue'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Submissions Queue ({ungroundSubmissions.length})
          </button>
          {selectedSubmission && (
            <button
              onClick={() => setActiveTab('grading')}
              className={`flex-1 px-4 py-3 font-medium transition-colors ${
                activeTab === 'grading'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Grading: {selectedSubmission.studentName}
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'queue' && (
            <div className="p-6">
              {ungroundSubmissions.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
                  <p className="text-gray-600 text-lg font-medium">All submissions graded!</p>
                  <p className="text-gray-500 text-sm mt-2">Great work staying on top of grading.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {ungroundSubmissions.map(submission => (
                    <div
                      key={submission.id}
                      onClick={() => handleSelectSubmission(submission)}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">{submission.studentName}</p>
                          <p className="text-sm text-gray-600">{submission.lessonTitle}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            {new Date(submission.submittedAt).toLocaleDateString()}
                          </p>
                          <p className="text-xs font-medium text-red-600">Pending Grading</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{submission.content}</p>
                      {submission.attachmentUrl && (
                        <p className="text-xs text-blue-600 mt-2">📎 Attachment included</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'grading' && selectedSubmission && (
            <div className="p-6 space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                  {error}
                </div>
              )}

              {successMessage && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700 flex items-center gap-2">
                  <CheckCircle size={20} />
                  {successMessage}
                </div>
              )}

              {/* Student & Lesson Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Student</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedSubmission.studentName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Assignment</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedSubmission.lessonTitle}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Submitted</p>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedSubmission.submittedAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Days Late</p>
                    <p className="text-sm text-gray-900">On Time</p>
                  </div>
                </div>
              </div>

              {/* Student Submission Content */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Student Submission</h3>
                <div className="bg-gray-50 p-4 rounded-lg max-h-48 overflow-y-auto">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedSubmission.content}</p>
                </div>
                {selectedSubmission.attachmentUrl && (
                  <p className="text-sm text-blue-600 mt-2 cursor-pointer hover:underline">
                    📎 View attachment
                  </p>
                )}
              </div>

              {/* Grading Section */}
              <div className="border-t pt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Score (0-100)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={score}
                      onChange={(e) => setScore(parseInt(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="text-3xl font-bold text-blue-600 w-16 text-center">
                      {score}%
                    </div>
                  </div>
                  <div className="mt-2 flex gap-2 text-xs">
                    <button
                      onClick={() => setScore(90)}
                      className="px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                    >
                      Excellent (90)
                    </button>
                    <button
                      onClick={() => setScore(75)}
                      className="px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      Good (75)
                    </button>
                    <button
                      onClick={() => setScore(60)}
                      className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                    >
                      Fair (60)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Feedback for Student *
                  </label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Provide constructive feedback on the submission...
What did they do well?
What could be improved?
Specific suggestions for next time?"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Only show when grading */}
        {activeTab === 'grading' && selectedSubmission && (
          <div className="flex gap-3 p-6 border-t bg-gray-50">
            <button
              onClick={() => {
                setSelectedSubmission(null);
                setActiveTab('queue');
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100"
            >
              Back to Queue
            </button>
            <button
              onClick={handleGradeSubmission}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 rounded-lg transition-colors"
            >
              <Send size={18} />
              {loading ? 'Submitting...' : 'Submit Grade & Feedback'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
