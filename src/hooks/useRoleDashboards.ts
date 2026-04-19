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
