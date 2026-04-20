"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { X, Users, Shield, Lock } from "lucide-react";

interface SchoolUser {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "PARENT" | "FACILITATOR" | "SCHOOL_ADMIN";
  status: "active" | "inactive";
  joinedDate: string;
  lastActive?: string;
}

interface Props {
  isOpen: boolean;
  users: SchoolUser[];
  onClose: () => void;
  onChangeRole?: (userId: string, newRole: SchoolUser["role"]) => Promise<void>;
  onToggleStatus?: (userId: string, newStatus: string) => Promise<void>;
  isProcessing?: boolean;
}

export function UserManagementModal({
  isOpen,
  users,
  onClose,
  onChangeRole,
  onToggleStatus,
  isProcessing = false,
}: Props) {
  const [filterRole, setFilterRole] = useState<SchoolUser["role"] | "ALL">("ALL");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [newRole, setNewRole] = useState<SchoolUser["role"]>("STUDENT");

  if (!isOpen) return null;

  const filtered =
    filterRole === "ALL"
      ? users
      : users.filter((u) => u.role === filterRole);

  const selected = users.find((u) => u.id === selectedUserId);

  const handleChangeRole = async () => {
    if (!selectedUserId || !onChangeRole) return;
    try {
      await onChangeRole(selectedUserId, newRole);
      setSelectedUserId(null);
    } catch (error) {
      console.error("Error changing role:", error);
    }
  };

  const handleToggleStatus = async () => {
    if (!selectedUserId || !onToggleStatus) return;
    try {
      const newStatus = selected?.status === "active" ? "inactive" : "active";
      await onToggleStatus(selectedUserId, newStatus);
    } catch (error) {
      console.error("Error changing status:", error);
    }
  };

  const roleStats = {
    STUDENT: users.filter((u) => u.role === "STUDENT").length,
    PARENT: users.filter((u) => u.role === "PARENT").length,
    FACILITATOR: users.filter((u) => u.role === "FACILITATOR").length,
    SCHOOL_ADMIN: users.filter((u) => u.role === "SCHOOL_ADMIN").length,
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-5xl max-h-[90vh] overflow-hidden bg-dark-800 border-dark-600">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-600 sticky top-0 bg-dark-800">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-primary-400" />
              School User Management
            </h3>
            <p className="text-sm text-gray-400">{users.length} user{users.length !== 1 ? "s" : ""}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 h-[calc(90vh-120px)] gap-4 p-6 overflow-hidden">
          {/* Role Filters & Stats */}
          <div className="lg:col-span-1 space-y-4 overflow-y-auto">
            <div>
              <h4 className="font-semibold text-white mb-2">Filter by Role</h4>
              <div className="space-y-2">
                {[
                  { label: "All Users", value: "ALL" },
                  { label: `Students (${roleStats.STUDENT})`, value: "STUDENT" },
                  { label: `Parents (${roleStats.PARENT})`, value: "PARENT" },
                  { label: `Facilitators (${roleStats.FACILITATOR})`, value: "FACILITATOR" },
                  { label: `Admins (${roleStats.SCHOOL_ADMIN})`, value: "SCHOOL_ADMIN" },
                ].map((role) => (
                  <button
                    key={role.value}
                    onClick={() => setFilterRole(role.value as any)}
                    className={`w-full text-left px-3 py-2 rounded transition ${
                      filterRole === role.value
                        ? "bg-primary-500/20 border border-primary-500 text-white"
                        : "bg-dark-700 border border-dark-600 text-gray-400 hover:border-primary-500"
                    }`}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Users List */}
          <div className="lg:col-span-1 border-l border-dark-600 pl-4 overflow-y-auto">
            <div className="space-y-2">
              {filtered.map((user) => (
                <button
                  key={user.id}
                  onClick={() => setSelectedUserId(user.id)}
                  className={`w-full text-left p-3 rounded border transition ${
                    selectedUserId === user.id
                      ? "bg-primary-500/20 border-primary-500"
                      : "bg-dark-700 border-dark-600 hover:border-primary-500"
                  }`}
                >
                  <p className="font-semibold text-white text-sm">{user.name}</p>
                  <p className="text-xs text-gray-400">{user.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      user.status === "active"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}>
                      {user.status}
                    </span>
                    <span className="text-xs text-gray-500">{user.role}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Details & Actions */}
          {selected ? (
            <div className="lg:col-span-1 border-l border-dark-600 pl-4 overflow-y-auto space-y-4">
              <div>
                <h4 className="font-bold text-white mb-3">{selected.name}</h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-400">Email</p>
                    <p className="text-white">{selected.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Current Role</p>
                    <p className="text-white font-semibold">{selected.role}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Status</p>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                      selected.status === "active"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}>
                      {selected.status.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-400">Joined</p>
                    <p className="text-white text-xs">
                      {new Date(selected.joinedDate).toLocaleDateString()}
                    </p>
                  </div>
                  {selected.lastActive && (
                    <div>
                      <p className="text-gray-400">Last Active</p>
                      <p className="text-white text-xs">
                        {new Date(selected.lastActive).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Change Role */}
              <div className="border-t border-dark-600 pt-4">
                <label className="block text-sm font-semibold text-white mb-2">
                  Change Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="w-full bg-dark-700 text-white border border-dark-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
                >
                  <option value="STUDENT">Student</option>
                  <option value="PARENT">Parent</option>
                  <option value="FACILITATOR">Facilitator</option>
                  <option value="SCHOOL_ADMIN">School Admin</option>
                </select>
                <Button
                  variant="primary"
                  className="w-full mt-2"
                  onClick={handleChangeRole}
                  disabled={isProcessing || newRole === selected.role}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Update Role
                </Button>
              </div>

              {/* Toggle Status */}
              <Button
                variant={selected.status === "active" ? "danger" : "primary"}
                className="w-full gap-2"
                onClick={handleToggleStatus}
                disabled={isProcessing}
              >
                <Lock className="w-4 h-4" />
                {selected.status === "active" ? "Deactivate" : "Activate"} User
              </Button>
            </div>
          ) : (
            <div className="lg:col-span-1 border-l border-dark-600 pl-4 flex items-center justify-center">
              <p className="text-center text-gray-400">
                Select a user to view and manage details
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
