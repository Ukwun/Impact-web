'use client';

import { useState, useEffect } from 'react';
import { X, Loader } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  enrollmentCount: number;
  createdAt: string;
}

interface EditUserModalProps {
  isOpen: boolean;
  user: User;
  onClose: () => void;
  onSubmit: (updateData: any) => Promise<void>;
}

const roles = ['STUDENT', 'FACILITATOR', 'MENTOR', 'PARENT', 'SCHOOL_ADMIN', 'UNI_MEMBER', 'CIRCLE_MEMBER', 'ADMIN'];

export default function EditUserModal({
  isOpen,
  user,
  onClose,
  onSubmit,
}: EditUserModalProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    role: '',
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      const [firstName, ...lastNameParts] = user.name.split(' ');
      const lastName = lastNameParts.join(' ');
      setFormData({
        firstName: firstName || '',
        lastName: lastName || '',
        role: user.role,
        isActive: user.isActive,
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let newValue: any = value;
    
    if (type === 'checkbox') {
      newValue = (e.target as HTMLInputElement).checked;
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.firstName || !formData.lastName) {
      setError('Name is required');
      return;
    }

    try {
      setLoading(true);
      await onSubmit({
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
        isActive: formData.isActive,
      });
    } catch (err) {
      console.error('Error submitting form:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-dark-800 border border-dark-600">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-text-500">Edit User</h2>
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

            {/* Email (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Email (Read-only)
              </label>
              <input
                type="email"
                value={user.email}
                className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-400 cursor-not-allowed opacity-75"
                disabled
              />
            </div>

            {/* First and Last Name */}
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
                  className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-text-500 placeholder-gray-400 focus:outline-none focus:border-primary-500"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Role */}
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

            {/* Status */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-4 h-4 rounded border-dark-600 bg-dark-700 cursor-pointer"
                disabled={loading}
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-300 cursor-pointer">
                User is Active
              </label>
            </div>

            {/* Meta Info */}
            <div className="p-3 bg-dark-700 rounded-lg border border-dark-600">
              <p className="text-xs text-gray-400">
                <span className="font-medium">Enrollments:</span> {user.enrollmentCount}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                <span className="font-medium">Joined:</span> {new Date(user.createdAt).toLocaleDateString()}
              </p>
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
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
