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
  recruiterComment: string | null;
  status: string;
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
  skillRequirementIds: number[];
  applications: JobApplication[];
}

export interface JobFormData {
  position: string;
  description: string;
  location: string;
  type: string;
  skillRequirementIds: number[];
}

// Props types
export interface JobCardProps {
  job: Job;
  onDelete: (jobId: number) => void;
  onClose: (jobId: number) => void;
  onView: (jobId: number) => void;
  onEdit: (jobId: number) => void;
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