/**
 * Lesson Progress Component - Real Lesson Video Player Integration
 * 
 * Shows how to integrate progress tracking into a real video player component
 * with realistic user scenarios (pause, resume, rewatch, etc.)
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  LessonProgressTracker,
  lessonProgressAPI,
  ProgressDashboard,
} from '@/lib/lesson-progress-client';

interface LessonProgressPlayerProps {
  lessonId: string;
  enrollmentId: string;
  videoUrl: string;
  duration: number; // in minutes
  title: string;
  courseTitle: string;
}

/**
 * Real component showing progress integration
 */
export function LessonProgressPlayer({
  lessonId,
  enrollmentId,
  videoUrl,
  duration,
  title,
  courseTitle,
}: LessonProgressPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const trackerRef = useRef<LessonProgressTracker | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ========================================
  // Initialize tracker on mount
  // ========================================
  useEffect(() => {
    // Create and start tracker
    trackerRef.current = new LessonProgressTracker(lessonId, enrollmentId);
    trackerRef.current.start();

    // Load previous progress
    loadPreviousProgress();

    return () => {
      // Cleanup tracker
      trackerRef.current?.stop();
    };
  }, [lessonId, enrollmentId]);

  // ========================================
  // Track video playback
  // ========================================
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      const percentage = Math.round((video.currentTime / video.duration) * 100);
      setCompletionPercentage(percentage);
      
      // Track progress (debounced in tracker)
      trackerRef.current?.trackProgress(video.currentTime);
    };

    const handlePlay = () => {
      setIsPlaying(true);
      console.log('▶️  Video playing');
    };

    const handlePause = () => {
      setIsPlaying(false);
      console.log('⏸️  Video paused');
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setIsCompleted(true);
      console.log('✅ Video completed');
      // Track as complete
      trackerRef.current?.trackProgress(video.duration, true);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  // ========================================
  // Load previous progress
  // ========================================
  const loadPreviousProgress = async () => {
    try {
      const progress = await lessonProgressAPI.getLessonProgress(
        lessonId,
        enrollmentId
      );

      if (progress && videoRef.current) {
        // Resume where left off
        const resumeTime = progress.secondsWatched;
        videoRef.current.currentTime = resumeTime;
        setCurrentTime(resumeTime);
        setCompletionPercentage(progress.completionPercentage);
        setIsCompleted(progress.isCompleted);

        console.log(
          `📺 Resumed from ${progress.secondsWatched}s (${progress.completionPercentage}%)`
        );
      }
    } catch (error) {
      console.error('Failed to load previous progress:', error);
    }
  };

  // ========================================
  // Manual completion (if user wants to skip)
  // ========================================
  const handleCompleteLesson = async () => {
    setIsLoading(true);
    try {
      await lessonProgressAPI.completeLessonProgress(lessonId, enrollmentId);
      setIsCompleted(true);
      setCompletionPercentage(100);
      console.log('✅ Lesson marked as complete');
    } catch (error) {
      console.error('Failed to complete lesson:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ========================================
  // Skip forward/backward (watching patterns)
  // ========================================
  const skip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(
        0,
        Math.min(videoRef.current.duration, videoRef.current.currentTime + seconds)
      );
    }
  };

  // ========================================
  // Format time display
  // ========================================
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs
        .toString()
        .padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // ========================================
  // Render component
  // ========================================
  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="mb-4">
        <p className="text-sm text-gray-500 mb-1">{courseTitle}</p>
        <h1 className="text-2xl font-bold mb-2">{title}</h1>
        {isCompleted && (
          <div className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
            ✅ Completed
          </div>
        )}
      </div>

      {/* Video Player */}
      <div className="bg-black rounded-lg overflow-hidden mb-4 aspect-video flex items-center justify-center">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full"
          controls
          controlsList="nodownload"
        >
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium">Progress</span>
          <span className="text-sm font-medium">{completionPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              isCompleted
                ? 'bg-green-500'
                : completionPercentage > 50
                  ? 'bg-blue-500'
                  : 'bg-orange-500'
            }`}
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Time Display */}
      <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
        <span>
          {formatTime(currentTime)} / {formatTime(duration * 60)}
        </span>
        <span>
          {Math.round((currentTime / (duration * 60)) * 100)}% watched
        </span>
      </div>

      {/* Controls */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => skip(-10)}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm font-medium"
        >
          ⏪ -10s
        </button>
        <button
          onClick={() => skip(10)}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm font-medium"
        >
          ⏩ +10s
        </button>
        {!isCompleted && completionPercentage > 0 && (
          <button
            onClick={handleCompleteLesson}
            disabled={isLoading}
            className="ml-auto px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm font-medium disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Mark as Complete'}
          </button>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
        <p className="text-gray-700">
          💡 Your progress is automatically saved as you watch. You can resume
          from where you left off at any time.
        </p>
        {isCompleted && (
          <p className="text-green-700 mt-2 font-medium">
            ✅ Great job! You've completed this lesson.
          </p>
        )}
      </div>
    </div>
  );
}

// ========================================
// Progress Dashboard Component
// ========================================

export function ProgressDashboardView() {
  const [coursesList, setCoursesList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const dashboard = new ProgressDashboard();
      const courses = await dashboard.getCoursesList();
      setCoursesList(courses);
    } catch (error) {
      console.error('Failed to load courses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Loading your courses...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-2">Learning Progress</h1>
      <p className="text-gray-600 mb-6">
        Track your progress across all courses
      </p>

      <div className="grid gap-4">
        {coursesList.map((course) => (
          <div
            key={course.enrollmentId}
            className="border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() =>
              setSelectedCourse(
                selectedCourse === course.enrollmentId ? null : course.enrollmentId
              )
            }
          >
            {/* Course Header */}
            <div className="flex justify-between items-start mb-3">
              <div>
                <h2 className="text-xl font-bold">{course.courseTitle}</h2>
                <p className="text-sm text-gray-600">
                  Enrolled {course.lastAccessedDisplay}
                </p>
              </div>
              <span className="text-2xl font-bold text-blue-600">
                {course.completionPercentageDisplay}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    course.completionPercentage === 100
                      ? 'bg-green-500'
                      : 'bg-blue-500'
                  }`}
                  style={{ width: `${course.completionPercentage}%` }}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-6 text-sm text-gray-600">
              <div>
                <p className="font-medium text-gray-900">
                  {course.lessonsCompleted}/{course.totalLessons}
                </p>
                <p className="text-xs">Lessons</p>
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {course.estimatedHoursRemaining}h
                </p>
                <p className="text-xs">Est. Remaining</p>
              </div>
              <div className="ml-auto">
                <p className="text-xs text-blue-600 font-medium">
                  {selectedCourse === course.enrollmentId ? '▼ ' : '▶ '}
                  Details
                </p>
              </div>
            </div>

            {/* Expanded Details */}
            {selectedCourse === course.enrollmentId && (
              <CourseDetailsExpanded enrollmentId={course.enrollmentId} />
            )}
          </div>
        ))}
      </div>

      {coursesList.length === 0 && (
        <div className="text-center py-12 text-gray-600">
          <p>No courses yet. Start learning today!</p>
        </div>
      )}
    </div>
  );
}

function CourseDetailsExpanded({ enrollmentId }: { enrollmentId: string }) {
  const [lessons, setLessons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLessons();
  }, [enrollmentId]);

  const loadLessons = async () => {
    try {
      const dashboard = new ProgressDashboard();
      const details = await dashboard.getCourseDetails(enrollmentId);
      setLessons(details.lessons);
    } catch (error) {
      console.error('Failed to load lessons:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <p className="text-sm text-gray-600 mt-3">Loading lessons...</p>;
  }

  return (
    <div className="mt-4 pt-4 border-t">
      <div className="space-y-2">
        {lessons.map((lesson, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <div className="flex-1">
              <p className="font-medium">{lesson.title}</p>
              <p className="text-xs text-gray-600">
                {lesson.completionDisplay} • {lesson.timeSpentDisplay}
              </p>
            </div>
            <span className="text-lg">{lesson.statusBadge}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LessonProgressPlayer;
