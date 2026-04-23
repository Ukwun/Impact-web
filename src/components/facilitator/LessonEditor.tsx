'use client';

import { useState } from 'react';
import { Plus, Loader2, AlertCircle, X, Video, BookOpen, Users } from 'lucide-react';
import { AUTH_TOKEN_KEY } from '@/lib/authStorage';

interface LessonEditorProps {
  classroomId: string;
  moduleId: string;
  moduleName: string;
  lessonsByLayer?: any;
  onLessonCreated: () => void;
  isLoading?: boolean;
}

const LEARNING_LAYERS = [
  {
    id: 'LEARN',
    name: 'LEARN - Understand',
    description: 'Videos, lectures, and reading materials',
    icon: '📚',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    accentColor: 'text-blue-700',
    buttonColor: 'bg-blue-600 hover:bg-blue-700',
  },
  {
    id: 'APPLY',
    name: 'APPLY - Practice',
    description: 'Tasks, worksheets, and hands-on exercises',
    icon: '✏️',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    accentColor: 'text-purple-700',
    buttonColor: 'bg-purple-600 hover:bg-purple-700',
  },
  {
    id: 'ENGAGE_LIVE',
    name: 'ENGAGE LIVE - Collaborate',
    description: 'Real-time sessions with facilitator and peers',
    icon: '🎯',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    accentColor: 'text-orange-700',
    buttonColor: 'bg-orange-600 hover:bg-orange-700',
  },
  {
    id: 'SHOW_PROGRESS',
    name: 'SHOW PROGRESS - Reflect',
    description: 'Assessments, reflections, and progress tracking',
    icon: '📊',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    accentColor: 'text-green-700',
    buttonColor: 'bg-green-600 hover:bg-green-700',
  },
];

interface LessonFormState {
  title: string;
  description: string;
  learningLayer: string;
  videoUrl: string;
  duration: string;
  learningObjectives: string;
  facilitatorNotes: string;
}

export default function LessonEditor({
  classroomId,
  moduleId,
  moduleName,
  lessonsByLayer = {},
  onLessonCreated,
}: LessonEditorProps) {
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<LessonFormState>({
    title: '',
    description: '',
    learningLayer: 'LEARN',
    videoUrl: '',
    duration: '15',
    learningObjectives: '',
    facilitatorNotes: '',
  });

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = 'Lesson title is required';
    } else if (formData.title.length < 3) {
      errors.title = 'Title must be at least 3 characters';
    }

    if (formData.duration && isNaN(Number(formData.duration))) {
      errors.duration = 'Duration must be a number';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setError('Please fix the errors below');
      return;
    }

    if (!selectedLayer) {
      setError('Select a learning layer');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);

      const response = await fetch(
        `/api/facilitator/classroom/${classroomId}/modules/${moduleId}/lessons`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: formData.title.trim(),
            description: formData.description.trim(),
            learningLayer: selectedLayer,
            videoUrl: formData.videoUrl.trim() || undefined,
            duration: formData.duration ? parseInt(formData.duration) : undefined,
            learningObjectives: formData.learningObjectives
              .split('\n')
              .map((obj) => obj.trim())
              .filter((obj) => obj),
            facilitatorNotes: formData.facilitatorNotes.trim() || undefined,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create lesson');
      }

      // Reset form
      setFormData({
        title: '',
        description: '',
        learningLayer: 'LEARN',
        videoUrl: '',
        duration: '15',
        learningObjectives: '',
        facilitatorNotes: '',
      });
      setShowCreateForm(false);
      setSelectedLayer(null);
      onLessonCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{moduleName}</h3>
        <p className="text-sm text-gray-600">
          Organize lessons by learning layer to guide students through structured learning
        </p>
      </div>

      <div className="space-y-4">
        {LEARNING_LAYERS.map((layer) => (
          <div
            key={layer.id}
            className={`${layer.bgColor} border-2 ${layer.borderColor} rounded-lg p-4 transition cursor-pointer hover:shadow-md`}
          >
            {/* Layer Header */}
            <button
              onClick={() => setSelectedLayer(selectedLayer === layer.id ? null : layer.id)}
              className="w-full text-left"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{layer.icon}</span>
                  <div className="flex-1">
                    <h4 className={`font-semibold ${layer.accentColor}`}>{layer.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{layer.description}</p>
                  </div>
                </div>
              </div>
            </button>

            {/* Lessons for this layer */}
            {(lessonsByLayer[layer.id] || []).length > 0 && (
              <div className="mt-4 pt-4 border-t-2 border-current opacity-30 space-y-2">
                {lessonsByLayer[layer.id].map((lesson: any) => (
                  <div
                    key={lesson.id}
                    className="flex items-start gap-2 text-sm text-gray-700 hover:text-gray-900"
                  >
                    <span className="text-lg">📄</span>
                    <div className="flex-1">
                      <p className="font-medium">{lesson.title}</p>
                      <p className="text-xs text-gray-600">{lesson.duration || 15} min</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Create Lesson Button for this layer */}
            {selectedLayer === layer.id && !showCreateForm && (
              <button
                onClick={() => {
                  setShowCreateForm(true);
                  setFormData((prev) => ({ ...prev, learningLayer: layer.id }));
                }}
                className={`mt-4 w-full py-2 px-3 ${layer.buttonColor} text-white rounded-lg font-medium transition flex items-center justify-center gap-2`}
              >
                <Plus className="w-4 h-4" />
                Add {layer.name.split('-')[0].trim()} Lesson
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Lesson Form */}
      {showCreateForm && (
        <div className="border border-gray-300 rounded-lg p-6 bg-white shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Create New Lesson</h3>
            <button
              onClick={() => setShowCreateForm(false)}
              className="p-1 hover:bg-gray-200 rounded transition"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleCreateLesson} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">
                Lesson Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Creating Your First Budget"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
                  validationErrors.title
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-primary-500'
                }`}
              />
              {validationErrors.title && (
                <p className="mt-1 text-xs text-red-600">{validationErrors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief summary of what this lesson covers"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
            </div>

            {/* Video URL */}
            {formData.learningLayer === 'LEARN' && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  Video URL
                </label>
                <input
                  type="url"
                  name="videoUrl"
                  value={formData.videoUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/video.mp4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  min="1"
                  max="180"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
                    validationErrors.duration
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-primary-500'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">
                  Learning Layer
                </label>
                <select
                  name="learningLayer"
                  value={formData.learningLayer}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                >
                  {LEARNING_LAYERS.map((layer) => (
                    <option key={layer.id} value={layer.id}>
                      {layer.name.split('-')[0].trim()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Learning Objectives
              </label>
              <textarea
                name="learningObjectives"
                value={formData.learningObjectives}
                onChange={handleChange}
                placeholder="List learning objectives (one per line)&#10;Example:&#10;Understand the basics of budgeting&#10;Create a personal budget"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none font-mono text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">One objective per line</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Facilitator Notes
              </label>
              <textarea
                name="facilitatorNotes"
                value={formData.facilitatorNotes}
                onChange={handleChange}
                placeholder="Teaching tips, discussion points, or helpful hints for facilitators"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition flex items-center gap-2 disabled:opacity-50"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Create Lesson
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
