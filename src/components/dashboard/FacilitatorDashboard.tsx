"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from "@/lib/authStorage";
import { CreateCourseModal } from "@/components/modals/CreateCourseModal";
import { GradeSubmissionModal } from "@/components/modals/GradeSubmissionModal";
import { SchoolReportsModal } from "@/components/modals/SchoolReportsModal";
import { StudentRosterModal } from "@/components/modals/StudentRosterModal";
import {
  Users,
  FileText,
  BarChart3,
  Loader,
  AlertCircle,
  Plus,
  TrendingUp,
  CheckCircle2,
  BookOpen,
} from "lucide-react";

interface CourseTaught {
  id: string;
  title: string;
  enrolledStudents: number;
  pendingSubmissions: number;
  averageGrade: number;
}

interface PendingSubmission {
  id: string;
  studentName: string;
  courseTitle: string;
  assignmentTitle: string;
  submittedAt: string;
}

interface FacilitatorDashboardData {
  coursesTaught: CourseTaught[];
  pendingSubmissions: PendingSubmission[];
  totalStudents: number;
  averageClassGrade: number;
  completionRate: number;
}

export default function FacilitatorDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<FacilitatorDashboardData | null>(null);
  const { success, error: errorToast } = useToast();
  const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [showRosterModal, setShowRosterModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<CourseTaught | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<PendingSubmission | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/facilitator/dashboard", {
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

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-black text-white mb-2">📚 Teaching Dashboard</h1>
          <p className="text-gray-300">Manage your courses, grade submissions, and track student progress</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-gray-400 text-xs font-semibold">Courses Teaching</p>
            <p className="text-3xl font-black text-primary-400 mt-2">{data.coursesTaught.length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-gray-400 text-xs font-semibold">Total Students</p>
            <p className="text-3xl font-black text-blue-400 mt-2">{data.totalStudents}</p>
          </Card>
          <Card className="p-4">
            <p className="text-gray-400 text-xs font-semibold">Avg Grade</p>
            <p className="text-3xl font-black text-green-400 mt-2">{data.averageClassGrade}%</p>
          </Card>
          <Card className="p-4">
            <p className="text-gray-400 text-xs font-semibold">Completion Rate</p>
            <p className="text-3xl font-black text-yellow-400 mt-2">{data.completionRate}%</p>
          </Card>
        </div>
      </div>

      {/* ACTION: Pending Submissions to Grade */}
      {data.pendingSubmissions.length > 0 && (
        <Card className="p-6 border-l-4 border-purple-500 bg-purple-500/10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-purple-400 font-semibold flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Submissions to Grade
              </p>
              <p className="text-2xl font-black text-white mt-2">{data.pendingSubmissions.length}</p>
              <p className="text-sm text-gray-300 mt-1">Review and grade student work</p>
            </div>
            <Button 
              onClick={() => {
                if (data?.pendingSubmissions.length > 0) {
                  setSelectedSubmission(data.pendingSubmissions[0]);
                  setShowGradeModal(true);
                }
              }} 
              className="whitespace-nowrap"
            >
              Start Grading
            </Button>
          </div>

          {/* List First Few */}
          <div className="mt-4 space-y-2">
            {data.pendingSubmissions.slice(0, 3).map((sub, idx) => (
              <div key={idx} className="text-xs bg-dark-700 p-2 rounded">
                <p className="text-white font-semibold">{sub.studentName}</p>
                <p className="text-gray-400">{sub.courseTitle} • {sub.assignmentTitle}</p>
              </div>
            ))}
            {data.pendingSubmissions.length > 3 && (
              <p className="text-xs text-gray-400 pt-2">+{data.pendingSubmissions.length - 3} more</p>
            )}
          </div>
        </Card>
      )}

      {/* Your Courses */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            My Courses ({data.coursesTaught.length})
          </h2>
          <Button onClick={() => setShowCreateCourseModal(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Course
          </Button>
        </div>

        {data.coursesTaught.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-400">No courses yet</p>
            <Button onClick={() => setShowCreateCourseModal(true)} className="mt-4">Create Your First Course</Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.coursesTaught.map(course => (
              <Card key={course.id} className="p-5 hover:border-primary-500 transition-all cursor-pointer">
                <div className="space-y-4">
                  {/* Course Title */}
                  <h3 className="font-bold text-white text-lg">{course.title}</h3>

                  {/* Course Stats Grid */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-dark-700 p-3 rounded text-center">
                      <Users className="w-4 h-4 mx-auto text-blue-400 mb-1" />
                      <p className="text-xs text-gray-400">Enrolled</p>
                      <p className="font-bold text-white text-lg">{course.enrolledStudents}</p>
                    </div>
                    <div className="bg-dark-700 p-3 rounded text-center">
                      <FileText className="w-4 h-4 mx-auto text-purple-400 mb-1" />
                      <p className="text-xs text-gray-400">Pending</p>
                      <p className="font-bold text-white text-lg">{course.pendingSubmissions}</p>
                    </div>
                    <div className="bg-dark-700 p-3 rounded text-center">
                      <TrendingUp className="w-4 h-4 mx-auto text-green-400 mb-1" />
                      <p className="text-xs text-gray-400">Avg Grade</p>
                      <p className="font-bold text-white text-lg">{course.averageGrade}%</p>
                    </div>
                  </div>

                  {/* Action Button */}
                  {course.pendingSubmissions > 0 && (
                    <Button 
                      variant="secondary" 
                      className="w-full text-sm"
                      onClick={() => {
                        setSelectedCourse(course);
                        setShowGradeModal(true);
                      }}
                    >
                      Grade {course.pendingSubmissions} Submission{course.pendingSubmissions !== 1 ? 's' : ''}
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 hover:border-primary-500 transition-colors cursor-pointer" onClick={() => setShowGradeModal(true)}>
            <FileText className="w-8 h-8 text-blue-400 mb-3" />
            <h3 className="font-semibold text-white">View All Submissions</h3>
            <p className="text-xs text-gray-400 mt-2">Review pending student work</p>
          </Card>
          <Card className="p-6 hover:border-primary-500 transition-colors cursor-pointer" onClick={() => setShowAnalyticsModal(true)}>
            <BarChart3 className="w-8 h-8 text-green-400 mb-3" />
            <h3 className="font-semibold text-white">Class Analytics</h3>
            <p className="text-xs text-gray-400 mt-2">View performance metrics</p>
          </Card>
          <Card className="p-6 hover:border-primary-500 transition-colors cursor-pointer" onClick={() => setShowRosterModal(true)}>
            <Users className="w-8 h-8 text-purple-400 mb-3" />
            <h3 className="font-semibold text-white">Student Rosters</h3>
            <p className="text-xs text-gray-400 mt-2">Manage course enrollment</p>
          </Card>
        </div>
      </div>

      {/* Create Course Modal */}
      <CreateCourseModal
        isOpen={showCreateCourseModal}
        onClose={() => setShowCreateCourseModal(false)}
        onSuccess={() => {
          setShowCreateCourseModal(false);
          loadDashboardData();
        }}
      />

      {/* Grade Submission Modal */}
      {selectedSubmission && (
        <GradeSubmissionModal
          isOpen={showGradeModal}
          submission={{
            id: selectedSubmission.id,
            studentName: selectedSubmission.studentName,
            studentEmail: "student@example.com",
            assignmentTitle: selectedSubmission.assignmentTitle,
            submittedAt: selectedSubmission.submittedAt,
          }}
          onClose={() => {
            setShowGradeModal(false);
            setSelectedSubmission(null);
          }}
          onSubmit={async (submissionId: string, grade: number, feedback: string) => {
            try {
              const response = await fetch("/api/assignments/grade", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${localStorage.getItem(AUTH_TOKEN_KEY)}`,
                },
                body: JSON.stringify({
                  submissionId,
                  score: grade,
                  feedback,
                }),
              });

              if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to save grade");
              }

              success("Grade Saved", `${selectedSubmission.studentName} scored ${grade}%`);
              setShowGradeModal(false);
              setSelectedSubmission(null);
              loadDashboardData();
            } catch (err) {
              errorToast("Error", err instanceof Error ? err.message : "Failed to save grade");
            }
          }}
        />
      )}

      {/* Class Analytics Modal */}
      <SchoolReportsModal
        isOpen={showAnalyticsModal}
        onClose={() => setShowAnalyticsModal(false)}
        facilitatorName="Your School"
      />

      {/* Student Roster Modal */}
      <StudentRosterModal
        isOpen={showRosterModal}
        onClose={() => setShowRosterModal(false)}
        school={{
          id: "1",
          name: "Your School",
          created_at: new Date().toISOString(),
          facilitatorId: "current_user",
        }}
      />
    </div>
  );
}
