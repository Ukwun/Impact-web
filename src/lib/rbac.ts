/**
 * Get the appropriate dashboard route based on user role
 */
export function getDashboardRoute(role: string | undefined): string {
  if (!role || typeof role !== 'string') return "/dashboard";

  const roleMap: Record<string, string> = {
    STUDENT: "/dashboard/student",
    PARENT: "/dashboard/parent",
    FACILITATOR: "/dashboard/facilitator",
    SCHOOL_ADMIN: "/dashboard/admin",
    UNI_MEMBER: "/dashboard/university",
    CIRCLE_MEMBER: "/dashboard/circle-member",
    ADMIN: "/dashboard/admin",
    MENTOR: "/dashboard/mentor",
  };

  const normalizedRole = role.trim().toUpperCase();
  return roleMap[normalizedRole] || "/dashboard";
}

/**
 * Get permissions based on user role
 */
export function getPermissionsByRole(role: string | undefined): string[] {
  const permissions: Record<string, string[]> = {
    STUDENT: [
      // Authentication & Profile
      "auth.register",
      "profile.edit_own",

      // Learning Management System
      "lms.view_courses",
      "lms.take_quiz",
      "lms.upload_assignment",
      "lms.mark_completion",

      // Attendance
      "attendance.view_own",

      // Community
      "community.view_groups",
      "community.post",
      "community.report_content",

      // Events
      "events.view",
      "events.register",

      // Certification
      "certification.view",
      "certification.download",
      "certification.validate_qr",

      // Safeguarding
      "safeguarding.report_incident",
      "safeguarding.view_own_case",
    ],
    PARENT: [
      // Authentication & Profile
      "auth.register",
      "profile.edit_own",

      // Learning Management System (child access)
      "lms.view_child_courses",

      // Attendance (child access)
      "attendance.view_child",

      // Events
      "events.view",
      "events.register",

      // Payments
      "payments.make",
      "payments.view_own",

      // Certification (child access)
      "certification.view_child",
      "certification.validate_qr",

      // Safeguarding (child access)
      "safeguarding.view_child_case",
      "safeguarding.report_incident",
    ],
    FACILITATOR: [
      // Authentication & Profile
      "auth.register",
      "profile.edit_own",

      // Learning Management System
      "lms.view_courses",
      "lms.grade_assignment",
      "lms.create_course",

      // Attendance
      "attendance.mark",
      "attendance.view",

      // Community
      "community.view_groups",
      "community.post",
      "community.moderate",
      "community.report_content",

      // Events
      "events.view",
      "events.register",
      "events.create_school",
      "events.qr_check_in",

      // Venture Lab (ImpactUni Only)
      "venture.mentor_scheduling",

      // Certification
      "certification.view",
      "certification.download",
      "certification.validate_qr",

      // Safeguarding
      "safeguarding.report_incident",
      "safeguarding.view_school_cases",
    ],
    SCHOOL_ADMIN: [
      // Authentication & Profile
      "auth.register",
      "auth.approve_users_school",
      "profile.edit_own",

      // Learning Management System
      "lms.view_courses",
      "lms.create_course",

      // Attendance
      "attendance.mark",
      "attendance.view",
      "attendance.export",

      // Community
      "community.view_groups",
      "community.post",
      "community.moderate",
      "community.report_content",
      "community.view_reports",

      // Events
      "events.view",
      "events.register",
      "events.create_school",
      "events.qr_check_in",
      "events.export_report",

      // Payments
      "payments.view_own",
      "payments.generate_invoice",

      // Certification
      "certification.view",
      "certification.download",
      "certification.validate_qr",

      // Safeguarding
      "safeguarding.report_incident",
      "safeguarding.view_school_cases",
    ],
    UNI_MEMBER: [
      // Authentication & Profile
      "auth.register",
      "profile.edit_own",

      // Learning Management System
      "lms.view_courses",
      "lms.take_quiz",
      "lms.upload_assignment",
      "lms.mark_completion",

      // Community
      "community.view_groups",
      "community.post",
      "community.report_content",

      // Events
      "events.view",
      "events.register",
      "events.create_campus",

      // Venture Lab
      "venture.create_profile",
      "venture.edit_milestones",
      "venture.mentor_scheduling",
      "venture.submit_pitch",

      // Payments
      "payments.make",
      "payments.view_own",

      // Certification
      "certification.view",
      "certification.download",
      "certification.validate_qr",

      // Safeguarding
      "safeguarding.report_incident",
      "safeguarding.view_own_case",
    ],
    CIRCLE_MEMBER: [
      // Authentication & Profile
      "auth.register",
      "profile.edit_own",

      // Learning Management System
      "lms.view_courses",

      // Community
      "community.view_groups",
      "community.post",
      "community.report_content",

      // Events
      "events.view",
      "events.register",
      "events.create_circle",

      // ImpactCircle
      "circle.view_directory",
      "circle.access_resource_vault",
      "circle.rsvp_roundtable",

      // Payments
      "payments.make",
      "payments.view_own",

      // Certification
      "certification.view",
      "certification.download",
      "certification.validate_qr",

      // Safeguarding
      "safeguarding.report_incident",
      "safeguarding.view_own_case",
    ],
    ADMIN: [
      // All permissions
      "all.access",

      // Additional admin permissions
      "auth.approve_users_all",
      "auth.role_assignment",
      "analytics.export",
      "certificate.issue",
      "safeguarding.assign_officer",
      "safeguarding.close_case",
      "payments.reconcile",
      "payments.export_report",
    ],
  };

  if (!role) return [];
  return permissions[role.toUpperCase()] || [];
}

/**
 * Check if user has permission
 */
export function hasPermission(
  userPermissions: string[],
  requiredPermission: string
): boolean {
  return (
    userPermissions.includes("all.access") ||
    userPermissions.includes(requiredPermission)
  );
}
