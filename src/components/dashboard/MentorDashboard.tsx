"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AUTH_TOKEN_KEY } from "@/lib/authStorage";
import { MenteeProgressModal } from "@/components/modals/MenteeProgressModal";
import { MentorSessionModal } from "@/components/modals/MentorSessionModal";
import {
  Users,
  TrendingUp,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Loader,
} from "lucide-react";

interface DashboardMetrics {
  totalMentees: number;
  totalSessions: number;
  completedSessions: number;
  upcomingSessions: number;
  averageMenteeProgress: number;
}

interface Mentee {
  id: string;
  name: string;
  email: string;
  joinDate: string;
  currentCourse: string;
  progress: number;
  enrollmentCount: number;
}

interface MenteeProgress {
  id: string;
  name: string;
  courseId: string;
  courseName: string;
  completionPercentage: number;
  gradesAverage: number;
  lastActivityDate: string;
  milestones: {
    id: string;
    name: string;
    completed: boolean;
    dueDate: string;
  }[];
  strengths: string[];
  areasForImprovement: string[];
}

export default function MentorDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [mentees, setMentees] = useState<Mentee[]>([]);

  // Modal states
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [selectedMentee, setSelectedMentee] = useState<MenteeProgress | null>(null);
  const [selectedMenteeId, setSelectedMenteeId] = useState<string | null>(null);

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
      const metricsRes = await fetch("/api/mentor/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (metricsRes.ok) {
        const data = await metricsRes.json();
        setMetrics(data.data);
      }

      // Fetch mentees
      const menteesRes = await fetch("/api/mentor/mentees", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (menteesRes.ok) {
        const data = await menteesRes.json();
        setMentees(data.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewProgress = async (mentee: Mentee) => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem(AUTH_TOKEN_KEY) : null;
      if (!token) return;

      const res = await fetch(`/api/mentor/mentees/${mentee.id}/progress`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setSelectedMentee(data.data);
        setShowProgressModal(true);
      }
    } catch (err) {
      console.error("Error loading mentee progress:", err);
    }
  };

  const handleScheduleSession = async (
    menteeId: string,
    sessionDate: string,
    duration: number,
    topic: string
  ) => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem(AUTH_TOKEN_KEY) : null;
      if (!token) return;

      const res = await fetch("/api/mentor/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ menteeId, sessionDate, duration, topic }),
      });

      if (res.ok) {
        // Reload data
        await loadDashboardData();
      }
    } catch (err) {
      console.error("Error scheduling session:", err);
    }
  };

  const handleCompleteSession = async (sessionId: string, notes: string, attendance: string) => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem(AUTH_TOKEN_KEY) : null;
      if (!token) return;

      const res = await fetch(`/api/mentor/sessions/${sessionId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notes, attendance }),
      });

      if (res.ok) {
        // Reload data
        await loadDashboardData();
      }
    } catch (err) {
      console.error("Error completing session:", err);
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
        <h1 className="text-4xl font-bold text-white">Mentor Dashboard</h1>
        <p className="text-gray-400">Manage mentees and schedule sessions</p>
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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-6 border-l-4 border-primary-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Total Mentees</p>
              <p className="text-3xl font-bold text-white">{metrics?.totalMentees || 0}</p>
            </div>
            <Users className="w-8 h-8 text-primary-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-success-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Total Sessions</p>
              <p className="text-3xl font-bold text-white">{metrics?.totalSessions || 0}</p>
            </div>
            <Calendar className="w-8 h-8 text-success-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-info-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Completed Sessions</p>
              <p className="text-3xl font-bold text-white">{metrics?.completedSessions || 0}</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-info-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-warning-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Upcoming Sessions</p>
              <p className="text-3xl font-bold text-white">{metrics?.upcomingSessions || 0}</p>
            </div>
            <Calendar className="w-8 h-8 text-warning-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-accent-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Avg Mentee Progress</p>
              <p className="text-3xl font-bold text-white">{metrics?.averageMenteeProgress || 0}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-accent-500 opacity-50" />
          </div>
        </Card>
      </div>

      {/* Mentees List */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Your Mentees</h2>
          <Button onClick={() => setShowSessionModal(true)} variant="primary">
            Schedule Session
          </Button>
        </div>

        {mentees.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No mentees yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-dark-600">
                  <th className="pb-3 text-gray-400 font-semibold">Name</th>
                  <th className="pb-3 text-gray-400 font-semibold">Progress</th>
                  <th className="pb-3 text-gray-400 font-semibold">Current Course</th>
                  <th className="pb-3 text-gray-400 font-semibold">Joined</th>
                  <th className="pb-3 text-gray-400 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="space-y-2">
                {mentees.map((mentee) => (
                  <tr key={mentee.id} className="border-b border-dark-600">
                    <td className="py-3 text-white font-medium">{mentee.name}</td>
                    <td className="py-3">
                      <div className="w-24 bg-dark-700 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-success-500 to-success-400 h-full"
                          style={{ width: `${mentee.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 mt-1">{mentee.progress}%</span>
                    </td>
                    <td className="py-3 text-gray-400">{mentee.currentCourse}</td>
                    <td className="py-3 text-gray-400">{new Date(mentee.joinDate).toLocaleDateString()}</td>
                    <td className="py-3">
                      <Button
                        onClick={() => handleViewProgress(mentee)}
                        size="sm"
                        variant="secondary"
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modals */}
      {selectedMentee && (
        <MenteeProgressModal
          isOpen={showProgressModal}
          mentee={selectedMentee}
          onClose={() => {
            setShowProgressModal(false);
            setSelectedMentee(null);
          }}
        />
      )}

      <MentorSessionModal
        isOpen={showSessionModal}
        sessions={[]}
        selectedMenteeId={selectedMenteeId || undefined}
        onClose={() => {
          setShowSessionModal(false);
          setSelectedMenteeId(null);
        }}
        onScheduleSession={handleScheduleSession}
        onCompleteSession={handleCompleteSession}
      />
    </div>
  );
}
