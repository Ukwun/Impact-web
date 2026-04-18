'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Check,
  X,
  Loader,
  Filter,
} from 'lucide-react';
import CreateUserModal from './CreateUserModal';
import EditUserModal from './EditUserModal';
import DeleteConfirmModal from './DeleteConfirmModal';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  enrollmentCount: number;
  createdAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const roles = ['STUDENT', 'FACILITATOR', 'MENTOR', 'PARENT', 'SCHOOL_ADMIN', 'UNI_MEMBER', 'CIRCLE_MEMBER', 'ADMIN'];
  const statuses = [
    { value: 'true', label: 'Active' },
    { value: 'false', label: 'Inactive' },
  ];

  // Fetch users
  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', pagination.limit.toString());
      
      if (searchQuery) params.append('search', searchQuery);
      if (roleFilter) params.append('role', roleFilter);
      if (statusFilter) params.append('isActive', statusFilter);

      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/admin/users?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.data.users);
      setPagination(data.data.pagination);
    } catch (error) {
      console.error('Error fetching users:', error);
      showToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsVisible(true);
    fetchUsers(1);
  }, [searchQuery, roleFilter, statusFilter]);

  const handleCreateUser = async (userData: any) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create user');
      }

      showToast('User created successfully', 'success');
      setShowCreateModal(false);
      fetchUsers(pagination.page);
    } catch (error) {
      console.error('Error creating user:', error);
      showToast(error instanceof Error ? error.message : 'Failed to create user', 'error');
    }
  };

  const handleUpdateUser = async (userId: string, updateData: any) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update user');
      }

      showToast('User updated successfully', 'success');
      setShowEditModal(false);
      setSelectedUser(null);
      fetchUsers(pagination.page);
    } catch (error) {
      console.error('Error updating user:', error);
      showToast(error instanceof Error ? error.message : 'Failed to update user', 'error');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete user');
      }

      showToast('User deactivated successfully', 'success');
      setShowDeleteModal(false);
      setSelectedUser(null);
      fetchUsers(pagination.page);
    } catch (error) {
      console.error('Error deleting user:', error);
      showToast(error instanceof Error ? error.message : 'Failed to deactivate user', 'error');
    }
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

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
            <h1 className="text-4xl font-black text-text-500">User Management</h1>
            <p className="text-gray-300 mt-2">
              Manage all users, update roles, and deactivate accounts
            </p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700"
          >
            <Plus size={20} />
            Create User
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-6 bg-dark-800 border border-dark-600">
        <div className="space-y-4">
          <h3 className="font-bold text-text-500 flex items-center gap-2">
            <Filter size={18} />
            Filters & Search
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search size={18} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-text-500 placeholder-gray-400 focus:outline-none focus:border-primary-500"
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-text-500 focus:outline-none focus:border-primary-500"
            >
              <option value="">All Roles</option>
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-text-500 focus:outline-none focus:border-primary-500"
            >
              <option value="">All Statuses</option>
              {statuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="p-6 bg-dark-800 border border-dark-600 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="animate-spin text-primary-600" size={32} />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No users found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-600">
                    <th className="text-left py-3 px-4 font-bold text-text-500">Name</th>
                    <th className="text-left py-3 px-4 font-bold text-text-500">Email</th>
                    <th className="text-left py-3 px-4 font-bold text-text-500">Role</th>
                    <th className="text-left py-3 px-4 font-bold text-text-500">Status</th>
                    <th className="text-left py-3 px-4 font-bold text-text-500">Enrollments</th>
                    <th className="text-left py-3 px-4 font-bold text-text-500">Joined</th>
                    <th className="text-left py-3 px-4 font-bold text-text-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-dark-700 hover:bg-dark-700/50 transition-colors"
                    >
                      <td className="py-3 px-4 text-text-500 font-medium">{user.name}</td>
                      <td className="py-3 px-4 text-gray-300 text-sm">{user.email}</td>
                      <td className="py-3 px-4">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary-50 text-primary-700">
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {user.isActive ? (
                            <>
                              <Check size={16} className="text-success-500" />
                              <span className="text-success-500 text-sm font-medium">Active</span>
                            </>
                          ) : (
                            <>
                              <X size={16} className="text-danger-500" />
                              <span className="text-danger-500 text-sm font-medium">Inactive</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-300">{user.enrollmentCount}</td>
                      <td className="py-3 px-4 text-gray-400 text-sm">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditClick(user)}
                            className="p-2 hover:bg-dark-600 rounded-lg transition-colors text-primary-500 hover:text-primary-600"
                            title="Edit user"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(user)}
                            disabled={!user.isActive}
                            className="p-2 hover:bg-dark-600 rounded-lg transition-colors text-danger-500 hover:text-danger-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            title={user.isActive ? 'Deactivate user' : 'Already inactive'}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="mt-6 flex items-center justify-between">
              <div className="text-gray-400 text-sm">
                Showing {users.length} of {pagination.total} users
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchUsers(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 bg-dark-700 hover:bg-dark-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="text-gray-400 text-sm">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => fetchUsers(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 bg-dark-700 hover:bg-dark-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Modals */}
      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateUser}
      />

      {selectedUser && (
        <>
          <EditUserModal
            isOpen={showEditModal}
            user={selectedUser}
            onClose={() => {
              setShowEditModal(false);
              setSelectedUser(null);
            }}
            onSubmit={(data) => handleUpdateUser(selectedUser.id, data)}
          />

          <DeleteConfirmModal
            isOpen={showDeleteModal}
            title="Deactivate User"
            message={`Are you sure you want to deactivate ${selectedUser.name}? This action is reversible.`}
            onConfirm={() => handleDeleteUser(selectedUser.id)}
            onCancel={() => {
              setShowDeleteModal(false);
              setSelectedUser(null);
            }}
          />
        </>
      )}
    </div>
  );
}
