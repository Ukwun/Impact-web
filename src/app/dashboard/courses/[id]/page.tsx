'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { BookOpen, Clock, Award, ChevronRight, Play, AlertCircle, Loader, Download, Users, BarChart3, ArrowLeft, CheckCircle2, PlayCircle, FileText, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { AUTH_TOKEN_KEY } from '@/lib/authStorage';

interface Material {
  id: string;
  title: string;
  type: 'video' | 'pdf' | 'document';
  url: string;
  fileSize: number | null;
}

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string | null;
  duration: number;
  order: number;
  materials: Material[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  duration: number;
  language: string;
  instructor: string;
  isPublished: boolean;
  lessons: Lesson[];
  enrollmentCount: number;
  isEnrolled?: boolean;
}

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.id as string;
  const { success, error: errorToast } = useToast();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    loadCourseDetails();
  }, [courseId]);

  const loadCourseDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(AUTH_TOKEN_KEY)}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to load course');
      }

      const data = await response.json();
      setCourse(data.data);
      setIsEnrolled(data.data.isEnrolled || false);

      // Auto-select first lesson
      if (data.data.lessons && data.data.lessons.length > 0) {
        const firstLesson = data.data.lessons[0];
        setSelectedLesson(firstLesson);
      }
    } catch (err) {
      errorToast('Error', err instanceof Error ? err.message : 'Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      const response = await fetch(`/api/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem(AUTH_TOKEN_KEY)}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to enroll in course');
      }

      setIsEnrolled(true);
      success('Enrolled!', `You are now enrolled in ${course?.title}`);
      loadCourseDetails();
    } catch (err) {
      errorToast('Error', err instanceof Error ? err.message : 'Failed to enroll');
    } finally {
      setEnrolling(false);
    }
  };

  const formatFileSize = (bytes: number | null): string => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <PlayCircle className="w-4 h-4" />;
      case 'pdf':
      case 'document':
        return <FileText className="w-4 h-4" />;
      default:
        return <Download className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-2" />
          <p className="text-gray-400">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-400">Course not found</p>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-dark-900/80 backdrop-blur-sm border-b border-dark-600 py-4">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-white flex-1 text-center line-clamp-2">{course.title}</h1>
          {!isEnrolled && (
            <Button
              onClick={handleEnroll}
              disabled={enrolling}
              className="gap-2 shrink-0"
            >
              {enrolling ? <Loader className="w-4 h-4 animate-spin" /> : 'Enroll Now'}
            </Button>
          )}
          {isEnrolled && (
            <div className="flex items-center gap-2 text-green-400 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-semibold">Enrolled</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Course Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Course Overview */}
            <Card className="p-6 mb-8">
              <h2 className="text-xl font-bold text-white mb-4">Course Overview</h2>
              <div className="flex gap-4 flex-wrap mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <BarChart3 className="w-4 h-4" />
                  {course.difficulty}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Clock className="w-4 h-4" />
                  {course.duration} minutes
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Users className="w-4 h-4" />
                  {course.enrollmentCount} enrolled
                </div>
              </div>
              <p className="text-gray-300 mb-4">{course.description}</p>
              <div className="text-sm text-gray-400 space-y-1">
                <p><span className="text-gray-500">Instructor:</span> {course.instructor}</p>
                <p><span className="text-gray-500">Language:</span> {course.language}</p>
              </div>
            </Card>

            {/* Video Player / Lesson Content */}
            {selectedLesson && isEnrolled && (
              <Card className="p-6 mb-8">
                {selectedLesson.videoUrl ? (
                  <div className="mb-6">
                    <div className="aspect-video bg-dark-700 rounded-lg overflow-hidden">
                      <video
                        src={selectedLesson.videoUrl}
                        controls
                        className="w-full h-full"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video bg-dark-700 rounded-lg overflow-hidden flex items-center justify-center mb-6">
                    <div className="text-center">
                      <PlayCircle className="w-16 h-16 text-gray-600 mx-auto mb-2" />
                      <p className="text-gray-400">No video available</p>
                    </div>
                  </div>
                )}

                <h3 className="text-lg font-bold text-white mb-2">{selectedLesson.title}</h3>
                {selectedLesson.description && (
                  <p className="text-gray-300">{selectedLesson.description}</p>
                )}
              </Card>
            )}

            {!isEnrolled && (
              <Card className="p-12 text-center">
                <Lock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Course Locked</h3>
                <p className="text-gray-400 mb-6">Enroll to view lessons and materials</p>
                <Button onClick={handleEnroll} disabled={enrolling} className="gap-2">
                  {enrolling ? <Loader className="w-4 h-4 animate-spin" /> : 'Enroll Now'}
                </Button>
              </Card>
            )}
          </div>

          {/* Sidebar - Lessons & Materials */}
          <div>
            <Card className="p-6 sticky top-20">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Materials ({course.lessons.length})
              </h3>

              <div className="space-y-3">
                {course.lessons.map((lesson, index) => (
                  <button
                    key={lesson.id}
                    onClick={() => isEnrolled && setSelectedLesson(lesson)}
                    disabled={!isEnrolled}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      selectedLesson?.id === lesson.id
                        ? 'bg-primary-500/20 border-l-2 border-primary-500'
                        : 'bg-dark-700 hover:bg-dark-600'
                    } ${!isEnrolled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="font-semibold text-white text-sm flex items-center gap-2">
                      {!isEnrolled && <Lock className="w-3 h-3" />}
                      {index + 1}. {lesson.title}
                    </div>
                    {lesson.materials.length > 0 && isEnrolled && (
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {lesson.materials.map((mat) => (
                          <div
                            key={mat.id}
                            className="inline-flex items-center gap-1 text-xs bg-dark-800 px-2 py-1 rounded"
                            title={mat.title}
                          >
                            {getMaterialIcon(mat.type)}
                            <span className="capitalize text-gray-300">{mat.type}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Materials Download Section */}
        {isEnrolled && selectedLesson && selectedLesson.materials.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-bold text-white mb-4">📚 Downloadable Materials</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {selectedLesson.materials.map((material) => (
                <a
                  key={material.id}
                  href={material.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors"
                >
                  <div className="text-primary-400">{getMaterialIcon(material.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{material.title}</p>
                    <p className="text-xs text-gray-400">{formatFileSize(material.fileSize)}</p>
                  </div>
                  <Download className="w-4 h-4 text-gray-400 flex-shrink-0" />
                </a>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
