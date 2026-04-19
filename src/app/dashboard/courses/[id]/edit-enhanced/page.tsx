'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  BookOpen,
  Users,
  BarChart3,
  Send,
  Check,
  AlertCircle,
  Edit2,
  Eye,
  EyeOff,
  Trash2,
  Plus,
  Upload,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { getCourseEnrollments, getStudentProgress } from '@/lib/enrollmentManager';
import { adminNotifications } from '@/lib/adminNotifications';
import type { CourseEnrollment, StudentProgress } from '@/types/enrollment';

export default function CourseEditorPage() {
  const params = useParams();
  const courseId = (params?.id as string) || 'course-1';

  // Course state
  const [course, setCourse] = useState({
    id: courseId,
    title: 'Introduction to Web Development',
    description: 'Learn the fundamentals of web development including HTML, CSS, and JavaScript.',
    category: 'Technology',
    difficulty: 'Beginner',
    duration: '8 weeks',
    isPublished: true,
    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400',
  });

  // Enrollment state
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [studentProgress, setStudentProgress] = useState<Map<string, StudentProgress>>(new Map());
  const [loading, setLoading] = useState(true);

  // Tab state
  const [activeTab, setActiveTab] = useState<'content' | 'students' | 'analytics'>('content');

  // Edit state
  const [editingField, setEditingField] = useState<string | null>(null);

  // Notification state
  const [notification, setNotification] = useState({
    message: '',
    recipients: 'all' as 'all' | 'active' | 'completed',
    type: 'announcement' as 'announcement' | 'reminder' | 'alert',
  });

  // Load enrollment data on mount
  useEffect(() => {
    const loadEnrollments = async () => {
      try {
        setLoading(true);
        // Get all enrollments for this course
        const enrollmentsData = await getCourseEnrollments(courseId);
        setEnrollments(enrollmentsData);

        // Get progress for each student
        const progressMap = new Map<string, StudentProgress>();
        for (const enrollment of enrollmentsData) {
          const progress = await getStudentProgress(courseId, enrollment.userId);
          progressMap.set(enrollment.userId, progress);
        }
        setStudentProgress(progressMap);
      } catch (error) {
        console.error('Failed to load enrollments:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEnrollments();
  }, [courseId]);

  const handlePublishCourse = () => {
    setCourse(prev => ({ ...prev, isPublished: !prev.isPublished }));
    
    // Notify admin
    if (!course.isPublished) {
      adminNotifications.notifyCoursPublished({
        courseId: course.id,
        courseTitle: course.title,
        publishedAt: new Date(),
        enrollmentCount: enrollments.length,
      });
    }
  };

  const handleSendNotification = () => {
    if (!notification.message.trim()) {
      alert('Please enter a message');
      return;
    }

    // Filter recipients
    const recipients = enrollments.filter(e => {
      if (notification.recipients === 'all') return true;
      if (notification.recipients === 'active') return e.status === 'active';
      if (notification.recipients === 'completed') return e.status === 'completed';
      return false;
    });

    // Notify students
    recipients.forEach(enrollment => {
      adminNotifications.notifyStudentMessage({
        studentId: enrollment.userId,
        studentName: enrollment.studentName,
        courseId: course.id,
        courseTitle: course.title,
        message: notification.message,
        messageType: notification.type,
        sentAt: new Date(),
      });
    });

    // Show confirmation
    setNotification({ message: '', recipients: 'all', type: 'announcement' });
    alert(`Notification sent to ${recipients.length} student(s)`);
  };

  const calculateCourseStats = () => {
    if (enrollments.length === 0) return { avgProgress: 0, completionRate: 0, activeCount: 0 };

    const avgProgress =
      enrollments.reduce((sum, e) => {
        const progress = studentProgress.get(e.userId);
        return sum + (progress?.progressPercentage || 0);
      }, 0) / enrollments.length;

    const completionRate =
      (enrollments.filter(e => e.status === 'completed').length / enrollments.length) * 100;

    const activeCount = enrollments.filter(e => e.status === 'active').length;

    return {
      avgProgress: Math.round(avgProgress),
      completionRate: Math.round(completionRate),
      activeCount,
    };
  };

  const stats = calculateCourseStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-500 rounded-xl p-6 text-white">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
            <p className="text-white/80">{course.description}</p>
            <div className="flex items-center gap-4 mt-4">
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-semibold">
                {course.category}
              </span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-semibold">
                {course.difficulty}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  course.isPublished
                    ? 'bg-green-400/30 text-green-200'
                    : 'bg-gray-600/30 text-gray-200'
                }`}
              >
                {course.isPublished ? '✓ Published' : 'Draft'}
              </span>
            </div>
          </div>
          <Button
            onClick={handlePublishCourse}
            variant={course.isPublished ? 'secondary' : 'primary'}
            className="whitespace-nowrap"
          >
            {course.isPublished ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {course.isPublished ? 'Unpublish' : 'Publish'}
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-600/20 to-blue-400/10 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-300 text-sm font-semibold mb-1">Total Enrollments</p>
              <p className="text-3xl font-bold text-white">{enrollments.length}</p>
            </div>
            <Users className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-600/20 to-green-400/10 border border-green-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-300 text-sm font-semibold mb-1">Avg Progress</p>
              <p className="text-3xl font-bold text-white">{stats.avgProgress}%</p>
            </div>
            <BarChart3 className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-600/20 to-purple-400/10 border border-purple-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-300 text-sm font-semibold mb-1">Currently Active</p>
              <p className="text-3xl font-bold text-white">{stats.activeCount}</p>
            </div>
            <BookOpen className="w-8 h-8 text-purple-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-600/20 to-amber-400/10 border border-amber-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-300 text-sm font-semibold mb-1">Completion Rate</p>
              <p className="text-3xl font-bold text-white">{stats.completionRate}%</p>
            </div>
            <Check className="w-8 h-8 text-amber-400" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-700">
        <div className="flex gap-0">
          {(['content', 'students', 'analytics'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-semibold capitalize border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-primary-500 text-primary-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              {tab === 'students' ? `Students (${enrollments.length})` : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content Tab */}
      {activeTab === 'content' && (
        <div className="space-y-6 bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Edit2 className="w-5 h-5" />
            Course Content
          </h2>

          {/* Title */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-300">Course Title</label>
            {editingField === 'title' ? (
              <div className="flex gap-2">
                <Input
                  value={course.title}
                  onChange={e => setCourse(prev => ({ ...prev, title: e.target.value }))}
                  className="flex-1"
                />
                <Button
                  onClick={() => setEditingField(null)}
                  size="sm"
                  variant="primary"
                >
                  Save
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 justify-between p-3 bg-gray-800 rounded">
                <span className="text-white">{course.title}</span>
                <button onClick={() => setEditingField('title')} className="text-primary-400 hover:text-primary-300">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-300">Description</label>
            {editingField === 'description' ? (
              <div className="flex flex-col gap-2">
                <Textarea
                  value={course.description}
                  onChange={e => setCourse(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                />
                <Button
                  onClick={() => setEditingField(null)}
                  size="sm"
                  variant="primary"
                  className="w-fit"
                >
                  Save
                </Button>
              </div>
            ) : (
              <div className="flex items-start gap-2 justify-between p-3 bg-gray-800 rounded">
                <span className="text-gray-300 text-sm">{course.description}</span>
                <button
                  onClick={() => setEditingField('description')}
                  className="text-primary-400 hover:text-primary-300 flex-shrink-0"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Category & Difficulty */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Category</label>
              <Input value={course.category} onChange={e => setCourse(prev => ({ ...prev, category: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Difficulty</label>
              <select
                value={course.difficulty}
                onChange={e => setCourse(prev => ({ ...prev, difficulty: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>
          </div>

          {/* Lessons Section */}
          <div className="border-t border-gray-700 pt-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Course Lessons
            </h3>
            <div className="space-y-3">
              {[
                { id: 'l1', title: 'Getting Started with HTML', order: 1 },
                { id: 'l2', title: 'CSS Fundamentals', order: 2 },
                { id: 'l3', title: 'JavaScript Basics', order: 3 },
                { id: 'l4', title: 'DOM Manipulation', order: 4 },
              ].map(lesson => (
                <div
                  key={lesson.id}
                  className="flex items-center justify-between p-3 bg-gray-800 rounded border border-gray-700 hover:border-primary-500/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 flex items-center justify-center bg-primary-500/20 rounded font-bold text-primary-400">
                      {lesson.order}
                    </span>
                    <span className="text-white">{lesson.title}</span>
                  </div>
                  <button className="text-danger-400 hover:text-danger-300">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <Button variant="secondary" className="mt-4 w-full justify-center">
              <Plus className="w-4 h-4 mr-2" />
              Add Lesson
            </Button>
          </div>
        </div>
      )}

      {/* Students Tab */}
      {activeTab === 'students' && (
        <div className="space-y-6">
          {/* Send Notification Section */}
          <div className="bg-gradient-to-br from-primary-900/30 to-secondary-900/30 border border-primary-500/30 rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Send className="w-5 h-5" />
              Send Message to Students
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Message Type</label>
                  <select
                    value={notification.type}
                    onChange={e => setNotification(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                  >
                    <option value="announcement">Announcement</option>
                    <option value="reminder">Reminder</option>
                    <option value="alert">Alert</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Send To</label>
                  <select
                    value={notification.recipients}
                    onChange={e => setNotification(prev => ({ ...prev, recipients: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                  >
                    <option value="all">All Enrolled Students</option>
                    <option value="active">Active Students Only</option>
                    <option value="completed">Completed Students Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Message</label>
                <Textarea
                  value={notification.message}
                  onChange={e => setNotification(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Type your message to students..."
                  rows={4}
                />
              </div>

              <Button onClick={handleSendNotification} variant="primary" className="w-full justify-center">
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </div>
          </div>

          {/* Students List */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-bold text-white mb-4">Enrolled Students</h3>

            {loading ? (
              <div className="text-center py-8 text-gray-400">Loading student data...</div>
            ) : enrollments.length === 0 ? (
              <div className="text-center py-8 text-gray-400">No students enrolled yet</div>
            ) : (
              <div className="space-y-3">
                {enrollments.map(enrollment => {
                  const progress = studentProgress.get(enrollment.userId);
                  const statusColors = {
                    active: 'bg-green-500/20 text-green-300 border-green-500/30',
                    completed: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
                    dropped: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
                    paused: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
                  };

                  return (
                    <div
                      key={enrollment.id}
                      className="p-4 bg-gray-800 rounded border border-gray-700 hover:border-primary-500/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold">
                              {enrollment.studentName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-white">{enrollment.studentName}</p>
                              <p className="text-xs text-gray-400">{enrollment.userId}</p>
                            </div>
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border capitalize ${
                              statusColors[enrollment.status]
                            }`}
                          >
                            {enrollment.status}
                          </span>
                        </div>
                      </div>

                      {progress && (
                        <div className="mt-3 space-y-2">
                          {/* Progress Bar */}
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-300"
                                  style={{ width: `${progress.progressPercentage}%` }}
                                />
                              </div>
                            </div>
                            <span className="text-sm font-semibold text-primary-400 whitespace-nowrap">
                              {progress.progressPercentage}%
                            </span>
                          </div>

                          {/* Progress Details */}
                          <div className="grid grid-cols-3 gap-2 text-xs text-gray-400">
                            <div>
                              <p className="text-gray-500">Lessons</p>
                              <p className="text-white font-semibold">
                                {progress.completedLessons}/{progress.totalLessons}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">Time Spent</p>
                              <p className="text-white font-semibold">{progress.timeSpent}h</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Last Active</p>
                              <p className="text-white font-semibold">{progress.lastAccessed}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h3 className="text-lg font-bold text-white mb-6">Course Analytics</h3>

          <div className="grid grid-cols-2 gap-6">
            {/* Status Distribution */}
            <div>
              <h4 className="font-semibold text-gray-300 mb-4">Enrollment Status</h4>
              <div className="space-y-3">
                {[
                  { status: 'Active', count: stats.activeCount, color: 'bg-green-500' },
                  {
                    status: 'Completed',
                    count: enrollments.filter(e => e.status === 'completed').length,
                    color: 'bg-blue-500',
                  },
                  {
                    status: 'Dropped',
                    count: enrollments.filter(e => e.status === 'dropped').length,
                    color: 'bg-red-500',
                  },
                  {
                    status: 'Paused',
                    count: enrollments.filter(e => e.status === 'paused').length,
                    color: 'bg-yellow-500',
                  },
                ].map(item => (
                  <div key={item.status}>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-300 text-sm">{item.status}</span>
                      <span className="text-white font-bold">{item.count}</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color}`}
                        style={{ width: `${(item.count / enrollments.length) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress Summary */}
            <div>
              <h4 className="font-semibold text-gray-300 mb-4">Progress Summary</h4>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm mb-2">Average Student Progress</p>
                  <div className="text-3xl font-bold text-primary-400">{stats.avgProgress}%</div>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-2">Course Completion Rate</p>
                  <div className="text-3xl font-bold text-green-400">{stats.completionRate}%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Distribution Chart */}
          <div className="mt-8 pt-8 border-t border-gray-700">
            <h4 className="font-semibold text-gray-300 mb-4">Progress Distribution</h4>
            <div className="space-y-2">
              {[
                { range: '0-20%', count: enrollments.filter(e => {
                  const p = studentProgress.get(e.userId);
                  return p && p.progressPercentage < 20;
                }).length },
                { range: '20-40%', count: enrollments.filter(e => {
                  const p = studentProgress.get(e.userId);
                  return p && p.progressPercentage >= 20 && p.progressPercentage < 40;
                }).length },
                { range: '40-60%', count: enrollments.filter(e => {
                  const p = studentProgress.get(e.userId);
                  return p && p.progressPercentage >= 40 && p.progressPercentage < 60;
                }).length },
                { range: '60-80%', count: enrollments.filter(e => {
                  const p = studentProgress.get(e.userId);
                  return p && p.progressPercentage >= 60 && p.progressPercentage < 80;
                }).length },
                { range: '80-100%', count: enrollments.filter(e => {
                  const p = studentProgress.get(e.userId);
                  return p && p.progressPercentage >= 80;
                }).length },
              ].map(item => (
                <div key={item.range}>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-300 text-sm">{item.range}</span>
                    <span className="text-white font-bold">{item.count}</span>
                  </div>
                  <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-500 to-secondary-500"
                      style={{ width: `${(item.count / enrollments.length) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
