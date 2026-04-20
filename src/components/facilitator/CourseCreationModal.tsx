import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save } from 'lucide-react';

interface CourseLesson {
  id: string;
  title: string;
  description: string;
  order: number;
  dueDate?: string;
}

interface CourseCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateCourse: (courseData: CourseData) => Promise<void>;
  existingCourse?: any;
  isEditing?: boolean;
}

interface CourseData {
  title: string;
  description: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  capacity: number;
  lessons: CourseLesson[];
}

export const CourseCreationModal: React.FC<CourseCreationModalProps> = ({
  isOpen,
  onClose,
  onCreateCourse,
  existingCourse,
  isEditing = false,
}) => {
  const [courseData, setCourseData] = useState<CourseData>({
    title: existingCourse?.title || '',
    description: existingCourse?.description || '',
    category: existingCourse?.category || 'general',
    level: existingCourse?.level || 'beginner',
    capacity: existingCourse?.capacity || 30,
    lessons: existingCourse?.lessons || [],
  });

  const [newLesson, setNewLesson] = useState({ title: '', description: '', dueDate: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddLesson = () => {
    if (!newLesson.title.trim()) {
      setError('Lesson title is required');
      return;
    }

    const lesson: CourseLesson = {
      id: Date.now().toString(),
      title: newLesson.title,
      description: newLesson.description,
      order: courseData.lessons.length + 1,
      dueDate: newLesson.dueDate,
    };

    setCourseData(prev => ({
      ...prev,
      lessons: [...prev.lessons, lesson],
    }));

    setNewLesson({ title: '', description: '', dueDate: '' });
    setError('');
  };

  const handleRemoveLesson = (id: string) => {
    setCourseData(prev => ({
      ...prev,
      lessons: prev.lessons.filter(l => l.id !== id),
    }));
  };

  const handleCreateCourse = async () => {
    if (!courseData.title.trim()) {
      setError('Course title is required');
      return;
    }

    if (courseData.lessons.length === 0) {
      setError('Add at least one lesson');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onCreateCourse(courseData);
      setCourseData({
        title: '',
        description: '',
        category: 'general',
        level: 'beginner',
        capacity: 30,
        lessons: [],
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Course' : 'Create New Course'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {error}
            </div>
          )}

          {/* Course Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Course Details</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Title *
              </label>
              <input
                type="text"
                value={courseData.title}
                onChange={(e) =>
                  setCourseData(prev => ({ ...prev, title: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Advanced Mathematics"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={courseData.description}
                onChange={(e) =>
                  setCourseData(prev => ({ ...prev, description: e.target.value }))
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe your course..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={courseData.category}
                  onChange={(e) =>
                    setCourseData(prev => ({ ...prev, category: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="general">General</option>
                  <option value="math">Mathematics</option>
                  <option value="science">Science</option>
                  <option value="language">Language Arts</option>
                  <option value="social">Social Studies</option>
                  <option value="art">Arts</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Level
                </label>
                <select
                  value={courseData.level}
                  onChange={(e) =>
                    setCourseData(prev => ({
                      ...prev,
                      level: e.target.value as 'beginner' | 'intermediate' | 'advanced',
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student Capacity
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={courseData.capacity}
                onChange={(e) =>
                  setCourseData(prev => ({ ...prev, capacity: parseInt(e.target.value) }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Lessons */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Course Lessons *</h3>

            {/* Lessons List */}
            {courseData.lessons.length > 0 && (
              <div className="space-y-2">
                {courseData.lessons.map((lesson, idx) => (
                  <div key={lesson.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        Lesson {idx + 1}: {lesson.title}
                      </div>
                      {lesson.description && (
                        <div className="text-sm text-gray-600 mt-1">{lesson.description}</div>
                      )}
                      {lesson.dueDate && (
                        <div className="text-xs text-gray-500 mt-1">Due: {lesson.dueDate}</div>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveLesson(lesson.id)}
                      className="text-red-600 hover:text-red-700 ml-2 flex-shrink-0"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Lesson Form */}
            <div className="border-t pt-4 space-y-3">
              <input
                type="text"
                value={newLesson.title}
                onChange={(e) => setNewLesson(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Lesson title (e.g., Quadratic Equations)"
              />
              <textarea
                value={newLesson.description}
                onChange={(e) => setNewLesson(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Lesson description..."
              />
              <input
                type="date"
                value={newLesson.dueDate}
                onChange={(e) => setNewLesson(prev => ({ ...prev, dueDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button
                onClick={handleAddLesson}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg transition-colors"
              >
                <Plus size={18} />
                Add Lesson
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateCourse}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 rounded-lg transition-colors"
          >
            <Save size={18} />
            {loading ? 'Creating...' : isEditing ? 'Update Course' : 'Create Course'}
          </button>
        </div>
      </div>
    </div>
  );
};
