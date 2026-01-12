// Role-based permission utilities

export type Role = 
  | 'ADMIN'
  | 'RECRUITER' 
  | 'HR'
  | 'INTERVIEWER'
  | 'REVIEWER'
  | 'VIEWER'
  | 'CANDIDATE';

export type Permission =
  | 'job:create'
  | 'job:edit'
  | 'job:delete'
  | 'job:close'
  | 'job:view'
  
  | 'application:view'
  | 'application:review'
  | 'application:accept'
  | 'application:reject'
  | 'application:update_status'
  | 'application:add_comment'
  | 'application:assign_reviewers'
  
  | 'interview:view'
  | 'interview:schedule'
  | 'interview:edit'
  | 'interview:provide_feedback'
  | 'interview:assign_interviewer'
  | 'interview:make_final_decision'
  | 'interview:view_feedback'
  
  | 'user:view'
  | 'user:create'
  | 'user:edit'
  | 'user:delete'
  | 'user:manage_roles'
  
  | 'candidate:view_profile'
  | 'candidate:view_resume';

const rolePermissions: Record<Role, Permission[]> = {
  ADMIN: [
    'job:create', 'job:edit', 'job:delete', 'job:close', 'job:view',
    'application:view', 'application:review', 'application:accept', 'application:reject', 
    'application:update_status', 'application:add_comment', 'application:assign_reviewers',
    'interview:view', 'interview:schedule', 'interview:edit', 'interview:provide_feedback',
    'interview:assign_interviewer', 'interview:make_final_decision', 'interview:view_feedback',
    'user:view', 'user:create', 'user:edit', 'user:delete', 'user:manage_roles',
    'candidate:view_profile', 'candidate:view_resume',
  ],
  
  RECRUITER: [
    'job:create', 'job:edit', 'job:delete', 'job:close', 'job:view',
    'application:view', 'application:review', 'application:accept', 'application:reject',
    'application:update_status', 'application:add_comment', 'application:assign_reviewers',
    'interview:view', 'interview:schedule', 'interview:edit', 'interview:assign_interviewer',
    'interview:make_final_decision', 'interview:view_feedback',
    'user:view', 'user:create',
    'candidate:view_profile', 'candidate:view_resume',
  ],
  
  HR: [
    'job:view', 'job:edit', 
    'application:view', 'application:update_status', 'application:add_comment',
    'interview:view', 'interview:schedule', 'interview:edit', 'interview:provide_feedback',
    'interview:make_final_decision', 'interview:view_feedback',
    'candidate:view_profile', 'candidate:view_resume',
  ],
  
  INTERVIEWER: [
    'interview:view', 'interview:schedule', 'interview:edit', 'interview:provide_feedback',
    'interview:assign_interviewer', 'interview:make_final_decision', 'interview:view_feedback',
    'application:view',
    'candidate:view_profile', 'candidate:view_resume',
  ],
  
  REVIEWER: [
    'job:view',
    'application:view', 'application:review', 'application:accept', 'application:reject',
    'application:update_status', 'application:add_comment',
    'candidate:view_profile', 'candidate:view_resume',
  ],
  
  VIEWER: [
    'job:view',
    'application:view',
    'interview:view', 'interview:view_feedback',
    'user:view',
    'candidate:view_profile', 'candidate:view_resume',
  ],
  
  CANDIDATE: [
  ],
};

export const hasPermission = (
  userRoles: Role[],
  permission: Permission
): boolean => {
  if (!userRoles || userRoles.length === 0) return false;
  
  return userRoles.some(role => {
    const permissions = rolePermissions[role as Role] || [];
    return permissions.includes(permission);
  });
};

export const hasAnyPermission = (
  userRoles: Role[],
  permissions: Permission[]
): boolean => {
  return permissions.some(permission => hasPermission(userRoles, permission));
};

export const hasAllPermissions = (
  userRoles: Role[],
  permissions: Permission[]
): boolean => {
  return permissions.every(permission => hasPermission(userRoles, permission));
};

export const getUserPermissions = (userRoles: Role[]): Permission[] => {
  if (!userRoles || userRoles.length === 0) return [];
  
  const allPermissions = new Set<Permission>();
  userRoles.forEach(role => {
    const permissions = rolePermissions[role as Role] || [];
    permissions.forEach(p => allPermissions.add(p));
  });
  
  return Array.from(allPermissions);
};

export const hasRole = (userRoles: Role[], role: Role): boolean => {
  if (!userRoles || userRoles.length === 0) return false;
  return userRoles.includes(role);
};

export const hasAnyRole = (userRoles: Role[], roles: Role[]): boolean => {
  if (!userRoles || userRoles.length === 0) return false;
  return roles.some(role => userRoles.includes(role));
};