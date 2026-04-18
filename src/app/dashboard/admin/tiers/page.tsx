'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import {
  Plus,
  Edit2,
  Trash2,
  Users,
  Loader,
  Check,
  X,
  AlertCircle,
  BookOpen,
  Users2,
  Zap,
  MessageSquare,
  Award,
  Settings,
} from 'lucide-react';
import CreateTierModal from './CreateTierModal';
import EditTierModal from './EditTierModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import TierUsersModal from './TierUsersModal';

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
  createdAt: string;
  updatedAt: string;
  _count?: { users: number };
}

export default function AdminTiersPage() {
  const { showToast } = useToast();
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState<Tier | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Fetch tiers
  const fetchTiers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/admin/tiers', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tiers');
      }

      const data = await response.json();
      setTiers(data.data || []);
    } catch (error) {
      console.error('Error fetching tiers:', error);
      showToast('Failed to load tiers', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsVisible(true);
    fetchTiers();
  }, []);

  const handleCreateTier = async (tierData: any) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/admin/tiers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(tierData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create tier');
      }

      showToast('Tier created successfully', 'success');
      setShowCreateModal(false);
      fetchTiers();
    } catch (error) {
      console.error('Error creating tier:', error);
      showToast(error instanceof Error ? error.message : 'Failed to create tier', 'error');
    }
  };

  const handleUpdateTier = async (tierId: string, updateData: any) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/admin/tiers/${tierId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update tier');
      }

      showToast('Tier updated successfully', 'success');
      setShowEditModal(false);
      setSelectedTier(null);
      fetchTiers();
    } catch (error) {
      console.error('Error updating tier:', error);
      showToast(error instanceof Error ? error.message : 'Failed to update tier', 'error');
    }
  };

  const handleDeleteTier = async (tierId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/admin/tiers/${tierId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete tier');
      }

      showToast('Tier deleted successfully', 'success');
      setShowDeleteModal(false);
      setSelectedTier(null);
      fetchTiers();
    } catch (error) {
      console.error('Error deleting tier:', error);
      showToast(error instanceof Error ? error.message : 'Failed to delete tier', 'error');
    }
  };

  const handleEditClick = (tier: Tier) => {
    setSelectedTier(tier);
    setShowEditModal(true);
  };

  const handleDeleteClick = (tier: Tier) => {
    setSelectedTier(tier);
    setShowDeleteModal(true);
  };

  const handleViewUsers = (tier: Tier) => {
    setSelectedTier(tier);
    setShowUsersModal(true);
  };

  const getFeatureIcon = (feature: string) => {
    const iconMap: { [key: string]: any } = {
      canAccessLearning: BookOpen,
      canParticipateEvents: Zap,
      canAccessCommunity: Users2,
      canAccessMentorship: MessageSquare,
      canCreateContent: Award,
      canManageChapter: Settings,
    };
    const IconComponent = iconMap[feature];
    return IconComponent ? <IconComponent size={16} /> : null;
  };

  const featuresList = [
    { key: 'canAccessLearning', label: 'Learning Access' },
    { key: 'canParticipateEvents', label: 'Events' },
    { key: 'canAccessCommunity', label: 'Community' },
    { key: 'canAccessMentorship', label: 'Mentorship' },
    { key: 'canCreateContent', label: 'Create Content' },
    { key: 'canManageChapter', label: 'Manage Chapter' },
  ];

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div
        className={`space-y-4 transition-all duration-700 transform ${
          isVisible
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-text-500">Membership Tiers</h1>
            <p className="text-gray-300 mt-2">
              Create, manage, and configure membership tier features and benefits
            </p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700"
          >
            <Plus size={20} />
            Create Tier
          </Button>
        </div>
      </div>

      {/* Tiers Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="animate-spin text-primary-600" size={32} />
        </div>
      ) : tiers.length === 0 ? (
        <Card className="p-12 bg-dark-800 border border-dark-600 text-center">
          <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-400 text-lg">No membership tiers created yet</p>
          <p className="text-gray-500 mt-2">Create your first membership tier to get started</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {tiers.map((tier) => (
            <Card
              key={tier.id}
              className="p-6 bg-dark-800 border border-dark-600 hover:border-primary-500/50 transition-all"
            >
              {/* Tier Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-text-500">{tier.name}</h2>
                  {tier.description && (
                    <p className="text-gray-400 text-sm mt-1">{tier.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditClick(tier)}
                    className="p-2 hover:bg-dark-700 rounded-lg transition-colors text-primary-500 hover:text-primary-600"
                    title="Edit tier"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(tier)}
                    disabled={tier._count && tier._count.users > 0}
                    className="p-2 hover:bg-dark-700 rounded-lg transition-colors text-danger-500 hover:text-danger-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={
                      tier._count && tier._count.users > 0
                        ? 'Cannot delete tier with active members'
                        : 'Delete tier'
                    }
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Tier Type Badge */}
              {tier.tierType && (
                <div className="mb-4">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-secondary-50 text-secondary-700">
                    {tier.tierType}
                  </span>
                </div>
              )}

              {/* Features Grid */}
              <div className="mb-6 p-4 bg-dark-700/50 rounded-lg border border-dark-600">
                <h3 className="text-sm font-bold text-gray-300 mb-3">Features</h3>
                <div className="grid grid-cols-2 gap-2">
                  {featuresList.map(({ key, label }) => (
                    <div
                      key={key}
                      className="flex items-center gap-2"
                    >
                      {tier[key as keyof Tier] ? (
                        <>
                          <Check size={16} className="text-success-500" />
                          <span className="text-xs text-gray-300">{label}</span>
                        </>
                      ) : (
                        <>
                          <X size={16} className="text-gray-500" />
                          <span className="text-xs text-gray-500">{label}</span>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Limits */}
              <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-dark-700/50 rounded-lg border border-dark-600">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Max Courses</p>
                  <p className="text-lg font-bold text-text-500">
                    {tier.maxCoursesAccess === 999 ? '∞' : tier.maxCoursesAccess}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Max Events</p>
                  <p className="text-lg font-bold text-text-500">
                    {tier.maxEventsAccess === 999 ? '∞' : tier.maxEventsAccess}
                  </p>
                </div>
              </div>

              {/* Members & Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-400">
                  <Users size={16} />
                  <span className="text-sm">
                    {tier._count?.users || 0} members
                  </span>
                </div>
                <button
                  onClick={() => handleViewUsers(tier)}
                  className="px-4 py-1 text-xs font-medium rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors text-primary-500 hover:text-primary-600"
                >
                  View Members
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateTierModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateTier}
      />

      {selectedTier && (
        <>
          <EditTierModal
            isOpen={showEditModal}
            tier={selectedTier}
            onClose={() => {
              setShowEditModal(false);
              setSelectedTier(null);
            }}
            onSubmit={(data) => handleUpdateTier(selectedTier.id, data)}
          />

          <DeleteConfirmModal
            isOpen={showDeleteModal}
            tierName={selectedTier.name}
            memberCount={selectedTier._count?.users || 0}
            onConfirm={() => handleDeleteTier(selectedTier.id)}
            onCancel={() => {
              setShowDeleteModal(false);
              setSelectedTier(null);
            }}
          />

          <TierUsersModal
            isOpen={showUsersModal}
            tier={selectedTier}
            onClose={() => {
              setShowUsersModal(false);
              setSelectedTier(null);
            }}
          />
        </>
      )}
    </div>
  );
}
