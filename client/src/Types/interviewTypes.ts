export interface InterviewRound {
  id: number;
  roundNumber: number;
  roundType: string;
  status: string;
  scheduledAt?: string;
  comments?: string;
  meetingLink?: string;
}

export type InterviewStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'HIRED' | 'REJECTED';

export interface CreateInterviewDto {
  applicationId: number;
  roundTypes?: string[]; 
}


export interface CompleteInterviewDto {
  finalStatus: 'HIRED' | 'REJECTED';
  finalComments: string;
}


export interface Interview {
  id: number;
  applicationId: number;
  jobId: number;
  candidateId: number;
  candidateName: string;
  position: string;
  companyName: string;
  status: InterviewStatus;
  createdAt: string;
  updatedAt: string;
  finalComments?: string;
  rounds: InterviewRound[];
  resumeFilePath?: string;
  skills?: Array<{
    id: number;
    skillId: number;
    skillName: string;
    yearsOfExperience: number;
  }>;
  candidateExperience?: number;
}