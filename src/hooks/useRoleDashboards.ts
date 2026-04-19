import { useState, useEffect } from "react";
import { AUTH_TOKEN_KEY } from "@/lib/authStorage";

// ============ FACILITATOR TYPES ============

export interface FacilitatorClass {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  totalStudents: number;
  completedStudents: number;
  averageProgress: number;
  totalLessons: number;
  totalAssignments: number;
  submittedAssignments: number;
  students: Array<{
    id: string;
    name: string;
    email: string;
    avatar?: string;
    progress: number;
    isCompleted: boolean;
  }>;
}

export interface FacilitatorData {
  classes: FacilitatorClass[];
  total: number;
}

export function useFacilitatorClasses() {
  const [data, setData] = useState<FacilitatorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        const response = await fetch("/api/facilitator/classes", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Failed to fetch classes");
        }

        const result = await response.json();
        setData(result.data);
      } catch (err) {
        console.error("❌ Error fetching facilitator classes:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
}

// ============ SCHOOL ADMIN TYPES ============

export interface SchoolMetrics {
  totalStudents: number;
  totalFacilitators: number;
  totalCourses: number;
  totalEnrollments: number;
  totalLessons: number;
  completionRate: number;
  averageProgress: number;
}

export interface SchoolAdminData {
  metrics: SchoolMetrics;
  studentsList: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  }>;
  facilitatorsList: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  }>;
  coursesList: Array<{
    id: string;
    title: string;
    enrollmentCount: number;
    completedCount: number;
  }>;
  topPerformingStudents: Array<{
    id: string;
    name: string;
    email: string;
    averageProgress: number;
    enrolledCourses: number;
  }>;
}

export function useSchoolMetrics() {
  const [data, setData] = useState<SchoolAdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        const response = await fetch("/api/admin/school", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Failed to fetch school metrics");
        }

        const result = await response.json();
        setData(result.data);
      } catch (err) {
        console.error("❌ Error fetching school metrics:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
}

// ============ UNIVERSITY MEMBER TYPES ============

export interface UniversityProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  institution: string;
}

export interface UniversityStats {
  enrolledPrograms: number;
  completedPrograms: number;
  averageProgress: number;
  totalAchievements: number;
  certificatesEarned: number;
  totalLearningHours: number;
}

export interface UniversityMemberData {
  profile: UniversityProfile;
  stats: UniversityStats;
  enrolledPrograms: Array<{
    id: string;
    title: string;
    difficulty: string;
    progress: number;
    isCompleted: boolean;
  }>;
  availablePrograms: Array<{
    id: string;
    title: string;
    description: string;
    difficulty: string;
    enrollmentCount: number;
  }>;
  recentAchievements: any[];
}

export function useUniversityMember() {
  const [data, setData] = useState<UniversityMemberData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        const response = await fetch("/api/university/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Failed to fetch university profile");
        }

        const result = await response.json();
        setData(result.data);
      } catch (err) {
        console.error("❌ Error fetching university member data:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
}

// ============ PARENT TYPES ============

export interface ParentChild {
  childId: string;
  childName: string;
  childEmail?: string;
  childAvatar?: string;
  enrolledCourses: number;
  completedCourses: number;
  averageProgress: number;
  currentCourses: Array<{
    courseId: string;
    courseName: string;
    progress: number;
  }>;
  submittedAssignments: number;
  totalAssignments: number;
  totalGrade: number;
}

export interface ParentDashboardData {
  children: ParentChild[];
  total: number;
}

export function useParentChildren() {
  const [data, setData] = useState<ParentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        const response = await fetch("/api/parent-child", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Failed to fetch children data");
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error("❌ Error fetching parent children data:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
}

// ============ MENTOR TYPES ============

export interface MenteeData {
  menteeId: string;
  menteeName: string;
  menteeEmail?: string;
  menteeAvatar?: string;
  progress: number;
  enrolledCourses: number;
  nextMeeting: string;
  status: "Excellent" | "Good" | "Needs Support";
  lastContact: string;
}

export interface MentorStats {
  totalMentees: number;
  activeSessions: number;
  completedSessions: number;
  averageMenteeProgress: number;
}

export interface MentorDashboardData {
  mentees: MenteeData[];
  stats: MentorStats;
}

export function useMentorData() {
  const [data, setData] = useState<MentorDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        const response = await fetch("/api/mentor/sessions", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Failed to fetch mentor data");
        }

        const result = await response.json();
        setData(result.data);
      } catch (err) {
        console.error("❌ Error fetching mentor data:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
}

// ============ CIRCLE MEMBER TYPES ============

export interface CircleConnection {
  id: string;
  name: string;
  title: string;
  company: string;
  mutualConnections: number;
  connected: boolean;
}

export interface CirclePost {
  id: number;
  author: string;
  content: string;
  likes: number;
  comments: number;
  shares: number;
  timestamp: string;
}

export interface CircleOpportunity {
  id: string;
  title: string;
  company: string;
  type: string;
  location: string;
  posted: string;
}

export interface CircleMemberData {
  profile: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    institution?: string;
  };
  profileStats: {
    connections: number;
    followers: number;
    posts: number;
    engagementRate: number;
    profileViews: number;
    achievements: number;
  };
  connections: CircleConnection[];
  posts: CirclePost[];
  opportunities: CircleOpportunity[];
  enrolledCourses: number;
  achievements: Array<{ id: string; title: string; unlockedDate: Date }>;
}

export function useCircleMemberData() {
  const [data, setData] = useState<CircleMemberData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        const response = await fetch("/api/circle-member", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Failed to fetch circle data");
        }

        const result = await response.json();
        setData(result.data);
      } catch (err) {
        console.error("❌ Error fetching circle member data:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
}

// ============ ADMIN SYSTEM TYPES ============

export interface AdminSystemMetric {
  label: string;
  value: string | number;
  trend: string;
}

export interface AdminSystemDashboardData {
  totalUsers: number;
  activeCourses: number;
  completionRate: number;
  avgScore: number;
  totalEnrollments: number;
  usersChange: string;
  coursesChange: string;
  completionChange: string;
  scoreChange: string;
  roleDistribution: Record<string, number>;
  submissionBreakdown: Record<string, number>;
  recentEnrollments: Array<{ date: string; progress: number }>;
  topMetrics: AdminSystemMetric[];
}

export function useAdminSystemDashboard() {
  const [data, setData] = useState<AdminSystemDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        const response = await fetch("/api/admin/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Failed to fetch admin data");
        }

        const result = await response.json();
        setData(result.data);
      } catch (err) {
        console.error("❌ Error fetching admin data:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
}
