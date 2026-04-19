'use client';

import { useState, useEffect } from 'react';
import { Plus, Loader } from 'lucide-react';
import { CourseEditor } from '@/components/CourseEditor';
import { useLessons, useCourseContentMutations } from '@/hooks/useCourseContent';
import { useNotifications } from '@/context/NotificationContext';
import { createNotification } from '@/types/notification';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

const DEFAULT_COURSE_ID = 'course-1'; // In production, this would be from URL params

export default function CourseEditorPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { lessons, isLoading: isLoadingLessons } = useLessons(DEFAULT_COURSE_ID);
  const { createLesson, isLoading: isCreatingLesson } = useCourseContentMutations();
  const { addNotification } = useNotifications();

  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showNewLessonForm, setShowNewLessonForm] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Only render after client-side hydration
  if (!mounted) {
    return null;
  }

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-dark-900">
        <Loader className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (!user) {
    router.push('/auth/login');
    return null;
  }

  // Set initial lesson
  if (selectedLessonId === null && lessons.length > 0) {
    setSelectedLessonId(lessons[0].id);
  }

  const handleCreateLesson = async () => {
    if (!newLessonTitle.trim()) {
      addNotification(
        createNotification('Title Required', 'Please enter a lesson title', 'error', { priority: 'high' })
      );
      return;
    }

    try {
      const newLesson = await createLesson(DEFAULT_COURSE_ID, {
        title: newLessonTitle,
        description: '',
        difficulty: 'beginner',
        estimatedDuration: 30,
      });

      setSelectedLessonId(newLesson.id);
      setNewLessonTitle('');
      setShowNewLessonForm(false);

      addNotification(
        createNotification('Lesson Created', 'New lesson added successfully', 'success', {
          priority: 'low',
          duration: 3000,
        })
      );
    } catch (err) {
      addNotification(
        createNotification('Creation Failed', 'Could not create lesson', 'error', { priority: 'high' })
      );
    }
  };

  return (
    <div className="flex h-screen bg-dark-900">
      {/* Sidebar */}
      <div className="w-64 bg-dark-800 border-r border-dark-700 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-dark-700">
          <h2 className="text-lg font-bold text-white">Course Content</h2>
          <p className="text-xs text-gray-500 mt-1">Personal Finance Fundamentals</p>
        </div>

        {/* Lessons List */}
        <div className="flex-1 overflow-y-auto">
          {isLoadingLessons ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="w-5 h-5 text-gray-400 animate-spin" />
            </div>
          ) : lessons.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">No lessons yet</div>
          ) : (
            <div className="space-y-2 p-4">
              {lessons.map((lesson) => (
                <button
                  key={lesson.id}
                  onClick={() => setSelectedLessonId(lesson.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition text-sm ${
                    selectedLessonId === lesson.id
                      ? 'bg-primary-500 text-white'
                      : 'text-gray-400 hover:bg-dark-700'
                  }`}
                >
                  <div className="font-medium truncate">{lesson.title}</div>
                  <div className="text-xs mt-0.5 opacity-75">
                    {lesson.estimatedDuration} min • {lesson.published ? '✓ Published' : 'Draft'}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Create Lesson Button */}
        <div className="p-4 border-t border-dark-700">
          {!showNewLessonForm ? (
            <button
              onClick={() => setShowNewLessonForm(true)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              New Lesson
            </button>
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                value={newLessonTitle}
                onChange={(e) => setNewLessonTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateLesson();
                  if (e.key === 'Escape') setShowNewLessonForm(false);
                }}
                placeholder="Lesson title..."
                autoFocus
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCreateLesson}
                  disabled={isCreatingLesson}
                  className="flex-1 px-2 py-1 bg-primary-500 text-white rounded text-sm hover:bg-primary-600 transition disabled:opacity-50"
                >
                  {isCreatingLesson ? 'Creating...' : 'Create'}
                </button>
                <button
                  onClick={() => setShowNewLessonForm(false)}
                  className="flex-1 px-2 py-1 bg-dark-700 text-white rounded text-sm hover:bg-dark-600 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 overflow-hidden">
        {selectedLessonId ? (
          <CourseEditor courseId={DEFAULT_COURSE_ID} lessonId={selectedLessonId} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Select a lesson to begin editing</p>
          </div>
        )}
      </div>
    </div>
  );
}
