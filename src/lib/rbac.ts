/**
 * Get the appropriate dashboard route based on user role
 */
export function getDashboardRoute(role: string | undefined): string {
  if (!role) return "/dashboard/student";

  const roleMap: Record<string, string> = {
    STUDENT: "/dashboard",
    PARENT: "/dashboard",
    FACILITATOR: "/dashboard",
    SCHOOL_ADMIN: "/dashboard",
    UNI_MEMBER: "/dashboard",
    CIRCLE_MEMBER: "/dashboard",
    ADMIN: "/dashboard",
    // Fallback for other cases
  };

  return roleMap[role.toUpperCase()] || "/dashboard";
}

/**
 * Get permissions based on user role
 */
export function getPermissionsByRole(role: string | undefined): string[] {
  const permissions: Record<string, string[]> = {
    STUDENT: [
      "learning.view",
      "learning.complete",
      "event.view",
      "event.register",
      "community.view",
      "community.post",
      "certification.view",
      "certification.download",
      "profile.edit",
    ],
    PARENT: [
      "learning.view_child",
      "event.view",
      "event.register",
      "certification.view_child",
      "payment.make",
      "profile.edit",
    ],
    FACILITATOR: [
      "learning.view",
      "attendance.mark",
      "attendance.view",
      "event.create_school",
      "event.check_in",
      "community.post",
      "community.moderate",
      "assignment.grade",
      "profile.edit",
    ],
    SCHOOL_ADMIN: [
      "learning.view",
      "attendance.view",
      "attendance.export",
      "event.create_school",
      "user.approve_school",
      "community.post",
      "community.moderate",
      "analytics.view",
      "payment.view",
      "payment.generate_invoice",
      "profile.edit",
    ],
    UNI_MEMBER: [
      "learning.view",
      "learning.complete",
      "event.view",
      "event.register",
      "event.create_campus",
      "community.view",
      "community.post",
      "venture.create",
      "venture.pitch",
      "certification.view",
      "certification.download",
      "payment.make",
      "profile.edit",
    ],
    CIRCLE_MEMBER: [
      "learning.view",
      "event.view",
      "event.register",
      "event.create_circle",
      "community.access_vault",
      "community.view_directory",
      "community.rsvp_roundtable",
      "certification.view",
      "certification.download",
      "payment.make",
      "profile.edit",
    ],
    ADMIN: [
      "all.access", // Admin has access to everything
      "analytics.export",
      "certificate.issue",
      "user.assign_role",
      "safeguarding.assign_officer",
      "safeguarding.close_case",
      "payment.reconcile",
    ],
  };

  return permissions[role?.toUpperCase() || "STUDENT"] || [];
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
