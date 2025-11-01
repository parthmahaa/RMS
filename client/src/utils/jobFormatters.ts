export const formatJobStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    'OPEN': 'Open',
    'CLOSED': 'Closed',
    'HOLD': 'Hold'
  };
  return statusMap[status] || status;
};

export const formatJobType = (type: string): string => {
  const typeMap: Record<string, string> = {
    'FULLTIME': 'Full-time',
    'PART_TIME': 'Part-time',
    'CONTRACT': 'Contract',
    'INTERN': 'Internship'
  };
  return typeMap[type] || type;
};

export const formatWorkMode = (mode: string): string => {
  const modeMap: Record<string, string> = {
    'REMOTE': 'Remote',
    'ONSITE': 'On-site',
    'HYBRID': 'Hybrid'
  };
  return modeMap[mode] || mode;
};

export const formatDateTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatApplicationStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    'PENDING': 'Pending',
    'ACCEPTED': 'Accepted',
    'REJECTED': 'Rejected',
    'REVIEWED': 'Under Review'
  };
  return statusMap[status] || status;
};