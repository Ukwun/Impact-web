"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AUTH_TOKEN_KEY } from "@/lib/authStorage";
import { CourseDiscoveryModal } from "@/components/modals/CourseDiscoveryModal";
import { NetworkingModal } from "@/components/modals/NetworkingModal";
import { EventRegistrationModal } from "@/components/modals/EventRegistrationModal";
import {
  BookOpen,
  Users,
  Calendar,
  TrendingUp,
  AlertCircle,
  Loader,
  Plus
} from "lucide-react";

interface DashboardMetrics {
  enrolledCourses: number;
  currentConnections: number;
  registeredEvents: number;
  pendingRequests: number;
  averageCourseProgress: number;
}

interface Course {
  id: string;
  title: string;
  instructor: string;
  description: string;
  category: string;
  level: "beginner" | "intermediate" | "advanced";
  duration: number;
  enrollmentCount: number;
  rating: number;
  reviewCount: number;
  price?: number;
  topics: string[];
  prerequisites?: string;
  startDate: string;
  isEnrolled?: boolean;
}

interface Member {
  id: string;
  name: string;
  title: string;
  company: string;
  location: string;
  expertise: string[];
  bio: string;
  avatar: string;
  isConnected: boolean;
  mutualConnections: number;
  lastActive: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  location: string;
  format: "in-person" | "virtual" | "hybrid";
  speakers: Array<{ name: string; title: string }>;
  attendeeCount: number;
  capacity: number;
  registrationDeadline: string;
  tags: string[];
  isRegistered: boolean;
}

export default function UniMemberDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [events, setEvents] = useState<Event[]>([]);

  // Modal states
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showNetworkingModal, setShowNetworkingModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);

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
      const metricsRes = await fetch("/api/unimember/dashboard", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (metricsRes.ok) {
        const data = await metricsRes.json();
        setMetrics(data.data);
      }

      // Fetch courses
      const coursesRes = await fetch("/api/unimember/courses", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (coursesRes.ok) {
        const data = await coursesRes.json();
        setCourses(data.data || []);
      }

      // Fetch members
      const membersRes = await fetch("/api/unimember/members", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (membersRes.ok) {
        const data = await membersRes.json();
        setMembers(data.data || []);
      }

      // Fetch events
      const eventsRes = await fetch("/api/unimember/events", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (eventsRes.ok) {
        const data = await eventsRes.json();
        setEvents(data.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollCourse = async (courseId: string) => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem(AUTH_TOKEN_KEY) : null;
      if (!token) return;

      const res = await fetch("/api/unimember/enroll-course", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ courseId })
      });

      if (res.ok) {
        await loadDashboardData();
      }
    } catch (err) {
      console.error("Error enrolling course:", err);
    }
  };

  const handleConnect = async (memberId: string) => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem(AUTH_TOKEN_KEY) : null;
      if (!token) return;

      const res = await fetch("/api/unimember/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ memberId })
      });

      if (res.ok) {
        await loadDashboardData();
      }
    } catch (err) {
      console.error("Error connecting:", err);
    }
  };

  const handleRegisterEvent = async (eventId: string) => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem(AUTH_TOKEN_KEY) : null;
      if (!token) return;

      const res = await fetch("/api/unimember/register-event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ eventId })
      });

      if (res.ok) {
        await loadDashboardData();
      }
    } catch (err) {
      console.error("Error registering event:", err);
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
        <h1 className="text-4xl font-bold text-white">University Member Hub</h1>
        <p className="text-gray-400">Advance your learning, build your network, discover opportunities</p>
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
              <p className="text-sm text-gray-400 mb-1">Enrolled Courses</p>
              <p className="text-3xl font-bold text-white">{metrics?.enrolledCourses || 0}</p>
            </div>
            <BookOpen className="w-8 h-8 text-primary-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-blue-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Connections</p>
              <p className="text-3xl font-bold text-white">{metrics?.currentConnections || 0}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-green-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Registered Events</p>
              <p className="text-3xl font-bold text-white">{metrics?.registeredEvents || 0}</p>
            </div>
            <Calendar className="w-8 h-8 text-green-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-yellow-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Pending Requests</p>
              <p className="text-3xl font-bold text-white">{metrics?.pendingRequests || 0}</p>
            </div>
            <Users className="w-8 h-8 text-yellow-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-accent-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Course Progress</p>
              <p className="text-3xl font-bold text-white">{metrics?.averageCourseProgress || 0}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-accent-500 opacity-50" />
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 hover:shadow-lg transition cursor-pointer" onClick={() => setShowCourseModal(true)}>
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-primary-100">
              <BookOpen className="w-6 h-6 text-primary-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-white mb-1">Explore Courses</h3>
              <p className="text-gray-400 text-sm">Discover advanced learning programs</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition cursor-pointer" onClick={() => setShowNetworkingModal(true)}>
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-blue-100">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-white mb-1">Network</h3>
              <p className="text-gray-400 text-sm">Connect with other professionals</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition cursor-pointer" onClick={() => setShowEventModal(true)}>
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-green-100">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-white mb-1">Discover Events</h3>
              <p className="text-gray-400 text-sm">Join webinars and workshops</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Featured Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recommended Courses */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Recommended Courses</h2>
            <Button onClick={() => setShowCourseModal(true)} variant="secondary" size="sm">
              View All
            </Button>
          </div>

          {courses.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No courses available</p>
          ) : (
            <div className="space-y-3">
              {courses.slice(0, 3).map((course) => (
                <div key={course.id} className="p-3 bg-dark-700 rounded-lg border border-dark-600 hover:border-primary-500 transition">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-bold text-white">{course.title}</p>
                      <p className="text-xs text-gray-400">{course.instructor}</p>
                    </div>
                    <span className="text-xs font-bold text-primary-400">{course.level}</span>
                  </div>
                  <p className="text-xs text-gray-400 mb-2">{course.duration} weeks</p>
                  <Button
                    onClick={() => handleEnrollCourse(course.id)}
                    variant="primary"
                    size="sm"
                    className="w-full"
                    disabled={course.isEnrolled}
                  >
                    {course.isEnrolled ? "Enrolled" : "Enroll"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Upcoming Events */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Upcoming Events</h2>
            <Button onClick={() => setShowEventModal(true)} variant="secondary" size="sm">
              View All
            </Button>
          </div>

          {events.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No events scheduled</p>
          ) : (
            <div className="space-y-3">
              {events.slice(0, 3).map((event) => (
                <div key={event.id} className="p-3 bg-dark-700 rounded-lg border border-dark-600 hover:border-green-500 transition">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-bold text-white">{event.title}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(event.eventDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-green-400">{event.format}</span>
                  </div>
                  <p className="text-xs text-gray-400 mb-2">{event.attendeeCount} attending</p>
                  <Button
                    onClick={() => handleRegisterEvent(event.id)}
                    variant="success"
                    size="sm"
                    className="w-full"
                    disabled={event.isRegistered}
                  >
                    {event.isRegistered ? "Registered" : "Register"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Modals */}
      <CourseDiscoveryModal
        isOpen={showCourseModal}
        courses={courses}
        onClose={() => setShowCourseModal(false)}
        onEnrollCourse={handleEnrollCourse}
      />

      <NetworkingModal
        isOpen={showNetworkingModal}
        members={members}
        onClose={() => setShowNetworkingModal(false)}
        onConnect={handleConnect}
        onMessage={(memberId) => {
          console.log("Message", memberId);
        }}
      />

      <EventRegistrationModal
        isOpen={showEventModal}
        events={events}
        onClose={() => setShowEventModal(false)}
        onRegisterEvent={handleRegisterEvent}
        onViewDetails={(eventId) => {
          console.log("View details", eventId);
        }}
      />
    </div>
  );
}
