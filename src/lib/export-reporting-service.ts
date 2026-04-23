/**
 * Export & Reporting Service
 * Generate reports in multiple formats (PDF, CSV, XLSX) with comprehensive data
 * ImpactApp Platform - April 23, 2026
 */

"use client";

import axios from "axios";

// ========================================================================
// TYPES
// ========================================================================

export type ReportType = "progress" | "attendance" | "grades" | "analytics" | "project" | "portfolio";
export type ExportFormat = "pdf" | "csv" | "xlsx" | "json";

export interface ReportRequest {
  type: ReportType;
  format: ExportFormat;
  studentId?: string;
  courseId?: string;
  startDate?: Date;
  endDate?: Date;
  includeCharts?: boolean;
  includeComments?: boolean;
}

export interface ExportOptions {
  fileName?: string;
  includeMetadata?: boolean;
  compress?: boolean;
}

// ========================================================================
// CONSTANTS
// ========================================================================

const REPORT_CONFIGS: Record<ReportType, string> = {
  progress: "Student Learning Progress Report",
  attendance: "Attendance & Participation Report",
  grades: "Grades & Assessment Report",
  analytics: "Learning Analytics & Trends",
  project: "Project Completion Report",
  portfolio: "Portfolio & Achievement Summary",
};

// ========================================================================
// EXPORT SERVICE
// ========================================================================

/**
 * Export student progress report
 */
export async function exportProgressReport(
  studentId: string,
  startDate: Date,
  endDate: Date,
  format: ExportFormat = "pdf"
): Promise<Blob> {
  try {
    const response = await axios.post(
      "/api/reports/progress/export",
      {
        studentId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        format,
      },
      { responseType: "blob" }
    );

    return response.data;
  } catch (error) {
    console.error("Error exporting progress report:", error);
    throw error;
  }
}

/**
 * Export attendance report
 */
export async function exportAttendanceReport(
  studentId: string,
  format: ExportFormat = "pdf"
): Promise<Blob> {
  try {
    const response = await axios.post(
      "/api/reports/attendance/export",
      { studentId, format },
      { responseType: "blob" }
    );

    return response.data;
  } catch (error) {
    console.error("Error exporting attendance report:", error);
    throw error;
  }
}

/**
 * Export grades report
 */
export async function exportGradesReport(
  studentId: string,
  courseId?: string,
  format: ExportFormat = "pdf"
): Promise<Blob> {
  try {
    const response = await axios.post(
      "/api/reports/grades/export",
      { studentId, courseId, format },
      { responseType: "blob" }
    );

    return response.data;
  } catch (error) {
    console.error("Error exporting grades report:", error);
    throw error;
  }
}

/**
 * Export analytics report
 */
export async function exportAnalyticsReport(
  studentId: string,
  startDate: Date,
  endDate: Date,
  format: ExportFormat = "pdf"
): Promise<Blob> {
  try {
    const response = await axios.post(
      "/api/reports/analytics/export",
      {
        studentId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        format,
      },
      { responseType: "blob" }
    );

    return response.data;
  } catch (error) {
    console.error("Error exporting analytics report:", error);
    throw error;
  }
}

/**
 * Export project report
 */
export async function exportProjectReport(
  projectId: string,
  format: ExportFormat = "pdf"
): Promise<Blob> {
  try {
    const response = await axios.post(
      "/api/reports/project/export",
      { projectId, format },
      { responseType: "blob" }
    );

    return response.data;
  } catch (error) {
    console.error("Error exporting project report:", error);
    throw error;
  }
}

/**
 * Export portfolio
 */
export async function exportPortfolio(
  studentId: string,
  format: ExportFormat = "pdf"
): Promise<Blob> {
  try {
    const response = await axios.post(
      "/api/reports/portfolio/export",
      { studentId, format },
      { responseType: "blob" }
    );

    return response.data;
  } catch (error) {
    console.error("Error exporting portfolio:", error);
    throw error;
  }
}

/**
 * Export bulk student data (Admin)
 */
export async function exportStudentData(
  studentIds: string[],
  format: ExportFormat = "csv"
): Promise<Blob> {
  try {
    const response = await axios.post(
      "/api/admin/reports/bulk-export",
      { studentIds, format },
      { responseType: "blob" }
    );

    return response.data;
  } catch (error) {
    console.error("Error exporting student data:", error);
    throw error;
  }
}

/**
 * Export course analytics
 */
export async function exportCourseAnalytics(
  courseId: string,
  format: ExportFormat = "pdf"
): Promise<Blob> {
  try {
    const response = await axios.post(
      "/api/reports/course-analytics/export",
      { courseId, format },
      { responseType: "blob" }
    );

    return response.data;
  } catch (error) {
    console.error("Error exporting course analytics:", error);
    throw error;
  }
}

/**
 * Export school dashboard data
 */
export async function exportSchoolDashboard(
  format: ExportFormat = "pdf"
): Promise<Blob> {
  try {
    const response = await axios.post(
      "/api/admin/reports/dashboard/export",
      { format },
      { responseType: "blob" }
    );

    return response.data;
  } catch (error) {
    console.error("Error exporting school dashboard:", error);
    throw error;
  }
}

// ========================================================================
// DOWNLOAD UTILITIES
// ========================================================================

/**
 * Download file from blob
 */
export function downloadFile(blob: Blob, fileName: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  link.parentNode?.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Download report with auto-generated filename
 */
export async function downloadReport(
  reportFn: () => Promise<Blob>,
  baseName: string,
  format: ExportFormat
): Promise<void> {
  try {
    const blob = await reportFn();
    const timestamp = new Date().toISOString().split("T")[0];
    const fileName = `${baseName}_${timestamp}.${format}`;
    downloadFile(blob, fileName);
  } catch (error) {
    console.error("Error downloading report:", error);
    throw error;
  }
}

// ========================================================================
// FORMATTED REPORT DATA GENERATORS
// ========================================================================

/**
 * Generate progress report data
 */
export interface ProgressReportData {
  studentName: string;
  studentId: string;
  period: string;
  courses: {
    name: string;
    progress: number;
    grade: number;
    status: string;
  }[];
  summary: {
    totalHours: number;
    averageGrade: number;
    completionRate: number;
    streak: number;
  };
  recommendations: string[];
}

/**
 * Generate attendance report data
 */
export interface AttendanceReportData {
  studentName: string;
  period: string;
  totalClasses: number;
  attended: number;
  absent: number;
  late: number;
  attendanceRate: number;
  trends: {
    date: string;
    status: "PRESENT" | "ABSENT" | "LATE";
  }[];
}

/**
 * Generate grades report data
 */
export interface GradesReportData {
  studentName: string;
  courses: {
    name: string;
    assignments: {
      title: string;
      grade: number;
      maxGrade: number;
      date: string;
    }[];
    courseGrade: number;
  }[];
  gpa: number;
  trends: {
    course: string;
    grades: number[];
  }[];
}

/**
 * Generate analytics report data
 */
export interface AnalyticsReportData {
  studentName: string;
  period: string;
  learningMetrics: {
    hoursLearned: number;
    sessionsCompleted: number;
    averageSessionLength: number;
    peakLearningTime: string;
  };
  performance: {
    averageGrade: number;
    completionRate: number;
    improvementTrend: number; // percentage
  };
  engagement: {
    participationRate: number;
    discussionPostsCount: number;
    collaborationScore: number;
  };
  recommendations: string[];
}

/**
 * Generate project report data
 */
export interface ProjectReportData {
  projectTitle: string;
  course: string;
  duration: string;
  status: string;
  description: string;
  learningOutcomes: string[];
  grade?: number;
  feedback?: string;
  collaborators: string[];
}

/**
 * Generate portfolio data
 */
export interface PortfolioReportData {
  studentName: string;
  bio: string;
  skills: string[];
  projects: {
    title: string;
    description: string;
    grade: number;
    date: string;
  }[];
  achievements: {
    title: string;
    date: string;
  }[];
  statistics: {
    totalProjects: number;
    totalAchievements: number;
    totalSkills: number;
  };
}

// ========================================================================
// BATCH EXPORT OPERATIONS
// ========================================================================

/**
 * Export all reports for a student
 */
export async function exportAllStudentReports(
  studentId: string,
  format: ExportFormat = "pdf"
): Promise<Record<ReportType, Blob>> {
  try {
    const reports: Record<string, Blob> = {};

    // Download progress report
    reports.progress = await exportProgressReport(
      studentId,
      new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      new Date(),
      format
    );

    // Download attendance report
    reports.attendance = await exportAttendanceReport(studentId, format);

    // Download grades report
    reports.grades = await exportGradesReport(studentId, undefined, format);

    // Download portfolio
    reports.portfolio = await exportPortfolio(studentId, format);

    return reports;
  } catch (error) {
    console.error("Error exporting all reports:", error);
    throw error;
  }
}

/**
 * Schedule automatic report generation
 */
export async function scheduleReportGeneration(
  studentId: string,
  frequency: "weekly" | "monthly" | "quarterly",
  format: ExportFormat = "pdf"
): Promise<{ success: boolean; scheduleId: string }> {
  try {
    const response = await axios.post("/api/reports/schedule", {
      studentId,
      frequency,
      format,
    });

    return response.data;
  } catch (error) {
    console.error("Error scheduling report:", error);
    throw error;
  }
}

// ========================================================================
// REPORT CUSTOMIZATION
// ========================================================================

/**
 * Generate custom report
 */
export async function generateCustomReport(
  config: {
    title: string;
    sections: string[];
    filters?: Record<string, any>;
    format: ExportFormat;
  }
): Promise<Blob> {
  try {
    const response = await axios.post(
      "/api/reports/custom",
      config,
      { responseType: "blob" }
    );

    return response.data;
  } catch (error) {
    console.error("Error generating custom report:", error);
    throw error;
  }
}

// ========================================================================
// REPORT TEMPLATES
// ========================================================================

export const REPORT_TEMPLATES = {
  parentsWeekly: {
    title: "Weekly Parent Report",
    sections: ["summary", "assignments", "grades", "attendance", "achievements"],
    frequency: "weekly",
  },
  studentMonthly: {
    title: "Monthly Student Report",
    sections: ["progress", "analytics", "achievements", "recommendations"],
    frequency: "monthly",
  },
  administrativeQuarterly: {
    title: "Quarterly Admin Report",
    sections: ["school_metrics", "student_performance", "course_analytics", "alerts"],
    frequency: "quarterly",
  },
  facilitatorWeekly: {
    title: "Weekly Class Report",
    sections: ["class_status", "attendance", "grades", "student_performance"],
    frequency: "weekly",
  },
};
