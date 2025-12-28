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
  status: string;
  position?: string;
  coverLetter?: string;
  resumeFilePath?: string;
  companyName?: string;
  location?: string;
  type?: string;
}

export interface Job {
  id: number;
  position: string;
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