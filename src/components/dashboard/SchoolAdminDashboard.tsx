"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { FacilitatorApprovalModal } from "@/components/modals/FacilitatorApprovalModal";
import { StudentRosterModal } from "@/components/modals/StudentRosterModal";
import { SchoolSubscriptionDashboard } from "@/components/SchoolSubscriptionDashboard";
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from "@/lib/authStorage";
import {
  Users,
  BookOpen,
  BarChart3,
  Loader,
  AlertCircle,
  Settings,
  CheckCircle2,
  Clock,
} from "lucide-react";

interface SchoolStats {
  totalStudents: number;
  totalFacilitators: number;
  totalCourses: number;
  averageCompletion: number;
  schoolHealth: number; // 0-100%
}

interface PendingApproval {
  id: string;
  userName: string;
  role: string;
  registeredAt: string;
}

interface CourseMetric {
  title: string;
  enrollment: number;
  completion: number;
}

interface SchoolAdminDashboardData {
  schoolName: string;
  stats: SchoolStats;
  pendingApprovals: PendingApproval[];
  topCourses: CourseMetric[];
}

export default function SchoolAdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<SchoolAdminDashboardData | null>(null);
  const { success, error: errorToast } = useToast();
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRosterModal, setShowRosterModal] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/school/dashboard", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(AUTH_TOKEN_KEY)}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem(AUTH_TOKEN_KEY);
          localStorage.removeItem(AUTH_USER_KEY);
          router.push("/auth/login?error=invalid_token");
          return;
        }
        throw new Error("Failed to load dashboard");
      }

      const result = await response.json();
      if (result.success) {
        setData(result.data);
        success("Dashboard loaded");
      }
    } catch (err) {
      console.error("Error loading dashboard:", err);
      errorToast("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader className="w-10 h-10 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!data) {
    return (
      <Card className="p-8 border-l-4 border-danger-500 bg-danger-500/10">
        <AlertCircle className="w-6 h-6 text-danger-400 mb-2" />
        <p className="text-danger-400">Failed to load dashboard</p>
        <Button onClick={loadDashboardData} className="mt-4">Try Again</Button>
      </Card>
    );
  }

  const healthColor = data.stats.schoolHealth >= 80 ? 'text-green-400' : data.stats.schoolHealth >= 60 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-black text-white mb-2">🏫 {data.schoolName}</h1>
          <p className="text-gray-300">Institutional Learning Management</p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="p-4">
            <p className="text-gray-400 text-xs font-semibold">Students</p>
            <p className="text-2xl font-black text-blue-400 mt-2">{data.stats.totalStudents}</p>
          </Card>
          <Card className="p-4">
            <p className="text-gray-400 text-xs font-semibold">Instructors</p>
            <p className="text-2xl font-black text-purple-400 mt-2">{data.stats.totalFacilitators}</p>
          </Card>
          <Card className="p-4">
            <p className="text-gray-400 text-xs font-semibold">Courses</p>
            <p className="text-2xl font-black text-green-400 mt-2">{data.stats.totalCourses}</p>
          </Card>
          <Card className="p-4">
            <p className="text-gray-400 text-xs font-semibold">Completion</p>
            <p className="text-2xl font-black text-yellow-400 mt-2">{data.stats.averageCompletion}%</p>
          </Card>
          <Card className="p-4">
            <p className="text-gray-400 text-xs font-semibold">Health</p>
            <p className={`text-2xl font-black mt-2 ${healthColor}`}>{data.stats.schoolHealth}%</p>
          </Card>
        </div>
      </div>

      {/* Pending User Approvals */}
      {data.pendingApprovals.length > 0 && (
        <Card className="p-6 border-l-4 border-blue-500 bg-blue-500/10">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-blue-400 font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Pending User Approvals
              </p>
              <p className="text-2xl font-black text-white mt-2">{data.pendingApprovals.length}</p>
              <p className="text-sm text-gray-300 mt-1">New registrations awaiting approval</p>
            </div>
            <Button onClick={() => setShowApprovalModal(true)}>Review & Approve</Button>
          </div>

          {/* List */}
          <div className="mt-4 space-y-2">
            {data.pendingApprovals.slice(0, 5).map((approval, idx) => (
              <div key={idx} className="text-xs bg-dark-700 p-2 rounded flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold">{approval.userName}</p>
                  <p className="text-gray-400">{approval.role} • {new Date(approval.registeredAt).toLocaleDateString()}</p>
                </div>
                <Button variant="secondary" size="sm">Approve</Button>
              </div>
            ))}
            {data.pendingApprovals.length > 5 && (
              <p className="text-xs text-gray-400 pt-2">+{data.pendingApprovals.length - 5} more</p>
            )}
          </div>
        </Card>
      )}

      {/* Users Management */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Users className="w-6 h-6" />
          User Management
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 hover:border-primary-500 transition-colors cursor-pointer" onClick={() => setShowRosterModal(true)}>
            <Users className="w-8 h-8 text-blue-400 mb-3" />
            <h3 className="font-semibold text-white">View All Users</h3>
            <p className="text-xs text-gray-400 mt-2">Manage active users</p>
          </Card>
          <Card className="p-6 hover:border-primary-500 transition-colors cursor-pointer" onClick={() => setShowApprovalModal(true)}>
            <CheckCircle2 className="w-8 h-8 text-green-400 mb-3" />
            <h3 className="font-semibold text-white">Review Approvals</h3>
            <p className="text-xs text-gray-400 mt-2">{data.pendingApprovals.length} pending</p>
          </Card>
          <Card className="p-6 hover:border-primary-500 transition-colors cursor-pointer">
            <Settings className="w-8 h-8 text-purple-400 mb-3" />
            <h3 className="font-semibold text-white">School Settings</h3>
            <p className="text-xs text-gray-400 mt-2">Configure school</p>
          </Card>
        </div>
      </div>

      {/* Top Courses in School */}
      {data.topCourses.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            Top Courses
          </h2>

          <div className="space-y-3">
            {data.topCourses.map((course, idx) => (
              <Card key={idx} className="p-4 hover:border-primary-500 transition-colors">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-white">{course.title}</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-400">Enrollment</p>
                      <p className="font-bold text-white">{course.enrollment} students</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Completion</p>
                      <p className="font-bold text-white">{course.completion}%</p>
                      <div className="w-full bg-dark-700 rounded-full h-1.5 mt-1">
                        <div
                          className="bg-primary-500 h-full rounded-full"
                          style={{ width: `${course.completion}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Institutional Reports */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-6 h-6" />
          Reports
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-6 hover:border-primary-500 transition-colors cursor-pointer">
            <h3 className="font-semibold text-white mb-2">Student Performance</h3>
            <p className="text-xs text-gray-400">School-wide learning analytics</p>
          </Card>
          <Card className="p-6 hover:border-primary-500 transition-colors cursor-pointer">
            <h3 className="font-semibold text-white mb-2">Attendance & Engagement</h3>
            <p className="text-xs text-gray-400">User participation metrics</p>
          </Card>
        </div>
      </div>

      {/* 💳 Subscription & Licensing Management */}
      <div className="space-y-6 pt-8 border-t border-gray-700">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-2">
            💳 Subscription & Licensing
          </h2>
          <p className="text-gray-400">Manage your school's ImpactEdu subscription, users, and billing</p>
        </div>
        <SchoolSubscriptionDashboard userId={data?.schoolName} />
      </div>

      {/* Modals */}
      <FacilitatorApprovalModal
        isOpen={showApprovalModal}
        onClose={() => setShowApprovalModal(false)}
        onApprove={(facilitatorId: string) => {
          console.log("Approved facilitator:", facilitatorId);
          setShowApprovalModal(false);
          loadDashboardData();
        }}
      />
      <StudentRosterModal
        isOpen={showRosterModal}
        onClose={() => setShowRosterModal(false)}
      />
    </div>
  );
}
