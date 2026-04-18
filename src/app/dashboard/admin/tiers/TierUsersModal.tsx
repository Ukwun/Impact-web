'use client';

import { useState, useEffect } from 'react';
import { X, Loader, Users } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';

interface Tier {
  id: string;
  name: string;
}

interface TierUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  membershipStatus: string;
  membershipJoinedAt: string;
}

interface TierUsersModalProps {
  isOpen: boolean;
  tier: Tier;
  onClose: () => void;
}

export default function TierUsersModal({
  isOpen,
  tier,
  onClose,
}: TierUsersModalProps) {
  const { showToast } = useToast();
  const [users, setUsers] = useState<TierUser[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && tier) {
      fetchTierUsers();
    }
  }, [isOpen, tier]);

  const fetchTierUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/admin/tiers/${tier.id}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tier users');
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching tier users:', error);
      showToast('Failed to load tier members', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !tier) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-dark-800 border border-dark-600 max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-dark-600">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users size={24} className="text-primary-600" />
              <div>
                <h2 className="text-2xl font-bold text-text-500">{tier.name}</h2>
                <p className="text-gray-400 text-sm">Members of this tier</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-dark-700 rounded-lg transition-colors"
            >
              <X size={24} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="animate-spin text-primary-600" size={32} />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-400 text-lg">No members in this tier yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-600">
                    <th className="text-left py-3 px-4 font-bold text-text-500">Name</th>
                    <th className="text-left py-3 px-4 font-bold text-text-500">Email</th>
                    <th className="text-left py-3 px-4 font-bold text-text-500">Role</th>
                    <th className="text-left py-3 px-4 font-bold text-text-500">Status</th>
                    <th className="text-left py-3 px-4 font-bold text-text-500">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-dark-700 hover:bg-dark-700/50 transition-colors"
                    >
                      <td className="py-3 px-4 text-text-500 font-medium">
                        {user.firstName} {user.lastName}
                      </td>
                      <td className="py-3 px-4 text-gray-300 text-sm">{user.email}</td>
                      <td className="py-3 px-4">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-secondary-50 text-secondary-700">
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          user.membershipStatus === 'ACTIVE'
                            ? 'bg-success-50 text-success-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {user.membershipStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-400 text-sm">
                        {new Date(user.membershipJoinedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-dark-600 p-6 flex items-center justify-between">
          <div className="text-gray-400">
            Total members: <span className="font-bold text-text-500">{users.length}</span>
          </div>
          <Button
            onClick={onClose}
            className="bg-dark-700 hover:bg-dark-600"
          >
            Close
          </Button>
        </div>
      </Card>
    </div>
  );
}
