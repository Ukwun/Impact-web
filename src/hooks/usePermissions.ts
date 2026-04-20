'use client';

import { useAuthStore } from '@/context/AuthStore';
import { getPermissionsByRole, hasPermission } from '@/lib/rbac';

/**
 * Hook to check user permissions based on their role
 */
export function usePermissions() {
  const { user, logout } = useAuthStore();

  const userPermissions = user ? getPermissionsByRole(user.role) : [];

  const checkPermission = (requiredPermission: string): boolean => {
    return hasPermission(userPermissions, requiredPermission);
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(permission => checkPermission(permission));
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(permission => checkPermission(permission));
  };

  return {
    user,
    permissions: userPermissions,
    checkPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAuthenticated: !!user,
    role: user?.role,
    logout,
  };
}
