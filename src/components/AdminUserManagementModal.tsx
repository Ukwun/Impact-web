import React, { useState, useMemo } from 'react';
import { Search, Shield, Trash2, Edit, X, ChevronRight } from 'lucide-react';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  school?: string;
  lastActive: string;
  status: 'active' | 'inactive' | 'suspended';
  joinedDate: string;
}

interface AdminUserManagementModalProps {
  isOpen: boolean;
  users: AdminUser[];
  onClose: () => void;
  onChangeRole?: (userId: string, newRole: string) => Promise<void>;
  onSuspendUser?: (userId: string) => Promise<void>;
  onDeleteUser?: (userId: string) => Promise<void>;
}

const roles = ['ADMIN', 'SCHOOL_ADMIN', 'FACILITATOR', 'STUDENT', 'PARENT', 'MENTOR', 'UNI_MEMBER', 'CIRCLE_MEMBER'];

const AdminUserManagementModal: React.FC<AdminUserManagementModalProps> = ({
  isOpen,
  users,
  onClose,
  onChangeRole,
  onSuspendUser,
  onDeleteUser,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [newRole, setNewRole] = useState('');
  const [actionInProgress, setActionInProgress] = useState(false);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = !selectedRole || user.role === selectedRole;
      const matchesStatus = !selectedStatus || user.status === selectedStatus;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, selectedRole, selectedStatus]);

  const statusColor = {
    active: 'text-green-700 bg-green-100',
    inactive: 'text-yellow-700 bg-yellow-100',
    suspended: 'text-red-700 bg-red-100',
  };

  const handleChangeRole = async (userId: string, role: string) => {
    if (!onChangeRole) return;
    setActionInProgress(true);
    try {
      await onChangeRole(userId, role);
      setEditingRole(null);
      setNewRole('');
    } finally {
      setActionInProgress(false);
    }
  };

  const handleSuspend = async (userId: string) => {
    if (!onSuspendUser) return;
    setActionInProgress(true);
    try {
      await onSuspendUser(userId);
    } finally {
      setActionInProgress(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!onDeleteUser || !confirm('Are you sure? This action cannot be undone.')) return;
    setActionInProgress(true);
    try {
      await onDeleteUser(userId);
    } finally {
      setActionInProgress(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {selectedUser ? (
            <div className="space-y-6">
              <button
                onClick={() => setSelectedUser(null)}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
              >
                ← Back to Users
              </button>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-8">
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Name</label>
                    <p className="text-2xl font-bold text-gray-900">{selectedUser.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                    <p className="text-2xl font-bold text-gray-900">{selectedUser.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Joined</label>
                    <p className="text-lg text-gray-900">
                      {new Date(selectedUser.joinedDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Last Active</label>
                    <p className="text-lg text-gray-900">{selectedUser.lastActive}</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-sm font-bold text-gray-700">Role</label>
                    {editingRole !== selectedUser.id && (
                      <button
                        onClick={() => {
                          setEditingRole(selectedUser.id);
                          setNewRole(selectedUser.role);
                        }}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        <Edit className="w-4 h-4 inline mr-1" />
                        Change
                      </button>
                    )}
                  </div>

                  {editingRole === selectedUser.id ? (
                    <div className="space-y-3">
                      <select
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        {roles.map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleChangeRole(selectedUser.id, newRole)}
                          disabled={actionInProgress}
                          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium"
                        >
                          {actionInProgress ? 'Updating...' : 'Update Role'}
                        </button>
                        <button
                          onClick={() => {
                            setEditingRole(null);
                            setNewRole('');
                          }}
                          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="px-4 py-2 bg-gray-100 rounded-lg font-bold text-gray-900">
                      {selectedUser.role}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {selectedStatus !== 'suspended' && (
                    <button
                      onClick={() => handleSuspend(selectedUser.id)}
                      disabled={actionInProgress}
                      className="border-2 border-yellow-300 hover:bg-yellow-50 disabled:opacity-50 text-yellow-700 px-4 py-3 rounded-lg font-medium transition-colors"
                    >
                      Suspend Account
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(selectedUser.id)}
                    disabled={actionInProgress}
                    className="border-2 border-red-300 hover:bg-red-50 disabled:opacity-50 text-red-700 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete User
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Search and Filters */}
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Filter by Role</label>
                    <select
                      value={selectedRole || ''}
                      onChange={(e) => setSelectedRole(e.target.value || null)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Roles</option>
                      {roles.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Filter by Status</label>
                    <select
                      value={selectedStatus || ''}
                      onChange={(e) => setSelectedStatus(e.target.value || null)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Statuses</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left px-4 py-3 font-bold text-gray-700">Name</th>
                      <th className="text-left px-4 py-3 font-bold text-gray-700">Email</th>
                      <th className="text-left px-4 py-3 font-bold text-gray-700">Role</th>
                      <th className="text-left px-4 py-3 font-bold text-gray-700">Status</th>
                      <th className="text-left px-4 py-3 font-bold text-gray-700">Last Active</th>
                      <th className="text-left px-4 py-3 font-bold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{user.name}</td>
                        <td className="px-4 py-3 text-gray-600 text-sm">{user.email}</td>
                        <td className="px-4 py-3">
                          <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusColor[user.status]}`}>
                            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-sm">{user.lastActive}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 text-sm"
                          >
                            Details
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredUsers.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">No users found</p>
                </div>
              )}

              <div className="text-sm text-gray-600">
                Showing {filteredUsers.length} of {users.length} users
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUserManagementModal;
