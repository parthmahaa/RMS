import React from 'react';
import { usePermissions } from '../../Hooks/usePermissions';
import type { Permission } from '../../utils/permissions';

interface RoleBasedAccessProps {
  children: React.ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
}

export const RoleBasedAccess: React.FC<RoleBasedAccessProps> = ({
  children,
  permission,
  permissions,
  requireAll = false,
  fallback = null,
}) => {
  const perms = usePermissions();

  let hasAccess = false;

  if (permission) {
    hasAccess = perms.can(permission);
  } else if (permissions && permissions.length > 0) {
    hasAccess = requireAll 
      ? perms.canAll(permissions)
      : perms.canAny(permissions);
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

export default RoleBasedAccess;