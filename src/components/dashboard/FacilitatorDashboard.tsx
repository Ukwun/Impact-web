"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from "@/lib/authStorage";
import {
  Users,
  BookOpen,
  TrendingUp,
  AlertCircle,
  Activity,
  MessageSquare,
  CheckCircle,
  Clock,
  Loader,
  Plus,
  Edit2,
  Trash2,
  Clipboard,
} from "lucide-react";
import { useFacilitatorClasses } from "@/hooks/useRoleDashboards";
import {
  KPICard,
  ActionCard,
  InsightCard,
} from "@/components/dashboard/cards";
import { CreateCourseModal } from "@/components/modals/CreateCourseModal";
import { EditCourseModal } from "@/components/modals/EditCourseModal";
import { DeleteConfirmModal } from "@/components/modals/DeleteConfirmModal";
import { GradeSubmissionModal } from "@/components/modals/GradeSubmissionModal";
import { StudentRosterModal } from "@/components/modals/StudentRosterModal";
import { MessageModal } from "@/components/modals/MessageModal";
import { useToast } from "@/components/ui/Toast";

interface Course {
  id: string;
  title: string;
  description: string;
  category?: string;
  level?: string;
  estimatedHours?: number;
  maxStudents?: number;
  isPublished?: boolean;
  createdAt?: string;
}

interface Submission {
  id: string;
  studentName: string;
  studentEmail: string;
  assignmentTitle: string;
  submittedAt: string;
  grade?: number;
  feedback?: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
  enrollmentDate: string;
  submissionsCount?: number;
  averageGrade?: number;
}

export default function FacilitatorDashboard() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);
  const [showEditCourseModal, setShowEditCourseModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [showRosterModal, setShowRosterModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  
  const [students, setStudents] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  
  const [messageRecipient, setMessageRecipient] = useState({ name: "", email: "" });
  
  const { data: classesData, loading: classesLoading, error: classesError } = useFacilitatorClasses();
  const { success, error: errorToast } = useToast();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Handle invalid token errors
  useEffect(() => {
    if (classesError && (classesError.toLowerCase().includes("invalid token") || classesError.includes("401"))) {
      console.error("❌ Invalid token detected, clearing auth and redirecting to login");
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
      router.push("/auth/login?error=invalid_token");
    }
  }, [classesError, router]);

  // Load courses on mount
  useEffect(() => {
    const loadCourses = async () => {
      setCoursesLoading(true);
      try {
        const response = await fetch("/api/courses", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(AUTH_TOKEN_KEY)}`,
          },
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setCourses(data.data || []);
        } else {
          console.error("Failed to load courses:", data.error);
        }
      } catch (err) {
        console.error("Error loading courses:", err);
      } finally {
        setCoursesLoading(false);
      }
    };

    loadCourses();
  }, []);

  // Load pending submissions
  useEffect(() => {
    const loadSubmissions = async () => {
      setSubmissionsLoading(true);
      try {
        const response = await fetch("/api/facilitator/submissions", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(AUTH_TOKEN_KEY)}`,
          },
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setSubmissions(data.data || []);
        } else {
          console.error("Failed to load submissions:", data.error);
        }
      } catch (err) {
        console.error("Error loading submissions:", err);
      } finally {
        setSubmissionsLoading(false);
      }
    };

    loadSubmissions();
  }, []);

  const handleLoadStudents = async (courseId: string) => {
    setStudentsLoading(true);
    try {
      const response = await fetch(`/api/facilitator/classes/${courseId}/students`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(AUTH_TOKEN_KEY)}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStudents(data.data || []);
      } else {
        errorToast("Error", data.error || "Failed to load students");
      }
    } catch (err) {
      errorToast("Error", err instanceof Error ? err.message : "Failed to load students");
    } finally {
      setStudentsLoading(false);
    }
  };

  const handleGradeSubmission = async (submissionId: string, grade: number, feedback: string) => {
    try {
      const response = await fetch(`/api/facilitator/submissions/${submissionId}/grade`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem(AUTH_TOKEN_KEY)}`,
        },
        body: JSON.stringify({ grade, feedback }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save grade");
      }

      // Remove from submissions list
      setSubmissions((prev) => prev.filter((s) => s.id !== submissionId));
      setShowGradeModal(false);
      setSelectedSubmission(null);
    } catch (err) {
      throw err;
    }
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
          messageType: "FACILITATOR_TO_STUDENT",
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

  const handleDeleteCourse = async () => {
    if (!selectedCourse) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/courses/${selectedCourse.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem(AUTH_TOKEN_KEY)}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete course");
      }

      success("Course Deleted", `"${selectedCourse.title}" has been archived`);
      setCourses((prev) => prev.filter((c) => c.id !== selectedCourse.id));
      setShowDeleteModal(false);
      setSelectedCourse(null);
    } catch (err) {
      errorToast("Error", err instanceof Error ? err.message : "Failed to delete course");
    } finally {
      setIsDeleting(false);
    }
  };

  const teachingMetrics = classesData
    ? {
        totalStudents: classesData.classes.reduce((acc, c) => acc + c.totalStudents, 0),
        activeClasses: classesData.classes.length,
        avgEngagement: Math.round(
          classesData.classes.reduce((acc, c) => acc + c.averageProgress, 0) /
            (classesData.classes.length || 1)
        ),
        assignmentsPending: classesData.classes.reduce(
          (acc, c) => acc + (c.totalAssignments - c.submittedAssignments),
          0
        ),
      }
    : {
        totalStudents: 0,
        activeClasses: 0,
        avgEngagement: 0,
        assignmentsPending: 0,
      };

  if (classesLoading || coursesLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="p-8 flex flex-col items-center gap-4">
          <Loader className="w-8 h-8 animate-spin text-primary-600" />
          <p className="text-gray-300">Loading your classes and courses...</p>
        </Card>
      </div>
    );
  }

  if (classesError) {
    // If it's a token error, show loading while redirecting
    if (classesError.toLowerCase().includes("invalid token") || classesError.includes("401")) {
      return (
        <div className="flex items-center justify-center h-96">
          <Card className="p-6 flex flex-col items-center gap-4">
            <Loader className="w-8 h-8 animate-spin text-primary-600" />
            <p className="text-gray-300">Redirecting to login...</p>
          </Card>
        </div>
      );
    }

    // For other errors, show error message with retry option
    return (
      <Card className="p-6 border-l-4 border-red-500 bg-dark-700/50">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-red-900">Error Loading Dashboard</h3>
            <p className="text-red-700 mt-1">{classesError}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Try Again
            </Button>
          </div>
        </div>
      </Card>
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
            Facilitator Dashboard 👨‍🏫
          </h1>
          <p className="text-base sm:text-lg text-gray-300">
            Manage classes, review assignments, and track student success
          </p>
        </div>
      </div>

      {/* TOP ROW: Status, Next Action, Progress (3 cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CARD 1: Today's Classes - Status */}
        <KPICard
          icon={BookOpen}
          label="Active Classes"
          value={teachingMetrics.activeClasses}
          status="In Session"
          gradientFrom="from-primary-500"
          gradientTo="to-primary-600"
          borderColor="border-primary-400"
        />

        {/* CARD 2: Pending Submissions - Next Action */}
        <ActionCard
          title="Submissions to Grade"
          description={`${submissions.length} awaiting your feedback`}
          icon={Clipboard}
          primaryAction={{
            label: submissions.length > 0 ? "Grade Now" : "No Pending",
            onClick: () => {
              if (submissions.length > 0) {
                setSelectedSubmission(submissions[0]);
                setShowGradeModal(true);
              }
            },
          }}
        />

        {/* CARD 3: Engagement Overview - Progress Insight */}
        <InsightCard
          title="Class Engagement"
          icon={TrendingUp}
          stats={[
            { label: "Students", value: teachingMetrics.totalStudents },
            { label: "Avg Progress", value: `${teachingMetrics.avgEngagement}%` },
            { label: "Active", value: teachingMetrics.activeClasses },
          ]}
        >
          <p className="text-xs text-gray-400">
            {teachingMetrics.avgEngagement > 75 ? "Excellent engagement" : teachingMetrics.avgEngagement > 50 ? "Good progress" : "Needs attention"}
          </p>
        </InsightCard>
      </div>

      {/* CARD 4: View Class Roster */}
      <ActionCard
        title="Manage Class Roster"
        description={`${teachingMetrics.totalStudents} students across ${teachingMetrics.activeClasses} classes`}
        icon={Users}
        primaryAction={{
          label: "View Roster",
          onClick: () => {
            if (courses.length > 0) {
              handleLoadStudents(courses[0].id);
              setShowRosterModal(true);
            } else {
              errorToast("Info", "Create a class first to view roster");
            }
          },
        }}
        variant="secondary"
      />

      {/* CARD 5: Student Alerts & Needs */}
      <ActionCard
        title="Student Alerts"
        description={`${Math.max(0, teachingMetrics.totalStudents - teachingMetrics.activeClasses)} students may need support`}
        icon={AlertCircle}
        primaryAction={{
          label: "View Details",
          onClick: () => console.log("View student alerts"),
        }}
        secondaryAction={{
          label: "Send Message",
          onClick: () => {
            if (students.length > 0) {
              setMessageRecipient({ name: students[0].name, email: students[0].email });
              setShowMessageModal(true);
            } else {
              errorToast("Info", "Update roster first to send messages");
            }
          },
        }}
        variant="warning"
      />

      {/* CARD 6: Messages & Communication */}
      <ActionCard
        title="Class Messages"
        description="Stay connected with your students and facilitators"
        icon={MessageSquare}
        primaryAction={{
          label: "Go to Messages",
          onClick: () => (window.location.href = "/dashboard/messages"),
        }}
        variant="primary"
      />

      {/* Quick Actions Section */}
      <div className="space-y-6 pt-6 border-t border-dark-600">
        <h2 className="text-2xl font-bold text-white">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            variant="primary" 
            size="lg" 
            className="w-full justify-center gap-2"
            onClick={() => setShowCreateCourseModal(true)}
          >
            <Plus className="w-5 h-5" />
            Create Class
          </Button>
          <Button 
            variant="secondary" 
            size="lg" 
            className="w-full justify-center gap-2"
            onClick={() => router.push("/dashboard/facilitator/analytics")}
          >
            <Activity className="w-5 h-5" />
            View Analytics
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="w-full justify-center gap-2"
            onClick={() => router.push("/dashboard/facilitator/content")}
          >
            <BookOpen className="w-5 h-5" />
            Manage Content
          </Button>
        </div>
      </div>

      {/* My Courses Section */}
      <div className="space-y-6 pt-6 border-t border-dark-600">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">My Courses</h2>
          <span className="text-sm text-gray-400">{courses.length} course{courses.length !== 1 ? 's' : ''}</span>
        </div>

        {coursesLoading ? (
          <Card className="p-12 flex flex-col items-center gap-4 justify-center">
            <Loader className="w-8 h-8 animate-spin text-primary-600" />
            <p className="text-gray-300">Loading your courses...</p>
          </Card>
        ) : courses.length === 0 ? (
          <Card className="p-8">
            <div className="text-center space-y-4">
              <BookOpen className="w-12 h-12 text-gray-500 mx-auto opacity-50" />
              <div>
                <h3 className="text-lg font-semibold text-gray-300">No courses yet</h3>
                <p className="text-sm text-gray-400 mt-1">
                  Create your first course to get started
                </p>
              </div>
              <Button 
                variant="primary" 
                size="sm"
                onClick={() => setShowCreateCourseModal(true)}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Create First Course
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card key={course.id} className="flex flex-col">
                <div className="p-6 space-y-4 flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white truncate">
                        {course.title}
                      </h3>
                      <p className="text-xs text-gray-400 mt-1">
                        {course.category || "Uncategorized"} • {course.level || "N/A"}
                      </p>
                    </div>
                    {course.isPublished && (
                      <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs font-semibold rounded">
                        Published
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-300 line-clamp-2">
                    {course.description}
                  </p>

                  <div className="flex flex-wrap gap-2 text-xs text-gray-400">
                    <span>📚 {course.estimatedHours || 0} weeks</span>
                    <span>👥 {course.maxStudents || 0} students</span>
                  </div>
                </div>

                {/* Course Actions */}
                <div className="border-t border-dark-600 p-4 flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={() => {
                      setSelectedCourse(course);
                      setShowEditCourseModal(true);
                    }}
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/50"
                    onClick={() => {
                      setSelectedCourse(course);
                      setShowDeleteModal(true);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Course Modal */}
      <CreateCourseModal
        isOpen={showCreateCourseModal}
        onClose={() => setShowCreateCourseModal(false)}
        onSuccess={() => {
          setShowCreateCourseModal(false);
          window.location.reload();
        }}
      />

      {/* Edit Course Modal */}
      <EditCourseModal
        isOpen={showEditCourseModal}
        onClose={() => {
          setShowEditCourseModal(false);
          setSelectedCourse(null);
        }}
        course={selectedCourse}
        onSuccess={() => {
          setShowEditCourseModal(false);
          window.location.reload();
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedCourse(null);
        }}
        onConfirm={handleDeleteCourse}
        title="Delete Course"
        message="This course will be archived and hidden from your dashboard. Students will lose access to it."
        itemName={selectedCourse?.title || ""}
        isLoading={isDeleting}
        type="warning"
      />

      {/* Grade Submission Modal */}
      {selectedSubmission && (
        <GradeSubmissionModal
          isOpen={showGradeModal}
          submission={selectedSubmission}
          onClose={() => setShowGradeModal(false)}
          onSubmit={handleGradeSubmission}
        />
      )}

      {/* Student Roster Modal */}
      <StudentRosterModal
        isOpen={showRosterModal}
        className={selectedCourse?.title || "Class"}
        students={students}
        isLoading={studentsLoading}
        onClose={() => setShowRosterModal(false)}
        onMessageStudent={(studentId, studentName) => {
          const student = students.find((s) => s.id === studentId);
          if (student) {
            setMessageRecipient({ name: studentName, email: student.email });
            setShowMessageModal(true);
          }
        }}
        onViewStudent={(studentId) => {
          console.log("View student profile:", studentId);
        }}
      />

      {/* Message Modal */}
      {messageRecipient.email && (
        <MessageModal
          isOpen={showMessageModal}
          recipientName={messageRecipient.name}
          recipientEmail={messageRecipient.email}
          context={{ type: "student", subject: "Class Update" }}
          onClose={() => setShowMessageModal(false)}
          onSendMessage={handleSendMessage}
        />
      )}
    </div>
  );
}
