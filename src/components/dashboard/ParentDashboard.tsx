"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from "@/lib/authStorage";
import { useParentChildren } from "@/hooks/useRoleDashboards";
import {
  User,
  TrendingUp,
  Award,
  BookOpen,
  AlertCircle,
  MessageSquare,
  Calendar,
  Bell,
  Loader,
  Plus,
  Eye,
  CheckCircle,
} from "lucide-react";
import {
  KPICard,
  ActionCard,
  InsightCard,
} from "@/components/dashboard/cards";
import { ChildProgressDetailModal } from "@/components/modals/ChildProgressDetailModal";
import { ChildAssignmentsModal } from "@/components/modals/ChildAssignmentsModal";
import { MessageModal } from "@/components/modals/MessageModal";
import { useToast } from "@/components/ui/Toast";

interface Child {
  id: string;
  name: string;
  createdAt: string;
}

interface ChildProgress {
  childId: string;
  childName: string;
  courseId: string;
  courseName: string;
  facilitatorName: string;
  facilitatorEmail: string;
  completionPercent: number;
  gradesCount: number;
  averageGrade?: number;
  status: "active" | "completed" | "pending";
  enrolledDate: string;
  dueAssignments: number;
}

interface Assignment {
  id: string;
  courseId: string;
  courseName: string;
  title: string;
  dueDate: string;
  status: "pending" | "submitted" | "graded";
  submittedDate?: string;
  grade?: number;
  feedback?: string;
}

export default function ParentDashboard() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const { data: parentData, loading, error } = useParentChildren();

  // Children management
  const [children, setChildren] = useState<Child[]>([]);
  const [childrenLoading, setChildrenLoading] = useState(true);
  
  // Progress tracking
  const [allChildProgress, setAllChildProgress] = useState<ChildProgress[]>([]);
  const [progressLoading, setProgressLoading] = useState(false);
  
  // Assignments tracking
  const [allAssignments, setAllAssignments] = useState<Assignment[]>([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  
  // Modal states
  const [selectedProgress, setSelectedProgress] = useState<ChildProgress | null>(null);
  const [showProgressDetailModal, setShowProgressDetailModal] = useState(false);
  
  const [selectedChildAssignments, setSelectedChildAssignments] = useState<Assignment[]>([]);
  const [selectedChildForAssignments, setSelectedChildForAssignments] = useState("");
  const [showAssignmentsModal, setShowAssignmentsModal] = useState(false);
  
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageRecipient, setMessageRecipient] = useState({ name: "", email: "" });

  const { success, error: errorToast } = useToast();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Load children on mount
  useEffect(() => {
    const loadChildren = async () => {
      setChildrenLoading(true);
      try {
        const response = await fetch("/api/parent/children", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(AUTH_TOKEN_KEY)}`,
          },
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setChildren(data.data || []);
          // Load all progress for all children
          if (data.data && data.data.length > 0) {
            await loadAllChildProgress(data.data);
            await loadAllAssignments(data.data);
          }
        } else {
          console.error("Failed to load children:", data.error);
        }
      } catch (err) {
        console.error("Error loading children:", err);
      } finally {
        setChildrenLoading(false);
      }
    };

    loadChildren();
  }, []);

  const loadAllChildProgress = async (childList: Child[]) => {
    setProgressLoading(true);
    try {
      const progressData: ChildProgress[] = [];

      for (const child of childList) {
        const response = await fetch(`/api/parent/children/${child.id}/progress`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(AUTH_TOKEN_KEY)}`,
          },
        });

        const data = await response.json();

        if (response.ok && data.success && data.data.courses) {
          progressData.push(...data.data.courses);
        }
      }

      setAllChildProgress(progressData);
    } catch (err) {
      console.error("Error loading progress:", err);
    } finally {
      setProgressLoading(false);
    }
  };

  const loadAllAssignments = async (childList: Child[]) => {
    setAssignmentsLoading(true);
    try {
      const allAssignmentsData: Assignment[] = [];

      for (const child of childList) {
        const response = await fetch(`/api/parent/children/${child.id}/assignments`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(AUTH_TOKEN_KEY)}`,
          },
        });

        const data = await response.json();

        if (response.ok && data.success) {
          allAssignmentsData.push(...(data.data || []));
        }
      }

      setAllAssignments(allAssignmentsData);
    } catch (err) {
      console.error("Error loading assignments:", err);
    } finally {
      setAssignmentsLoading(false);
    }
  };

  const handleViewChildProgress = (childProgress: ChildProgress) => {
    setSelectedProgress(childProgress);
    setShowProgressDetailModal(true);
  };

  const handleViewAssignments = (child: Child) => {
    setSelectedChildForAssignments(child.id);
    const childAssignments = allAssignments.filter(
      (a) => allAssignments.find((assignment) => {
        // Find assignments for this child by filtering the loaded data
        return a.courseId === assignment.courseId;
      })
    );
    setSelectedChildAssignments(
      allAssignments.filter((a) => a)
    );
    setShowAssignmentsModal(true);
  };

  const handleMessageFacilitator = (
    facilitatorEmail: string,
    facilitatorName: string,
    childName: string
  ) => {
    setMessageRecipient({
      name: `${facilitatorName} (Re: ${childName})`,
      email: facilitatorEmail,
    });
    setShowMessageModal(true);
  };

  const handleSendMessage = async (message: string, recipientEmail: string) => {
    try {
      const response = await fetch("/api/messages/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem(AUTH_TOKEN_KEY)}`,
        },
        body: JSON.stringify({
          recipientEmail,
          message,
          messageType: "PARENT_TO_FACILITATOR",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message");
      }
    } catch (err) {
      throw err;
    }
  };

  // Calculate dashboard metrics
  const totalChildren = children.length;
  const totalCourses = allChildProgress.length;
  const completedCourses = allChildProgress.filter((p) => p.status === "completed").length;
  const pendingAssignments = allAssignments.filter((a) => a.status === "pending").length;
  const averageProgress =
    allChildProgress.length > 0
      ? Math.round(allChildProgress.reduce((sum, p) => sum + p.completionPercent, 0) / allChildProgress.length)
      : 0;

  if (loading || childrenLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="p-8 flex flex-col items-center gap-4">
          <Loader className="w-8 h-8 animate-spin text-primary-600" />
          <p className="text-gray-300">Loading your children's data...</p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 border-l-4 border-red-500 bg-dark-700/50">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-red-900">Error Loading Dashboard</h3>
            <p className="text-red-700 mt-1">{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Try Again
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Show empty state if no children
  if (children.length === 0) {
    return (
      <div className="space-y-8 pb-12">
        <div
          className={`space-y-4 transition-all duration-700 transform ${
            isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          }`}
        >
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-2">
              Parent Dashboard 👨‍👩‍👧‍👦
            </h1>
            <p className="text-base sm:text-lg text-gray-300">
              Monitor your children's learning progress
            </p>
          </div>
        </div>

        <Card className="p-12 text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">No Children Linked</h3>
          <p className="text-gray-300 mb-6">
            Link your children's accounts to start monitoring their learning progress
          </p>
          <Button variant="primary" size="lg" className="gap-2">
            <Plus className="w-4 h-4" />
            Link Child Account
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div
        className={`space-y-4 transition-all duration-700 transform ${
          isVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10"
        }`}
      >
        <div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-2">
            Parent Dashboard 👨‍👩‍👧‍👦
          </h1>
          <p className="text-base sm:text-lg text-gray-300">
            Monitor {totalChildren} child{totalChildren > 1 ? "ren" : ""}'s learning progress across {totalCourses} courses
          </p>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard
          icon={User}
          label="Children"
          value={totalChildren}
          status="Monitoring"
          gradientFrom="from-primary-500"
          gradientTo="to-primary-600"
          borderColor="border-primary-400"
        />

        <ActionCard
          title="Pending Assignments"
          description={`${pendingAssignments} due across all courses`}
          icon={AlertCircle}
          primaryAction={{
            label: pendingAssignments > 0 ? "View All" : "None",
            onClick: () => {
              if (children.length > 0) {
                handleViewAssignments(children[0]);
              }
            },
          }}
        />

        <InsightCard
          title="Overall Progress"
          icon={TrendingUp}
          stats={[
            { label: "Courses", value: totalCourses },
            { label: "Completed", value: completedCourses },
            { label: "Avg Progress", value: `${averageProgress}%` },
          ]}
        >
          <p className="text-xs text-gray-400">
            {averageProgress > 75 ? "Excellent progress!" : averageProgress > 50 ? "Good pace" : "Need support"}
          </p>
        </InsightCard>
      </div>

      {/* Children Overview Cards */}
      {children.length > 0 && (
        <div className="space-y-6 pt-6 border-t border-dark-600">
          <h2 className="text-2xl font-bold text-white">Your Children</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {children.map((child) => {
              const childProgress = allChildProgress.filter(
                (p) => p.childId === child.id
              );
              const childAssignments = allAssignments.filter(
                (a) => childProgress.some((p) => p.courseId === a.courseId)
              );
              const avgProgress =
                childProgress.length > 0
                  ? Math.round(
                      childProgress.reduce((sum, p) => sum + p.completionPercent, 0) /
                        childProgress.length
                    )
                  : 0;
              const pendingCount = childAssignments.filter((a) => a.status === "pending").length;

              return (
                <Card key={child.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white">{child.name}</h3>
                      <p className="text-sm text-gray-400">{childProgress.length} enrolled courses</p>
                    </div>
                    <div className="text-2xl font-black text-primary-400">{avgProgress}%</div>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-2 bg-dark-600 rounded-full overflow-hidden mb-4">
                    <div
                      className="h-full bg-gradient-to-r from-primary-500 to-secondary-500"
                      style={{ width: `${avgProgress}%` }}
                    />
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                    <div className="bg-dark-700 p-2 rounded">
                      <p className="text-gray-400">Courses</p>
                      <p className="font-bold text-white mt-1">{childProgress.length}</p>
                    </div>
                    <div className="bg-dark-700 p-2 rounded">
                      <p className="text-gray-400">Pending</p>
                      <p className="font-bold text-yellow-400 mt-1">{pendingCount}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex-1 gap-1"
                      onClick={() => handleViewAssignments(child)}
                    >
                      <CheckCircle className="w-4 h-4" />
                      Assignments
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1"
                      onClick={() => {
                        if (childProgress.length > 0) {
                          handleViewChildProgress(childProgress[0]);
                        }
                      }}
                    >
                      <Eye className="w-4 h-4" />
                      Courses
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Child Progress Details */}
      {allChildProgress.length > 0 && (
        <div className="space-y-6 pt-6 border-t border-dark-600">
          <h2 className="text-2xl font-bold text-white">Course Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
            {allChildProgress.map((progress) => (
              <Card key={`${progress.childId}-${progress.courseId}`} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-xs text-gray-400">{progress.childName}</p>
                    <h4 className="font-semibold text-white">{progress.courseName}</h4>
                  </div>
                  <span className={`text-sm font-bold px-2 py-1 rounded ${
                    progress.completionPercent === 100
                      ? "bg-green-500/20 text-green-400"
                      : progress.completionPercent > 50
                      ? "bg-blue-500/20 text-blue-400"
                      : "bg-yellow-500/20 text-yellow-400"
                  }`}>
                    {progress.completionPercent}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                  <span>{progress.facilitatorName}</span>
                  {progress.dueAssignments > 0 && (
                    <span className="text-yellow-400 font-semibold">{progress.dueAssignments} due</span>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => handleViewChildProgress(progress)}
                >
                  View Details
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {selectedProgress && (
        <ChildProgressDetailModal
          isOpen={showProgressDetailModal}
          progress={selectedProgress}
          onClose={() => setShowProgressDetailModal(false)}
          onMessageFacilitator={handleMessageFacilitator}
        />
      )}

      <ChildAssignmentsModal
        isOpen={showAssignmentsModal}
        childName={children.find((c) => c.id === selectedChildForAssignments)?.name || "Child"}
        assignments={selectedChildAssignments}
        isLoading={assignmentsLoading}
        onClose={() => setShowAssignmentsModal(false)}
      />

      {messageRecipient.email && (
        <MessageModal
          isOpen={showMessageModal}
          recipientName={messageRecipient.name}
          recipientEmail={messageRecipient.email}
          context={{ type: "teacher", subject: "Child Update" }}
          onClose={() => setShowMessageModal(false)}
          onSendMessage={handleSendMessage}
        />
      )}
    </div>
  );
}
