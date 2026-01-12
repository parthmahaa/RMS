// Job-related type definitions matching Java DTOs

export interface Skill {
  id: number;
  name: string;
}

export interface JobApplication {
  id: number;
  jobId: number;
  candidateId: number;
  appliedAt: string;
  candidateName: string ;
  recruiterComment: string | null;
  status: ApplicationStatus;
  position?: string;
  coverLetter?: string;
  resumeFilePath?: string;
  companyName?: string;
  skills: SkillWithYoe[];
  location?: string;
  type?: string;
}

export interface SkillWithYoe{
  skill : Skill,
  yearsOfExperience : number
}

export interface Job {
  id: number;
  position: string;
  yoer : number;
  description: string;
  location: string;
  type: string;
  status: string;
  postedAt: string;
  closeComment: string | null;
  closeReason: string | null;
  selectedCandidateIds: number[];
  companyName: string;
  createdById: number;
  requiredSkills: SkillDto[]; // Minimum required skills
  preferredSkills: SkillDto[]; // All preferred skills
  applications: JobApplication[];
}

export interface JobFormData {
  position: string;
  description: string;
  yoer : number;
  status: string;
  location: string;
  type: string;
  requiredSkillIds: number[]; // Minimum required skills
  preferredSkillIds: number[]; // All preferred skills
}

// Props types
export interface JobCardProps {
  job: Job;
  onDelete: (jobId: number) => void;
  onClose: (jobId: number) => void;
  onView: (jobId: number) => void;
  onEdit: (jobId: number) => void;
}

export interface SkillDto {
  skillId: number;
  skillName: string;
  mandatory?: boolean;
}

export interface JobFormProps {
  jobId?: number;
  initialData?: Job;
  onSuccess: (data: JobFormData) => Promise<void>;
  onCancel?: () => void;
}

export interface DeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  jobTitle: string;
  hasApplicants?: boolean;
  closeReason?: string;
  closeComment?: string;
  onReasonChange?: (reason: string) => void;
  onCommentChange?: (comment: string) => void;
}

export interface CloseDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  jobTitle: string;
  closeReason: string;
  closeComment: string;
  onReasonChange: (reason: string) => void;
  onCommentChange: (comment: string) => void;
}

// Candidate-specific types
export interface JobApplicationFormData {
  coverLetter: string;
  resumeFilePath?: string;
  jobId: number;
  candidateId: number;
}

export interface CandidateJobCardProps {
  job: Job;
  onApply: (jobId: number) => void;
  onView: (jobId: number) => void;
  hasApplied: boolean;
}

export interface ApplicationFormProps {
  open: boolean;
  job: Job;
  onClose: () => void;
}
export type ApplicationStatus = 
  | 'PENDING' 
  | 'REVIEWED' 
  | 'LINKED' 
  | 'ACCEPTED' 
  | 'REJECTED'
  | 'TEST_SCHEDULED'
  | 'INTERVIEW_SCHEDULED'
  | 'HIRED';

export const formatApplicationStatus = (status: ApplicationStatus): string => {
  return status.replace(/_/g, ' ');
};

// Helper function to get status color
export const getApplicationStatusColor = (status: ApplicationStatus): string => {
  switch (status) {
    case 'HIRED':
      return 'emerald';
    case 'ACCEPTED':
      return 'green';
    case 'REJECTED':
      return 'red';
    case 'INTERVIEW_SCHEDULED':
      return 'indigo';
    case 'TEST_SCHEDULED':
      return 'orange';
    case 'REVIEWED':
      return 'blue';
    case 'LINKED':
      return 'purple';
    default:
      return 'yellow';
  }
};