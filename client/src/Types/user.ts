export interface UserSkillDto {
  skillId: number;
  id?: number;
  name?: string;
}

export interface CandidateProfileDto {
  id: number;
  name: string;
  branch : string;
  email: string;
  role: string[];
  profileCompleted: boolean;
  summary: string;
  phone: string;
  location: string;
  totalExperience: number | null;
  graduationYear: number | null;
  collegeName: string;
  degree: string;
  currentCompany?: string;
  resumeFilePath?: string;
  skills: UserSkillDto[];
}

export interface CompanyDto {
  id?: number;
  name: string;
  website: string;
  location: string;
  description: string;
  industry: string;
}

export interface RecruiterProfileDto {
  id: number;
  name: string;
  email: string;
  role: string[];
  profileCompleted: boolean;
  company: CompanyDto | null;
}

export type CandidateProfileUpdateDto = Partial<Omit<CandidateProfileDto, 'id' | 'name' | 'email' | 'role' | 'profileCompleted'>> & {
  skills?: { skillId: number }[];
};

export interface RecruiterProfileUpdateDto {
  company: Omit<CompanyDto, 'id'>;
}

export interface MasterSkillOption {
  value: number; // skillId
  label: string; // skillName
}