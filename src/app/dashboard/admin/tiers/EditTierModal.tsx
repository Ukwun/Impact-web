'use client';

import { useState, useEffect } from 'react';
import { X, Loader } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface Tier {
  id: string;
  tierType?: string;
  name: string;
  description?: string;
  canAccessLearning: boolean;
  canParticipateEvents: boolean;
  canAccessCommunity: boolean;
  canAccessMentorship: boolean;
  canCreateContent: boolean;
  canManageChapter: boolean;
  maxCoursesAccess: number;
  maxEventsAccess: number;
  _count?: { users: number };
}

interface EditTierModalProps {
  isOpen: boolean;
  tier: Tier;
  onClose: () => void;
  onSubmit: (updateData: any) => Promise<void>;
}

export default function EditTierModal({
  isOpen,
  tier,
  onClose,
  onSubmit,
}: EditTierModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    tierType: '',
    description: '',
    canAccessLearning: true,
    canParticipateEvents: false,
    canAccessCommunity: false,
    canAccessMentorship: false,
    canCreateContent: false,
    canManageChapter: false,
    maxCoursesAccess: 999,
    maxEventsAccess: 999,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (tier) {
      setFormData({
        name: tier.name,
        tierType: tier.tierType || '',
        description: tier.description || '',
        canAccessLearning: tier.canAccessLearning,
        canParticipateEvents: tier.canParticipateEvents,
        canAccessCommunity: tier.canAccessCommunity,
        canAccessMentorship: tier.canAccessMentorship,
        canCreateContent: tier.canCreateContent,
        canManageChapter: tier.canManageChapter,
        maxCoursesAccess: tier.maxCoursesAccess,
        maxEventsAccess: tier.maxEventsAccess,
      });
    }
  }, [tier]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let newValue: any = value;

    if (type === 'checkbox') {
      newValue = (e.target as HTMLInputElement).checked;
    } else if (type === 'number') {
      newValue = parseInt(value) || 0;
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

    if (!formData.name.trim()) {
      setError('Tier name is required');
      return;
    }

    try {
      setLoading(true);
      await onSubmit(formData);
    } catch (err) {
      console.error('Error submitting form:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !tier) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-dark-800 border border-dark-600 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-text-500">Edit Membership Tier</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-dark-700 rounded-lg transition-colors"
            >
              <X size={24} className="text-gray-400" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-danger-50 border border-danger-300 rounded-lg text-danger-700 text-sm">
                {error}
              </div>
            )}

            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="font-bold text-text-500">Basic Information</h3>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Tier Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-text-500 placeholder-gray-400 focus:outline-none focus:border-primary-500"
                  disabled={loading}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Tier Type (Optional)
                  </label>
                  <input
                    type="text"
                    name="tierType"
                    value={formData.tierType}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-text-500 placeholder-gray-400 focus:outline-none focus:border-primary-500"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-text-500 placeholder-gray-400 focus:outline-none focus:border-primary-500"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <h3 className="font-bold text-text-500">Features</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: 'canAccessLearning', label: 'Access Learning' },
                  { key: 'canParticipateEvents', label: 'Participate in Events' },
                  { key: 'canAccessCommunity', label: 'Access Community' },
                  { key: 'canAccessMentorship', label: 'Access Mentorship' },
                  { key: 'canCreateContent', label: 'Create Content' },
                  { key: 'canManageChapter', label: 'Manage Chapter' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name={key}
                      checked={formData[key as keyof typeof formData] as boolean}
                      onChange={handleChange}
                      className="w-4 h-4 rounded border-dark-600 bg-dark-700 cursor-pointer"
                      disabled={loading}
                    />
                    <span className="text-sm text-gray-300">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Limits */}
            <div className="space-y-4">
              <h3 className="font-bold text-text-500">Access Limits</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Max Courses (999 = Unlimited)
                  </label>
                  <input
                    type="number"
                    name="maxCoursesAccess"
                    value={formData.maxCoursesAccess}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-text-500 focus:outline-none focus:border-primary-500"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Max Events (999 = Unlimited)
                  </label>
                  <input
                    type="number"
                    name="maxEventsAccess"
                    value={formData.maxEventsAccess}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-text-500 focus:outline-none focus:border-primary-500"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Metadata */}
            {tier._count && (
              <div className="p-4 bg-dark-700 rounded-lg border border-dark-600">
                <p className="text-xs text-gray-400">
                  <span className="font-medium">Members:</span> {tier._count.users}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-dark-600">
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
