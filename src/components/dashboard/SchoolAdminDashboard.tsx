"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AUTH_TOKEN_KEY } from "@/lib/authStorage";
import { FacilitatorApprovalModal } from "@/components/modals/FacilitatorApprovalModal";
import { SchoolReportsModal } from "@/components/modals/SchoolReportsModal";
import { UserManagementModal } from "@/components/modals/UserManagementModal";
import {
  Building2,
  Users,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  FileText,
  Loader,
  Clock,
  BarChart3,
} from "lucide-react";

interface DashboardMetrics {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  pendingApprovals: number;
  activeFacilitators: number;
}

interface PendingFacilitator {
  id: string;
  name: string;
  email: string;
  qualifications: string[];
  dateApplied: string;
  status: "PENDING";
}

interface SchoolUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  enrollmentCount: number;
}

export default function SchoolAdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [pendingFacilitators, setPendingFacilitators] = useState<PendingFacilitator[]>([]);
  const [schoolUsers, setSchoolUsers] = useState<SchoolUser[]>([]);

  // Modal states
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [showUserManagementModal, setShowUserManagementModal] = useState(false);

  // Load dashboard data on mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = typeof window !== "undefined" ? localStorage.getItem(AUTH_TOKEN_KEY) : null;
      if (!token) {
        setError("Authentication required");
        return;
      }

      // Fetch dashboard metrics
      const metricsRes = await fetch("/api/school-admin/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (metricsRes.ok) {
        const data = await metricsRes.json();
        setMetrics(data.data);
      } else if (metricsRes.status === 401) {
        setError("Session expired. Please log in again.");
      }

      // Fetch pending facilitators
      const pendingRes = await fetch("/api/school-admin/facilitators/pending", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (pendingRes.ok) {
        const data = await pendingRes.json();
        setPendingFacilitators(data.data || []);
      }

      // Fetch school users
      const usersRes = await fetch("/api/school-admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (usersRes.ok) {
        const data = await usersRes.json();
        setSchoolUsers(data.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveFacilitator = async (facilitatorId: string) => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem(AUTH_TOKEN_KEY) : null;
      if (!token) return;

      const res = await fetch(`/api/school-admin/facilitators/${facilitatorId}/approve`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        // Reload pending facilitators list
        await loadDashboardData();
      }
    } catch (err) {
      console.error("Approval error:", err);
    }
  };

  const handleRejectFacilitator = async (facilitatorId: string) => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem(AUTH_TOKEN_KEY) : null;
      if (!token) return;

      const res = await fetch(`/api/school-admin/facilitators/${facilitatorId}/reject`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        // Reload pending facilitators list
        await loadDashboardData();
      }
    } catch (err) {
      console.error("Rejection error:", err);
    }
  };

  const handleGenerateReport = async (reportType: string) => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem(AUTH_TOKEN_KEY) : null;
      if (!token) return;

      const res = await fetch(`/api/school-admin/reports?type=${reportType}&format=csv`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${reportType}-report-${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error("Report generation error:", err);
    }
  };

  const handleUpdateUserStatus = async (userId: string, status: string) => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem(AUTH_TOKEN_KEY) : null;
      if (!token) return;

      const res = await fetch("/api/school-admin/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, status }),
      });

      if (res.ok) {
        // Reload users list
        await loadDashboardData();
      }
    } catch (err) {
      console.error("User update error:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 flex flex-col items-center gap-4">
          <Loader className="w-8 h-8 animate-spin text-primary-600" />
          <p className="text-gray-400">Loading dashboard...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-white">School Admin Dashboard</h1>
        <p className="text-gray-400">Manage your school, approve educators, and generate reports</p>
      </div>

      {/* Error Alert */}
      {error && (
        <Card className="p-6 border-l-4 border-danger-500">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-danger-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-danger-400 text-lg">Error Loading Dashboard</h3>
              <p className="text-danger-300 mt-2">{error}</p>
              <Button onClick={loadDashboardData} className="mt-4" variant="secondary">
                Try Again
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 border-l-4 border-primary-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Total Users</p>
              <p className="text-3xl font-bold text-white">{metrics?.totalUsers || 0}</p>
            </div>
            <Users className="w-8 h-8 text-primary-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-success-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Active Facilitators</p>
              <p className="text-3xl font-bold text-white">{metrics?.activeFacilitators || 0}</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-success-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-warning-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Pending Approvals</p>
              <p className="text-3xl font-bold text-white">{pendingFacilitators.length}</p>
            </div>
            <Clock className="w-8 h-8 text-warning-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-info-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Total Courses</p>
              <p className="text-3xl font-bold text-white">{metrics?.totalCourses || 0}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-info-500 opacity-50" />
          </div>
        </Card>
      </div>

      {/* Main Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Facilitator Approvals Card */}
        <Card className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-white text-lg">Facilitator Approvals</h3>
              <p className="text-sm text-gray-400 mt-1">
                {pendingFacilitators.length} pending {pendingFacilitators.length === 1 ? "request" : "requests"}
              </p>
            </div>
            <Clock className="w-6 h-6 text-warning-500" />
          </div>
          <Button
            onClick={() => setShowApprovalModal(true)}
            className="w-full"
            variant={pendingFacilitators.length > 0 ? "primary" : "secondary"}
          >
            {pendingFacilitators.length > 0 ? "Review Requests" : "No Pending Requests"}
          </Button>
        </Card>

        {/* Reports Card */}
        <Card className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-white text-lg">Generate Reports</h3>
              <p className="text-sm text-gray-400 mt-1">Enrollment, progress, and performance</p>
            </div>
            <FileText className="w-6 h-6 text-info-500" />
          </div>
          <Button onClick={() => setShowReportsModal(true)} className="w-full" variant="secondary">
            Create Report
          </Button>
        </Card>

        {/* User Management Card */}
        <Card className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-white text-lg">User Management</h3>
              <p className="text-sm text-gray-400 mt-1">{schoolUsers.length} school members</p>
            </div>
            <Users className="w-6 h-6 text-primary-500" />
          </div>
          <Button onClick={() => setShowUserManagementModal(true)} className="w-full" variant="secondary">
            Manage Users
          </Button>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6 space-y-4">
        <h3 className="font-bold text-white text-lg">Quick Stats</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-400">Total Enrollments</p>
            <p className="text-2xl font-bold text-white mt-1">{metrics?.totalEnrollments || 0}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Active Users</p>
            <p className="text-2xl font-bold text-white mt-1">
              {schoolUsers.filter((u) => u.status === "ACTIVE").length}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Inactive Users</p>
            <p className="text-2xl font-bold text-white mt-1">
              {schoolUsers.filter((u) => u.status === "INACTIVE").length}
            </p>
          </div>
        </div>
      </Card>

      {/* Modals */}
      <FacilitatorApprovalModal
        isOpen={showApprovalModal}
        pendingFacilitators={pendingFacilitators}
        onClose={() => setShowApprovalModal(false)}
        onApprove={handleApproveFacilitator}
        onReject={handleRejectFacilitator}
      />

      <SchoolReportsModal isOpen={showReportsModal} onClose={() => setShowReportsModal(false)} onGenerateReport={handleGenerateReport} />

      <UserManagementModal
        isOpen={showUserManagementModal}
        users={schoolUsers}
        onClose={() => setShowUserManagementModal(false)}
        onUpdateUser={handleUpdateUserStatus}
      />
    </div>
  );
}
