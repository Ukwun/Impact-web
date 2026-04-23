'use client';

import { useState } from 'react';
import { Plus, Loader2, AlertCircle, X, Calendar, Target } from 'lucide-react';
import { AUTH_TOKEN_KEY } from '@/lib/authStorage';

interface ActivityCreatorProps {
  classroomId: string;
  activities?: any[];
  onActivityCreated: () => void;
  isLoading?: boolean;
}

const ACTIVITY_TYPES = [
  {
    id: 'WORKSHEET',
    name: 'Worksheet',
    description: 'Structured exercises for practice',
    icon: '📋',
  },
  {
    id: 'TASK',
    name: 'Task',
    description: 'Practical assignments to apply learning',
    icon: '✅',
  },
  {
    id: 'REFLECTION',
    name: 'Reflection',
    description: 'Reflective prompts for self-assessment',
    icon: '💭',
  },
  {
    id: 'MINI_CHALLENGE',
    name: 'Mini Challenge',
    description: 'Engaging challenges to test understanding',
    icon: '🎯',
  },
  {
    id: 'JOURNAL',
    name: 'Journal',
    description: 'Personal journal or learning log entries',
    icon: '📓',
  },
];

interface ActivityFormState {
  title: string;
  description: string;
  instructions: string;
  activityType: string;
  dueDate: string;
  dueTime: string;
  maxPoints: string;
  rubric: string;
}

export default function ActivityCreator({
  classroomId,
  activities = [],
  onActivityCreated,
}: ActivityCreatorProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [selectedActivityType, setSelectedActivityType] = useState<string>('TASK');

  const [formData, setFormData] = useState<ActivityFormState>({
    title: '',
    description: '',
    instructions: '',
    activityType: 'TASK',
    dueDate: '',
    dueTime: '23:59',
    maxPoints: '100',
    rubric: '',
  });

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = 'Activity title is required';
    } else if (formData.title.length < 5) {
      errors.title = 'Title must be at least 5 characters';
    }

    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }

    if (!formData.instructions.trim()) {
      errors.instructions = 'Instructions are required';
    } else if (formData.instructions.length < 20) {
      errors.instructions = 'Instructions should be at least 20 characters';
    }

    if (formData.maxPoints && isNaN(Number(formData.maxPoints))) {
      errors.maxPoints = 'Points must be a number';
    }

    if (formData.dueDate && new Date(formData.dueDate) < new Date()) {
      errors.dueDate = 'Due date must be in the future';
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

  const handleActivityTypeSelect = (typeId: string) => {
    setSelectedActivityType(typeId);
    setFormData((prev) => ({ ...prev, activityType: typeId }));
  };

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setError('Please fix the errors below');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);

      // Combine date and time for due date
      let dueDateTime = undefined;
      if (formData.dueDate && formData.dueTime) {
        dueDateTime = new Date(`${formData.dueDate}T${formData.dueTime}`).toISOString();
      }

      const response = await fetch(
        `/api/facilitator/classroom/${classroomId}/activities`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: formData.title.trim(),
            description: formData.description.trim(),
            instructions: formData.instructions.trim(),
            activityType: selectedActivityType,
            dueDate: dueDateTime,
            maxPoints: formData.maxPoints ? parseInt(formData.maxPoints) : 100,
            rubric: formData.rubric.trim() || undefined,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create activity');
      }

      // Reset form
      setFormData({
        title: '',
        description: '',
        instructions: '',
        activityType: 'TASK',
        dueDate: '',
        dueTime: '23:59',
        maxPoints: '100',
        rubric: '',
      });
      setShowCreateForm(false);
      setSelectedActivityType('TASK');
      onActivityCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Group activities by due status
  const activeActivities = activities.filter(
    (a) => new Date(a.dueDate || Date.now()) > new Date()
  );
  const overdueActivities = activities.filter(
    (a) => new Date(a.dueDate || Date.now()) <= new Date()
  );

  return (
    <div className="space-y-6">
      {/* Existing Activities */}
      {activities && activities.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Activities</h3>

          {/* Active Activities */}
          {activeActivities.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-700 px-2">Active</h4>
              {activeActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start gap-2">
                        <span className="text-2xl">{activity.icon || '📌'}</span>
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-900">{activity.title}</h5>
                          <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>{activity.activityType}</span>
                            <span>Max Points: {activity.maxPoints || 100}</span>
                            {activity.dueDate && (
                              <span>Due: {new Date(activity.dueDate).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-2 py-1 text-sm text-primary-600 hover:bg-primary-50 rounded transition">
                        Edit
                      </button>
                      <button className="px-2 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Overdue Activities */}
          {overdueActivities.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-700 px-2">Overdue</h4>
              {overdueActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="border border-orange-200 rounded-lg p-4 bg-orange-50 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start gap-2">
                        <span className="text-2xl">{activity.icon || '⏰'}</span>
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-900">{activity.title}</h5>
                          <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>{activity.activityType}</span>
                            <span className="text-orange-700 font-semibold">
                              Due: {new Date(activity.dueDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-2 py-1 text-sm text-primary-600 hover:bg-primary-50 rounded transition">
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Activity */}
      {!showCreateForm ? (
        <button
          onClick={() => setShowCreateForm(true)}
          className="w-full py-3 px-4 border border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary-500 hover:text-primary-600 hover:bg-primary-50 transition font-medium flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Activity
        </button>
      ) : (
        <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Create New Activity</h3>
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

          <form onSubmit={handleCreateActivity} className="space-y-6">
            {/* Activity Type Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                <Target className="w-4 h-4 inline mr-2" />
                Activity Type
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {ACTIVITY_TYPES.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => handleActivityTypeSelect(type.id)}
                    className={`p-3 rounded-lg border-2 transition flex flex-col items-center gap-2 text-center ${
                      selectedActivityType === type.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-2xl">{type.icon}</span>
                    <span className="text-xs font-medium text-gray-700">{type.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">
                  Activity Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Budget Planning Worksheet"
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

              {/* Max Points */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">
                  Max Points
                </label>
                <input
                  type="number"
                  name="maxPoints"
                  value={formData.maxPoints}
                  onChange={handleChange}
                  min="1"
                  max="1000"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
                    validationErrors.maxPoints
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-primary-500'
                  }`}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief overview of the activity"
                rows={2}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition resize-none ${
                  validationErrors.description
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-primary-500'
                }`}
              />
              {validationErrors.description && (
                <p className="mt-1 text-xs text-red-600">{validationErrors.description}</p>
              )}
            </div>

            {/* Instructions */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">
                Instructions *
              </label>
              <textarea
                name="instructions"
                value={formData.instructions}
                onChange={handleChange}
                placeholder="Detailed step-by-step instructions for students"
                rows={4}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition resize-none ${
                  validationErrors.instructions
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-primary-500'
                }`}
              />
              {validationErrors.instructions && (
                <p className="mt-1 text-xs text-red-600">{validationErrors.instructions}</p>
              )}
            </div>

            {/* Due Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Due Date
                </label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
                    validationErrors.dueDate
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-primary-500'
                  }`}
                />
                {validationErrors.dueDate && (
                  <p className="mt-1 text-xs text-red-600">{validationErrors.dueDate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">
                  Due Time
                </label>
                <input
                  type="time"
                  name="dueTime"
                  value={formData.dueTime}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Rubric */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">
                Grading Rubric (optional)
              </label>
              <textarea
                name="rubric"
                value={formData.rubric}
                onChange={handleChange}
                placeholder="Grading criteria and point distribution"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
            </div>

            {/* Buttons */}
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
                Create Activity
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
