import React, { useState } from 'react';
import { X, TrendingUp } from 'lucide-react';

interface ClassStudent {
  id: string;
  name: string;
  enrolledDate: string;
  submissionRate: number; // percentage
  averageScore: number;
  lastActivityDate: string;
}

interface ClassAnalyticsData {
  courseTitle: string;
  totalStudents: number;
  enrolledStudents: number;
  completionRate: number;
  averageScore: number;
  submissionRate: number;
  topStudent: ClassStudent;
  needsHelpStudents: ClassStudent[];
  studentsProgress: ClassStudent[];
}

interface ClassAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  analyticsData?: ClassAnalyticsData;
}

export const ClassAnalyticsModal: React.FC<ClassAnalyticsModalProps> = ({
  isOpen,
  onClose,
  analyticsData,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'trends'>('overview');

  const mockData: ClassAnalyticsData = analyticsData || {
    courseTitle: 'Advanced Mathematics',
    totalStudents: 28,
    enrolledStudents: 26,
    completionRate: 78,
    averageScore: 82,
    submissionRate: 92,
    topStudent: {
      id: '1',
      name: 'Sarah Chen',
      enrolledDate: '2024-01-15',
      submissionRate: 100,
      averageScore: 98,
      lastActivityDate: '2024-01-25',
    },
    needsHelpStudents: [
      {
        id: '2',
        name: 'Marcus Johnson',
        enrolledDate: '2024-01-15',
        submissionRate: 60,
        averageScore: 62,
        lastActivityDate: '2024-01-20',
      },
      {
        id: '3',
        name: 'Alex Rodriguez',
        enrolledDate: '2024-01-15',
        submissionRate: 50,
        averageScore: 55,
        lastActivityDate: '2024-01-18',
      },
    ],
    studentsProgress: [
      {
        id: '4',
        name: 'Jessica Park',
        enrolledDate: '2024-01-15',
        submissionRate: 100,
        averageScore: 91,
        lastActivityDate: '2024-01-25',
      },
      {
        id: '5',
        name: 'David Brown',
        enrolledDate: '2024-01-15',
        submissionRate: 95,
        averageScore: 87,
        lastActivityDate: '2024-01-25',
      },
      {
        id: '6',
        name: 'Emily White',
        enrolledDate: '2024-01-15',
        submissionRate: 100,
        averageScore: 85,
        lastActivityDate: '2024-01-24',
      },
    ],
  };

  const data = analyticsData || mockData;

  if (!isOpen) return null;

  // Score color based on percentage
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600 bg-green-50';
    if (score >= 70) return 'text-blue-600 bg-blue-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  // Score icon/indicator
  const getScoreIndicator = (score: number) => {
    if (score >= 85) return '★★★★★';
    if (score >= 70) return '★★★★';
    if (score >= 60) return '★★★';
    return '★★';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-purple-50 to-pink-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Class Analytics</h2>
            <p className="text-sm text-gray-600 mt-1">{data.courseTitle}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b bg-gray-50">
          {(['overview', 'students', 'trends'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-3 font-medium transition-colors capitalize ${
                activeTab === tab
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="p-6 space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Total Enrollment</p>
                  <p className="text-3xl font-bold text-blue-600">{data.enrolledStudents}</p>
                  <p className="text-xs text-gray-600 mt-1">of {data.totalStudents} capacity</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Avg Score</p>
                  <p className="text-3xl font-bold text-green-600">{data.averageScore}%</p>
                  <p className="text-xs text-gray-600 mt-1">Class average</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Completion</p>
                  <p className="text-3xl font-bold text-purple-600">{data.completionRate}%</p>
                  <p className="text-xs text-gray-600 mt-1">Course completion rate</p>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Submissions</p>
                  <p className="text-3xl font-bold text-orange-600">{data.submissionRate}%</p>
                  <p className="text-xs text-gray-600 mt-1">On-time submissions</p>
                </div>
              </div>

              {/* Top Performer */}
              <div className="border rounded-lg p-4 bg-gradient-to-r from-green-50 to-teal-50">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Top Performer</h3>
                    <p className="text-sm text-gray-600">Highest achieving student</p>
                  </div>
                  <TrendingUp className="text-green-600" size={24} />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Student</p>
                    <p className="font-semibold text-gray-900">{data.topStudent.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Average Score</p>
                    <p className="text-2xl font-bold text-green-600">{data.topStudent.averageScore}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Submission Rate</p>
                    <p className="text-2xl font-bold text-green-600">{data.topStudent.submissionRate}%</p>
                  </div>
                </div>
              </div>

              {/* Students Needing Help */}
              {data.needsHelpStudents.length > 0 && (
                <div className="border rounded-lg p-4 bg-gradient-to-r from-red-50 to-orange-50">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Students Needing Support
                  </h3>
                  <div className="space-y-3">
                    {data.needsHelpStudents.map(student => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-3 bg-white rounded border border-red-200"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{student.name}</p>
                          <p className="text-xs text-gray-600">
                            Avg: {student.averageScore}% | Submissions: {student.submissionRate}%
                          </p>
                        </div>
                        <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded font-medium">
                          Reach Out
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Students Tab */}
          {activeTab === 'students' && (
            <div className="p-6">
              <div className="space-y-3">
                {data.studentsProgress.map(student => (
                  <div
                    key={student.id}
                    className={`p-4 rounded-lg border ${getScoreColor(student.averageScore)}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">{student.name}</p>
                        <p className="text-xs text-gray-600">
                          Enrolled: {new Date(student.enrolledDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{getScoreIndicator(student.averageScore)}</p>
                        <p className="text-2xl font-bold">{student.averageScore}%</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-xs text-gray-600">Submission Rate</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-current"
                              style={{ width: `${student.submissionRate}%` }}
                            />
                          </div>
                          <p className="font-semibold w-12 text-right">{student.submissionRate}%</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-gray-600">Last Active</p>
                        <p className="font-semibold mt-1">
                          {new Date(student.lastActivityDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trends Tab */}
          {activeTab === 'trends' && (
            <div className="p-6 space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Class Performance Trend</h3>
                <div className="space-y-4">
                  {[
                    { week: 'Week 1', score: 75 },
                    { week: 'Week 2', score: 78 },
                    { week: 'Week 3', score: 81 },
                    { week: 'Week 4', score: 82 },
                  ].map(item => (
                    <div key={item.week}>
                      <div className="flex justify-between mb-1">
                        <p className="text-sm font-medium text-gray-700">{item.week}</p>
                        <p className="text-sm font-bold text-gray-900">{item.score}%</p>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
                          style={{ width: `${item.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-green-600 font-medium mt-4">
                  ↑ +7% improvement over past 4 weeks
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Engagement Insights</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>✓ 92% of students submitting on time (above average)</li>
                  <li>✓ 3 students showing strong improvement trend</li>
                  <li>⚠ 2 students need additional support</li>
                  <li>✓ Course completion pace on track for {new Date().toLocaleDateString()}</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
