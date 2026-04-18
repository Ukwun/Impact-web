'use client';

import { useState } from 'react';
import { X, Loader } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: any) => Promise<void>;
}

const roles = ['STUDENT', 'FACILITATOR', 'MENTOR', 'PARENT', 'SCHOOL_ADMIN', 'UNI_MEMBER', 'CIRCLE_MEMBER', 'ADMIN'];

export default function CreateUserModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateUserModalProps) {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    role: 'STUDENT',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.email || !formData.firstName || !formData.lastName || !formData.password) {
      setError('All fields are required');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    try {
      setLoading(true);
      await onSubmit({
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        password: formData.password,
        role: formData.role,
      });
      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        password: '',
        confirmPassword: '',
        role: 'STUDENT',
      });
    } catch (err) {
      console.error('Error submitting form:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-dark-800 border border-dark-600">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-text-500">Create New User</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-dark-700 rounded-lg transition-colors"
            >
              <X size={24} className="text-gray-400" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-danger-50 border border-danger-300 rounded-lg text-danger-700 text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="John"
                  className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-text-500 placeholder-gray-400 focus:outline-none focus:border-primary-500"
                  disabled={loading}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-text-500 placeholder-gray-400 focus:outline-none focus:border-primary-500"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-text-500 placeholder-gray-400 focus:outline-none focus:border-primary-500"
                disabled={loading}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-text-500 focus:outline-none focus:border-primary-500"
                disabled={loading}
              >
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-text-500 placeholder-gray-400 focus:outline-none focus:border-primary-500"
                disabled={loading}
                required
              />
              <p className="text-xs text-gray-400 mt-1">Minimum 8 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-text-500 placeholder-gray-400 focus:outline-none focus:border-primary-500"
                disabled={loading}
                required
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                onClick={onClose}
                className="flex-1 bg-dark-700 hover:bg-dark-600"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-primary-600 hover:bg-primary-700 flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create User'
                )}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
