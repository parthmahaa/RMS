import { useMemo } from 'react';
import useAuthStore from '../Store/authStore';
import { 
  hasPermission, 
  hasAnyPermission, 
  hasAllPermissions,
  hasRole,
  hasAnyRole,
  getUserPermissions,
  type Permission,
  type Role 
} from '../utils/permissions';

/**
 * Custom hook for checking user permissions
 * Provides easy access to permission checking functions
 */
export const usePermissions = () => {
  const roles = useAuthStore((state: any) => state.roles as Role[]);

  const permissions = useMemo(() => ({
    // Check if user has a specific permission
    can: (permission: Permission): boolean => {
      return hasPermission(roles, permission);
    },

    // Check if user has any of the specified permissions
    canAny: (permissions: Permission[]): boolean => {
      return hasAnyPermission(roles, permissions);
    },

    // Check if user has all of the specified permissions
    canAll: (permissions: Permission[]): boolean => {
      return hasAllPermissions(roles, permissions);
    },

    // Check if user has a specific role
    is: (role: Role): boolean => {
      return hasRole(roles, role);
    },

    // Check if user has any of the specified roles
    isAny: (roles: Role[]): boolean => {
      return hasAnyRole(roles, roles);
    },

    // Get all user permissions
    all: (): Permission[] => {
      return getUserPermissions(roles);
    },

    // Get user roles
    roles: roles || [],
  }), [roles]);

  return permissions;
};

export default usePermissions;