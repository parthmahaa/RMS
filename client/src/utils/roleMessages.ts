import type { Role } from './permissions';
export const getRoleDisplayName = (role: Role): string => {
  const roleNames: Record<Role, string> = {
    ADMIN: 'Administrator',
    RECRUITER: 'Recruiter',
    HR: 'HR Manager',
    INTERVIEWER: 'Interviewer',
    REVIEWER: 'CV Reviewer',
    VIEWER: 'Viewer',
    CANDIDATE: 'Candidate',
  };
  return roleNames[role] || role;
};

export const getRoleDescription = (role: Role): string => {
  const descriptions: Record<Role, string> = {
    ADMIN: 'Full system access with user management capabilities',
    RECRUITER: 'Manages job openings, candidate profiles, and interviews',
    HR: 'Handles culture fit, negotiations, and documentation',
    INTERVIEWER: 'Conducts interviews and provides feedback',
    REVIEWER: 'Screens CVs and shortlists candidates',
    VIEWER: 'Read-only access to all recruitment data',
    CANDIDATE: 'Job seeker with application tracking',
  };
  return descriptions[role] || '';
};

export const getPermissionDeniedMessage = (action: string): string => {
  return `You don't have permission to ${action}. Contact your administrator if you need access.`;
};

export const isInternalRole = (role: Role): boolean => {
  return role !== 'CANDIDATE';
};

export const getRoleBadgeColor = (role: Role): string => {
  const colors: Record<Role, string> = {
    ADMIN: 'bg-purple-100 text-purple-700 border-purple-200',
    RECRUITER: 'bg-blue-100 text-blue-700 border-blue-200',
    HR: 'bg-green-100 text-green-700 border-green-200',
    INTERVIEWER: 'bg-orange-100 text-orange-700 border-orange-200',
    REVIEWER: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    VIEWER: 'bg-gray-100 text-gray-700 border-gray-200',
    CANDIDATE: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  };
  return colors[role] || 'bg-gray-100 text-gray-700 border-gray-200';
};