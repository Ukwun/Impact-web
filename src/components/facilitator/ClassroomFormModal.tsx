'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { AUTH_TOKEN_KEY } from '@/lib/authStorage';

interface ClassroomFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (classroom: any) => void;
  editingClassroom?: any;
}

const DIFFICULTIES = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
const LANGUAGES = ['English', 'Spanish', 'French', 'Mandarin', 'Swahili'];
const AGE_GROUPS = ['5-7', '8-10', '11-13', '14-16', '17-19', '20+'];

export default function ClassroomFormModal({
  isOpen,
  onClose,
  onSuccess,
  editingClassroom,
}: ClassroomFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    title: editingClassroom?.title || '',
    description: editingClassroom?.description || '',
    difficulty: editingClassroom?.difficulty || 'BEGINNER',
    language: editingClassroom?.language || 'English',
    ageGroup: editingClassroom?.ageGroup || '11-13',
    subjectStrand: editingClassroom?.subjectStrand || '',
    estimatedDuration: editingClassroom?.estimatedDuration || '',
    thumbnail: editingClassroom?.thumbnail || '',
  });

  useEffect(() => {
    if (!isOpen) {
      setError('');
      setSuccess('');
      setValidationErrors({});
    }
  }, [isOpen]);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = 'Classroom name is required';
    } else if (formData.title.length < 5) {
      errors.title = 'Classroom name must be at least 5 characters';
    }

    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    } else if (formData.description.length < 20) {
      errors.description = 'Description must be at least 20 characters';
    }

    if (!formData.subjectStrand.trim()) {
      errors.subjectStrand = 'Subject area is required';
    }

    if (formData.estimatedDuration && isNaN(Number(formData.estimatedDuration))) {
      errors.estimatedDuration = 'Duration must be a number';
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
    // Clear error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Please fix the errors below');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      const method = editingClassroom ? 'PUT' : 'POST';
      const url = editingClassroom
        ? `/api/facilitator/classroom/${editingClassroom.id}`
        : '/api/facilitator/classroom';

      const submitData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        difficulty: formData.difficulty,
        language: formData.language,
        ageGroup: formData.ageGroup,
        subjectStrand: formData.subjectStrand.trim(),
        estimatedDuration: formData.estimatedDuration ? parseInt(formData.estimatedDuration) : undefined,
        thumbnail: formData.thumbnail.trim() || undefined,
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${editingClassroom ? 'update' : 'create'} classroom`);
      }

      setSuccess(`Classroom ${editingClassroom ? 'updated' : 'created'} successfully!`);
      setTimeout(() => {
        onSuccess(data.data);
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-4 flex justify-between items-center border-b">
          <div>
            <h2 className="text-2xl font-bold">
              {editingClassroom ? 'Edit Classroom' : 'Create New Classroom'}
            </h2>
            <p className="text-primary-100 text-sm mt-1">
              {editingClassroom ? 'Update classroom details' : 'Set up a new learning classroom'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-primary-500 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-900">{error}</p>
              </div>
            </div>
          )}

          {/* Success Alert */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-green-900 font-medium">{success}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Classroom Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Classroom Name *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Financial Literacy for Teens"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
                  validationErrors.title
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-primary-500'
                }`}
              />
              {validationErrors.title && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.title}</p>
              )}
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="What will students learn in this classroom?"
                rows={4}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition resize-none ${
                  validationErrors.description
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-primary-500'
                }`}
              />
              {validationErrors.description && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.description}</p>
              )}
            </div>

            {/* Subject Strand */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Subject Area *
              </label>
              <input
                type="text"
                name="subjectStrand"
                value={formData.subjectStrand}
                onChange={handleChange}
                placeholder="e.g., Mathematics, Science, Languages"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
                  validationErrors.subjectStrand
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-primary-500'
                }`}
              />
              {validationErrors.subjectStrand && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.subjectStrand}</p>
              )}
            </div>

            {/* Age Group */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Target Age Group
              </label>
              <select
                name="ageGroup"
                value={formData.ageGroup}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {AGE_GROUPS.map((age) => (
                  <option key={age} value={age}>
                    {age} years
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Level */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Difficulty Level
              </label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {DIFFICULTIES.map((level) => (
                  <option key={level} value={level}>
                    {level.charAt(0) + level.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Language of Instruction
              </label>
              <select
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>

            {/* Estimated Duration */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Duration (weeks)
              </label>
              <input
                type="number"
                name="estimatedDuration"
                value={formData.estimatedDuration}
                onChange={handleChange}
                placeholder="e.g., 4"
                min="1"
                max="52"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
                  validationErrors.estimatedDuration
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-primary-500'
                }`}
              />
              {validationErrors.estimatedDuration && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.estimatedDuration}</p>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-medium hover:from-primary-700 hover:to-primary-800 transition flex items-center gap-2 disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingClassroom ? 'Update Classroom' : 'Create Classroom'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
