'use client';

import { useState } from 'react';
import { Plus, Loader2, AlertCircle, X, ChevronDown, ChevronUp } from 'lucide-react';
import { AUTH_TOKEN_KEY } from '@/lib/authStorage';

interface ModuleBuilderProps {
  classroomId: string;
  modules?: any[];
  onModuleCreated: () => void;
  isLoading?: boolean;
}

const LEARNING_LAYERS = [
  {
    id: 'LEARN',
    name: 'LEARN',
    description: 'Watch videos and lectures to understand concepts',
    icon: '📚',
    color: 'bg-blue-50 border-blue-200',
  },
  {
    id: 'APPLY',
    name: 'APPLY',
    description: 'Complete tasks and worksheets to practice what you learned',
    icon: '✏️',
    color: 'bg-purple-50 border-purple-200',
  },
  {
    id: 'ENGAGE_LIVE',
    name: 'ENGAGE LIVE',
    description: 'Participate in real-time sessions with the facilitator',
    icon: '🎯',
    color: 'bg-orange-50 border-orange-200',
  },
  {
    id: 'SHOW_PROGRESS',
    name: 'SHOW PROGRESS',
    description: 'Assessments and reflections to track your growth',
    icon: '📊',
    color: 'bg-green-50 border-green-200',
  },
];

export default function ModuleBuilder({
  classroomId,
  modules = [],
  onModuleCreated,
  isLoading,
}: ModuleBuilderProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    order: modules.length + 1,
    ageGroup: '11-13',
    subjectStrand: '',
    estimatedWeeks: '1',
  });

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = 'Module title is required';
    } else if (formData.title.length < 3) {
      errors.title = 'Title must be at least 3 characters';
    }

    if (formData.estimatedWeeks && isNaN(Number(formData.estimatedWeeks))) {
      errors.estimatedWeeks = 'Duration must be a number';
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

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setError('Please fix the errors below');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);

      const response = await fetch(
        `/api/facilitator/classroom/${classroomId}/modules`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: formData.title.trim(),
            description: formData.description.trim(),
            order: parseInt(String(formData.order)),
            ageGroup: formData.ageGroup,
            subjectStrand: formData.subjectStrand.trim(),
            estimatedWeeks: parseInt(formData.estimatedWeeks),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create module');
      }

      // Reset form
      setFormData({
        title: '',
        description: '',
        order: modules.length + 2,
        ageGroup: '11-13',
        subjectStrand: '',
        estimatedWeeks: '1',
      });
      setShowCreateForm(false);
      onModuleCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Existing Modules */}
      {modules && modules.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Modules</h3>
          {modules.map((module) => (
            <div
              key={module.id}
              className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition"
            >
              <button
                onClick={() => setExpandedModule(expandedModule === module.id ? null : module.id)}
                className="w-full px-4 py-3 flex items-start justify-between bg-gray-50 hover:bg-gray-100 transition"
              >
                <div className="text-left">
                  <h4 className="font-semibold text-gray-900">
                    Module {module.order}: {module.title}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {module.estimatedWeeks} weeks • {module.lessonCount || 0} lessons • {module.activityCount || 0} activities
                  </p>
                </div>
                {expandedModule === module.id ? (
                  <ChevronUp className="w-5 h-5 text-gray-600 mt-1" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600 mt-1" />
                )}
              </button>

              {/* Expanded Content */}
              {expandedModule === module.id && (
                <div className="px-4 py-4 border-t border-gray-200 space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 text-justify">{module.description}</p>
                  </div>

                  {/* Learning Layers */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {LEARNING_LAYERS.map((layer) => (
                      <div
                        key={layer.id}
                        className={`${layer.color} border rounded-lg p-3 cursor-pointer hover:shadow-md transition`}
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-xl">{layer.icon}</span>
                          <div className="flex-1">
                            <h5 className="font-semibold text-gray-900 text-sm">{layer.name}</h5>
                            <p className="text-xs text-gray-600 mt-1">{layer.description}</p>
                            <button className="text-xs font-medium text-primary-600 hover:text-primary-700 mt-2">
                              + Add Lesson
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Module Actions */}
                  <div className="flex gap-2 pt-2 border-t border-gray-200">
                    <button className="px-3 py-1 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded transition">
                      Edit Module
                    </button>
                    <button className="px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-50 rounded transition">
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create New Module Form */}
      {!showCreateForm ? (
        <button
          onClick={() => setShowCreateForm(true)}
          className="w-full py-3 px-4 border border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary-500 hover:text-primary-600 hover:bg-primary-50 transition font-medium flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create New Module
        </button>
      ) : (
        <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Create New Module</h3>
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

          <form onSubmit={handleCreateModule} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">
                Module Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Week 1: Introduction to Budgeting"
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
                placeholder="What will students learn in this module?"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">
                  Duration (weeks) *
                </label>
                <input
                  type="number"
                  name="estimatedWeeks"
                  value={formData.estimatedWeeks}
                  onChange={handleChange}
                  min="1"
                  max="12"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
                    validationErrors.estimatedWeeks
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-primary-500'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">
                  Module Order
                </label>
                <input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
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
                Create Module
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
