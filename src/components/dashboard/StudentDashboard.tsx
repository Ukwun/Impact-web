"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from "@/lib/authStorage";
import {
  BookOpen,
  TrendingUp,
  CheckCircle,
  Award,
  Clock,
  AlertCircle,
  Loader,
  Eye,
} from "lucide-react";
import { KPICard, InsightCard } from "@/components/dashboard/cards";
import { AssignmentDetailModal } from "@/components/modals/AssignmentDetailModal";
import { StudentProgressModal } from "@/components/modals/StudentProgressModal";

interface CourseProgress {
  courseId: string;
  courseName: string;
  facilitatorName: string;
  completionPercent: number;
  lessonsCompleted: number;
  lessonsTotal: number;
  assignmentsSubmitted: number;
  assignmentsTotal: number;
  averageGrade?: number;
  status: "active" | "completed" | "pending";
  enrolledDate: string;
}

interface Assignment {
  id: string;
  title: string;
  courseId: string;
  courseName: string;
  dueDate: string;
  pointsTotal: number;
  submitted: boolean;
  graded: boolean;
  status: "pending" | "submitted" | "graded";
}

interface DashboardData {
  student: {
    name: string;
    email: string;
    avatar?: string;
  };
  courses: CourseProgress[];
  assignments: Assignment[];
  stats: {
    totalCourses: number;
    activeCourses: number;
    completedCourses: number;
    avgProgress: number;
    pendingCount: number;
    submittedCount: number;
    gradedCount: number;
  };
}

export default function StudentDashboard() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const { success, error: errorToast } = useToast();

  // Dashboard data
  const [data, setData] = useState<DashboardData | null>(null);

  // Modal states
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<CourseProgress | null>(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/student/dashboard", {
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
        success("Dashboard loaded successfully");
      }
    } catch (err) {
      console.error("Error loading dashboard:", err);
      errorToast("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleViewAssignment = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setShowAssignmentModal(true);
  };

  const handleViewCourseProgress = (course: CourseProgress) => {
    setSelectedCourse(course);
    setShowProgressModal(true);
  };

  const handleSubmitAssignment = async (
    assignmentId: string,
    content: string,
    fileUrl?: string
  ) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/student/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem(AUTH_TOKEN_KEY)}`,
        },
        body: JSON.stringify({
          assignmentId,
          content,
          fileUrl,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit assignment");
      }

      success("Assignment submitted successfully!");
      await loadDashboardData();
    } catch (err) {
      console.error("Error submitting assignment:", err);
      errorToast("Failed to submit assignment");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Card className="p-12 flex flex-col items-center gap-4 animate-fade-in">
          <Loader className="w-10 h-10 animate-spin text-primary-500" />
          <p className="text-gray-300 text-lg">Loading your dashboard...</p>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <Card className="p-8 border-l-4 border-danger-500 bg-danger-500/10">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-7 h-7 text-danger-400 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-danger-400 text-lg">Error Loading Dashboard</h3>
            <p className="text-gray-300 mt-2">Failed to load your dashboard data</p>
            <Button onClick={loadDashboardData} className="mt-4">
              Try Again
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  const pendingAssignments = data.assignments.filter((a) => a.status === "pending");
  const recentAssignments = [...data.assignments]
    .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div
        className={`space-y-4 transition-all duration-700 transform ${
          isVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10"
        }`}
      >
        <div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-2">
            Welcome, {data.student.name || "Student"}! 🎓
          </h1>
          <p className="text-base sm:text-lg text-gray-300">
            Track your courses, submit assignments, and monitor your progress.
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard
            label="Active Courses"
            value={data.stats.activeCourses}
            icon={BookOpen}
            trend={`${data.stats.totalCourses} total`}
          />
          <KPICard
            label="Avg Progress"
            value={`${data.stats.avgProgress}%`}
            icon={TrendingUp}
          />
          <KPICard
            label="Pending"
            value={data.stats.pendingCount}
            icon={Clock}
            color="warning"
          />
          <KPICard
            label="Graded"
            value={data.stats.gradedCount}
            icon={CheckCircle}
            color="success"
          />
        </div>
      </div>

      {/* Pending Assignments Alert */}
      {pendingAssignments.length > 0 && (
        <Card className="p-4 border-l-4 border-yellow-500 bg-yellow-500/10">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-yellow-400">
                You have {pendingAssignments.length} pending assignment{pendingAssignments.length !== 1 ? "s" : ""}
              </p>
              <p className="text-sm text-gray-300 mt-1">
                {pendingAssignments[0].title} is due on {new Date(pendingAssignments[0].dueDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Recent Assignments */}
      {recentAssignments.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Your Assignments</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentAssignments.map((assignment) => (
              <Card key={assignment.id} className="p-4 hover:border-primary-500 transition-colors cursor-pointer"
                onClick={() => handleViewAssignment(assignment)}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white text-sm">{assignment.title}</h3>
                      <p className="text-xs text-gray-400">{assignment.courseName}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded font-semibold ${
                      assignment.status === "pending"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : assignment.status === "submitted"
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-green-500/20 text-green-400"
                    }`}>
                      {assignment.status === "pending" ? "📝 Pending" : assignment.status === "submitted" ? "✓ Submitted" : "✓ Graded"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">Due: {new Date(assignment.dueDate).toLocaleDateString()}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Your Courses */}
      {data.courses.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Your Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.courses.map((course) => (
              <Card key={course.courseId} className="p-4 hover:border-primary-500 transition-colors">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-white">{course.courseName}</h3>
                    <p className="text-xs text-gray-400">Facilitator: {course.facilitatorName}</p>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-300">Progress</span>
                      <span className="text-xs font-bold text-primary-400">{course.completionPercent}%</span>
                    </div>
                    <div className="w-full bg-dark-700 rounded-full h-2">
                      <div
                        className="bg-primary-500 h-2 rounded-full"
                        style={{ width: `${course.completionPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-dark-700 p-2 rounded">
                      <p className="text-gray-400">Lessons</p>
                      <p className="font-bold text-white">{course.lessonsCompleted}/{course.lessonsTotal}</p>
                    </div>
                    <div className="bg-dark-700 p-2 rounded">
                      <p className="text-gray-400">Assignments</p>
                      <p className="font-bold text-white">{course.assignmentsSubmitted}/{course.assignmentsTotal}</p>
                    </div>
                    {course.averageGrade !== undefined && (
                      <div className="bg-dark-700 p-2 rounded">
                        <p className="text-gray-400">Grade</p>
                        <p className="font-bold text-white">{course.averageGrade}%</p>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleViewCourseProgress(course)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {selectedAssignment && (
        <AssignmentDetailModal
          isOpen={showAssignmentModal}
          assignment={{
            ...selectedAssignment,
            description: "Assignment instructions",
            pointsTotal: selectedAssignment.pointsTotal,
          } as any}
          onClose={() => setShowAssignmentModal(false)}
          onSubmit={handleSubmitAssignment}
          isSubmitting={isSubmitting}
        />
      )}

      {selectedCourse && (
        <StudentProgressModal
          isOpen={showProgressModal}
          progress={selectedCourse}
          onClose={() => setShowProgressModal(false)}
        />
      )}
    </div>
  );
}
