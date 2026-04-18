'use client';

import { useState } from 'react';
import { AUTH_TOKEN_KEY } from '@/lib/authStorage';
import { X, Loader2 } from 'lucide-react';

interface CourseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingCourse?: any;
  onSuccess: () => void;
}

export default function CourseFormModal({
  isOpen,
  onClose,
  editingCourse,
  onSuccess,
}: CourseFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: editingCourse?.title || '',
    description: editingCourse?.description || '',
    category: editingCourse?.category || '',
    difficulty: editingCourse?.difficulty || 'BEGINNER',
    duration: editingCourse?.duration || '',
    language: editingCourse?.language || 'English',
    thumbnail: editingCourse?.thumbnail || '',
    isPublished: editingCourse?.isPublished || false,
  });

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      const method = editingCourse ? 'PUT' : 'POST';
      const url = editingCourse
        ? `/api/courses/${editingCourse.id}`
        : '/api/courses';

      // Remove empty fields
      const submitData = Object.entries(formData).reduce((acc: any, [key, value]) => {
        if (value !== '' && value !== null) {
          acc[key] = value;
        }
        return acc;
      }, {});

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
        throw new Error(data.error || `Failed to ${editingCourse ? 'update' : 'create'} course`);
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-600 rounded-2xl border-2 border-dark-400 w-full max-w-2xl max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between sticky top-0 bg-dark-700 p-6 border-b border-dark-400">
          <h2 className="text-2xl font-black text-white">
            {editingCourse ? 'Edit Course' : 'Create Course'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Course Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              minLength={3}
              maxLength={255}
              className="w-full bg-dark-500 border border-dark-400 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none"
              placeholder="e.g., Financial Literacy Masterclass"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              minLength={10}
              rows={4}
              className="w-full bg-dark-500 border border-dark-400 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none"
              placeholder="Describe what students will learn..."
            />
          </div>

          {/* Category & Difficulty Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Category
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full bg-dark-500 border border-dark-400 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none"
                placeholder="e.g., Business"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Difficulty
              </label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                className="w-full bg-dark-500 border border-dark-400 rounded-lg px-4 py-2 text-white focus:border-primary-500 focus:outline-none"
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>
          </div>

          {/* Duration & Language Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Duration (hours)
              </label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                min="0"
                className="w-full bg-dark-500 border border-dark-400 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none"
                placeholder="e.g., 24"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Language
              </label>
              <input
                type="text"
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="w-full bg-dark-500 border border-dark-400 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none"
                placeholder="e.g., English"
              />
            </div>
          </div>

          {/* Thumbnail URL */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Thumbnail URL
            </label>
            <input
              type="url"
              name="thumbnail"
              value={formData.thumbnail}
              onChange={handleChange}
              className="w-full bg-dark-500 border border-dark-400 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none"
              placeholder="https://..."
            />
          </div>

          {/* Published Checkbox */}
          <div className="flex items-center gap-3 p-3 bg-dark-500 rounded-lg border border-dark-400">
            <input
              type="checkbox"
              name="isPublished"
              id="isPublished"
              checked={formData.isPublished}
              onChange={handleChange}
              className="w-4 h-4 cursor-pointer"
            />
            <label htmlFor="isPublished" className="text-sm font-semibold text-white cursor-pointer">
              Publish this course immediately
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-dark-400">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 bg-dark-500 hover:bg-dark-400 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg font-semibold transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {editingCourse ? 'Update Course' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
