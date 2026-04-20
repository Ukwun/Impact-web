"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { CourseDiscoveryModal } from "@/components/modals/CourseDiscoveryModal";
import { AssignmentSubmissionModal } from "@/components/modals/AssignmentSubmissionModal";
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from "@/lib/authStorage";
import {
  CheckCircle2,
  Flame,
  Trophy,
  BookOpen,
  Clock,
  AlertCircle,
  Loader,
  ArrowRight,
  Zap,
  Award,
} from "lucide-react";

interface EnrolledCourse {
  id: string;
  title: string;
  facilitatorName: string;
  progress: number;
  status: "active" | "completed";
}

interface PendingAssignment {
  id: string;
  title: string;
  course: string;
  daysUntilDue: number;
  dueDate?: string;
  difficulty: "easy" | "medium" | "hard";
}

interface StudentDashboardData {
  enrolledCourses: EnrolledCourse[];
  pendingAssignments: PendingAssignment[];
  studyStreak: number;
  recentGrades: Array<{
    course: string;
    score: number;
  }>;
}

export default function StudentDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const { success, error: errorToast } = useToast();
  const [showCourseDiscovery, setShowCourseDiscovery] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<PendingAssignment | null>(null);
  const [showAssignmentSubmission, setShowAssignmentSubmission] = useState(false);

  useEffect(() => {
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

  const urgentAssignments = data.pendingAssignments.filter(a => a.daysUntilDue <= 3);

  return (
    <div className="space-y-8 pb-12">
      {/* Header with Study Streak */}
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-black text-white mb-2">🎓 Continue Learning</h1>
          <p className="text-gray-300">Your personal learning dashboard</p>
        </div>

        {/* Study Streak */}
        <Card className="p-6 bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Current Study Streak</p>
              <p className="text-4xl font-black text-white mt-2">{data.studyStreak} Days</p>
              <p className="text-orange-400 text-sm mt-1">Keep it going! 🔥</p>
            </div>
            <Flame className="w-16 h-16 text-orange-500 opacity-50" />
          </div>
        </Card>
      </div>

      {/* ⚠️ URGENT: Assignments Due Soon */}
      {urgentAssignments.length > 0 && (
        <Card className="p-4 border-l-4 border-red-500 bg-red-500/10">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-400">⚠️ Due Soon!</p>
              <p className="text-sm text-gray-300 mt-1">
                {urgentAssignments.length} assignment{urgentAssignments.length !== 1 ? "s" : ""} due in the next 3 days
              </p>
            </div>
          </div>
          <div className="mt-3 space-y-2">
            {urgentAssignments.map(a => (
              <div key={a.id} className="text-xs bg-dark-700 p-2 rounded">
                <p className="text-white font-semibold">{a.title}</p>
                <p className="text-gray-400">{a.course} • Due in {a.daysUntilDue} days</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* My Courses I'm Enrolled In */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <BookOpen className="w-6 h-6" />
          My Courses ({data.enrolledCourses.length})
        </h2>

        {data.enrolledCourses.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-400">No courses enrolled yet</p>
            <Button onClick={() => setShowCourseDiscovery(true)} className="mt-4">Browse Available Courses</Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.enrolledCourses.map(course => (
              <Card key={course.id} className="p-5 hover:border-primary-500 transition-all duration-200 cursor-pointer hover:shadow-lg hover:shadow-primary-500/10">
                <div className="space-y-4">
                  {/* Course Header */}
                  <div>
                    <h3 className="font-bold text-white text-lg">{course.title}</h3>
                    <p className="text-xs text-gray-400 mt-1">with {course.facilitatorName}</p>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-semibold text-gray-300">Progress</span>
                      <span className="text-sm font-bold text-primary-400">{course.progress}%</span>
                    </div>
                    <div className="w-full bg-dark-700 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          course.progress >= 80 ? 'bg-green-500' :
                          course.progress >= 50 ? 'bg-primary-500' : 'bg-yellow-500'
                        }`}
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                      course.status === 'completed'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-primary-500/20 text-primary-400'
                    }`}>
                      {course.status === 'completed' ? '✓ Completed' : '📖 In Progress'}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* All Pending Assignments */}
      {data.pendingAssignments.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6" />
            Assignments to Submit ({data.pendingAssignments.length})
          </h2>
          
          <div className="space-y-3">
            {data.pendingAssignments.map(assignment => (
              <Card key={assignment.id} className="p-4 hover:border-primary-500 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{assignment.title}</h3>
                    <p className="text-sm text-gray-400 mt-1">{assignment.course}</p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className={`text-sm font-bold ${
                        assignment.daysUntilDue <= 1 ? 'text-red-400' :
                        assignment.daysUntilDue <= 3 ? 'text-yellow-400' : 'text-gray-400'
                      }`}>
                        {assignment.daysUntilDue} day{assignment.daysUntilDue !== 1 ? 's' : ''} left
                      </div>
                      <span className={`inline-block text-xs px-2 py-1 rounded mt-1 ${
                        assignment.difficulty === 'hard' ? 'bg-red-500/20 text-red-400' :
                        assignment.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {assignment.difficulty}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedAssignment(assignment);
                        setShowAssignmentSubmission(true);
                      }}
                      className="px-4 py-2 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition whitespace-nowrap"
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Recent Grades */}
      {data.recentGrades.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Award className="w-6 h-6" />
            Recent Grades
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.recentGrades.map((grade, idx) => (
              <Card key={idx} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">{grade.course}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-black ${
                      grade.score >= 80 ? 'text-green-400' :
                      grade.score >= 60 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {grade.score}%
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Course Discovery Modal */}
      <CourseDiscoveryModal
        isOpen={showCourseDiscovery}
        courses={[]}
        onClose={() => setShowCourseDiscovery(false)}
        onEnrollCourse={(courseId: string) => {
          console.log("Enrolled in course:", courseId);
          setShowCourseDiscovery(false);
          loadDashboardData();
        }}
      />

      {/* Assignment Submission Modal */}
      {selectedAssignment && (
        <AssignmentSubmissionModal
          isOpen={showAssignmentSubmission}
          assignmentId={selectedAssignment.id}
          assignmentTitle={selectedAssignment.title}
          dueDate={selectedAssignment.dueDate}
          onClose={() => {
            setShowAssignmentSubmission(false);
            setSelectedAssignment(null);
          }}
          onSuccess={() => {
            loadDashboardData();
          }}
        />
      )}
    </div>
  );
}
