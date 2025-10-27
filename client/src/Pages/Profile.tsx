import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Loader2, CheckCircle, XCircle, Building, User } from 'lucide-react'; // Added User icon
import api from '../utils/api'; 
import { useProfileCompletion } from '../Hooks/useProfileCompletion'; 
import Button from '../Components/ui/Button'; 
import { Input } from '../Components/ui/Input';   
import { Textarea } from '../Components/ui/Textarea'; 
import useAuthStore from '../Store/authStore'; 
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../Components/ui/Select';

// --- DTO Interfaces ---
interface UserSkillDto {
  skillId: number; 
  id?: number; 
  name?: string; 
}

interface CandidateProfileDto {
  id: number;
  name: string;
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

interface CompanyDto {
    id?: number;
    name: string;
    website: string;
    location: string;
    description: string;
    industry: string;
}

interface RecruiterProfileDto {
    id: number;
    name: string;
    email: string;
    role: string[]; 
    profileCompleted: boolean;
    company: CompanyDto | null;
}

type CandidateProfileUpdateDto = Partial<Omit<CandidateProfileDto, 'id' | 'name' | 'email' | 'role' | 'profileCompleted'>> & {
    skills?: { skillId: number }[]; 
};

interface RecruiterProfileUpdateDto {
    company: Omit<CompanyDto, 'id'>; 
}

interface MasterSkillOption {
  value: number; // skillId
  label: string; // skillName
}

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<CandidateProfileDto | RecruiterProfileDto | null>(null);
  const [formData, setFormData] = useState<any | null>(null); 
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [skillMasterOptions, setSkillMasterOptions] = useState<MasterSkillOption[]>([]); 

  const isCandidate = profile?.role.includes('CANDIDATE');
  const isRecruiter = profile?.role.includes('RECRUITER');

  const isProfileComplete = profile?.profileCompleted;

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/user/profile'); 
      const profileData = response.data.data;
      setProfile(profileData);
      
       if (profileData.role.includes('CANDIDATE')) {
          const candidateData = profileData as CandidateProfileDto;
          setFormData({
              summary: candidateData.summary || '',
              phone: candidateData.phone || '',
              location: candidateData.location || '',
              totalExperience: candidateData.totalExperience ?? '',
              graduationYear: candidateData.graduationYear ?? '', 
              collegeName: candidateData.collegeName || '',
              degree: candidateData.degree || '',
              currentCompany: candidateData.currentCompany || '',
              resumeFilePath: candidateData.resumeFilePath || '',
              skills: candidateData.skills?.map(s => ({ value: s.id || s.skillId, label: s.name || 'Loading...' })) || [],
          });
      } else if (profileData.role.includes('RECRUITER')) {
          const recruiterData = profileData as RecruiterProfileDto;
          setFormData({
              company: { 
                  name: recruiterData.company?.name || '',
                  website: recruiterData.company?.website || '',
                  location: recruiterData.company?.location || '',
                  description: recruiterData.company?.description || '',
                  industry: recruiterData.company?.industry || '',
              } 
          });
      }

      if (response.data.message) {
        toast.info(response.data.message); 
      }
    } catch (error: any) {
      console.error('Fetch Profile Error:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch profile.');
      setProfile(null); 
      setFormData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchSkills = async () => {
   if (profile && profile.role.includes('CANDIDATE')) { 
      try {
          const response = await api.get('/skills'); 
          const skillOptions = response.data.data.map((skill: { id: number, name: string }) => ({
              value: skill.id,
              label: skill.name,
          }));
          setSkillMasterOptions(skillOptions);
      } catch (error: any) {
          console.error('Fetch Skills Error:', error);
          toast.error('Failed to fetch skills list.');
      }
   }
};;

useEffect(() => {
   fetchSkills();
}, [profile]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (formData) {
        if (isRecruiter && name in (formData.company || {})) {
             setFormData({
                 ...formData,
                 company: {
                     ...formData.company,
                     [name]: value,
                 },
             });
        } else {
             setFormData({
                 ...formData,
                 [name]: (name === 'totalExperience' || name === 'graduationYear') ? (value === '' ? null : Number(value)) : value,
             });
        }
    }
  };

  const handleSkillChange = (selectedOptions: any) => {
      if (formData && isCandidate) {
          setFormData({
              ...formData,
              skills: selectedOptions || [], 
          });
      }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData || !profile) return;

    setIsSaving(true);
    try {
      let payload: CandidateProfileUpdateDto | RecruiterProfileUpdateDto;
      const endpoint = '/user/profile';

      if (isCandidate) {
          payload = {
              summary: formData.summary,
              phone: formData.phone,
              location: formData.location,
              totalExperience: formData.totalExperience === '' ? null : Number(formData.totalExperience),
              graduationYear: formData.graduationYear === '' ? null : Number(formData.graduationYear),
              collegeName: formData.collegeName,
              degree: formData.degree,
              currentCompany: formData.currentCompany,
              resumeFilePath: formData.resumeFilePath,
              skills: formData.skills?.map((s: { value: number }) => ({ skillId: s.value })) || [],
          };
      } else if (isRecruiter) {
          payload = {
              company: {
                  name: formData.company.name,
                  website: formData.company.website,
                  location: formData.company.location,
                  description: formData.company.description,
                  industry: formData.company.industry,
              }
          };
      } else {
          throw new Error("Invalid user role for profile update.");
      }

      const response = await api.put(endpoint, payload);

      // Update local state with the response data
      const updatedProfileData = response.data.data;
      setProfile(updatedProfileData);
      
      // Re-initialize form data correctly after update
      if (updatedProfileData.role.includes('CANDIDATE')) {
          const candidateData = updatedProfileData as CandidateProfileDto;
           setFormData({
                summary: candidateData.summary || '',
                phone: candidateData.phone || '',
                location: candidateData.location || '',
                totalExperience: candidateData.totalExperience ?? '',
                graduationYear: candidateData.graduationYear ?? '',
                collegeName: candidateData.collegeName || '',
                degree: candidateData.degree || '',
                currentCompany: candidateData.currentCompany || '',
                resumeFilePath: candidateData.resumeFilePath || '',
                skills: candidateData.skills?.map(s => {
                    const master = skillMasterOptions.find(opt => opt.value === (s.id || s.skillId));
                    return { value: s.id || s.skillId, label: master?.label || s.name || '...' };
                }) || [],
            });
      } else if (updatedProfileData.role.includes('RECRUITER')) {
            const recruiterData = updatedProfileData as RecruiterProfileDto;
            setFormData({
                company: { ...(recruiterData.company || {}) } // Handle null company
            });
       }


      setIsEditing(false);
      toast.success(response.data.message || 'Profile updated successfully!');

    } catch (error: any) {
      console.error("Update Profile Error:", error);
      toast.error(error.response?.data?.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  // --- Loading & Error States ---
  if (isLoading) {
    return <Loader2 className="animate-spin w-8 h-8 mx-auto mt-20 text-orange-500" />;
  }

  if (!profile || !formData) {
    return <p className="text-center mt-20 text-red-600">Could not load profile data.</p>;
  }

  // --- Render ---
  return (
    <div className="max-w-4xl mx-auto my-10 p-6 md:p-8 bg-white rounded-lg shadow-md border border-gray-100">
      {/* --- Header --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{profile.name}</h1>
          <p className="text-sm md:text-md text-gray-500">{profile.email}</p>
        </div>
        <div className="flex flex-col items-start sm:items-end gap-2 w-full sm:w-auto">
          {/* Status Badge */}
           {isProfileComplete === null || isProfileComplete === undefined ? ( // Check undefined too
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">Loading status...</span>
          ) : isProfileComplete ? (
            <span className="flex items-center px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700"><CheckCircle className="w-4 h-4 mr-1" /> Profile Complete</span>
          ) : (
            <span className="flex items-center px-3 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700"><XCircle className="w-4 h-4 mr-1" /> Profile Incomplete</span> // Changed to yellow for incomplete
          )}
          {/* Edit Button */}
          <Button
            variant={isEditing ? 'outline' : 'primary'}
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            disabled={isSaving}
            className="w-full sm:w-auto"
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </Button>
        </div>
      </div>

      {/* --- Form --- */}
      <form onSubmit={handleSubmit}>

        {/* === CANDIDATE FIELDS === */}
        {isCandidate && (
          <>
             <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center">
                 <User className="w-5 h-5 mr-2 text-orange-500"/> Candidate Details
             </h2>
            {/* Summary */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Summary</label>
              <Textarea name="summary" value={formData.summary} onChange={handleChange} rows={3} disabled={!isEditing} placeholder="Tell us about yourself"/>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone</label><Input name="phone" value={formData.phone} onChange={handleChange} disabled={!isEditing} placeholder="Your phone number" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Location</label><Input name="location" value={formData.location} onChange={handleChange} disabled={!isEditing} placeholder="City, Country"/></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Degree</label><Input name="degree" value={formData.degree} onChange={handleChange} disabled={!isEditing} placeholder="e.g., B.Tech CSE"/></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">College</label><Input name="collegeName" value={formData.collegeName} onChange={handleChange} disabled={!isEditing} placeholder="University name"/></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Graduation Year</label><Input name="graduationYear" value={formData.graduationYear ?? ''} onChange={handleChange} disabled={!isEditing} type="number" placeholder="YYYY"/></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Total Experience (Years)</label><Input name="totalExperience" value={formData.totalExperience ?? ''} onChange={handleChange} disabled={!isEditing} type="number" placeholder="e.g., 5"/></div>
              <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Current/Last Company</label><Input name="currentCompany" value={formData.currentCompany} onChange={handleChange} disabled={!isEditing} placeholder="Company name"/></div>
              {/* Consider adding Resume upload/link field later */}
            </div>

            {/* Skills Section - Using react-select */}
             <div className="space-y-2">
  <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
  <div className="flex flex-wrap gap-2">
    {formData.skills?.length > 0 ? (
      formData.skills.map((s: { value: number; label: string }) => (
        <span
          key={s.value}
          className="inline-flex items-center bg-orange-100 text-orange-700 text-sm px-3 py-1 rounded-full"
        >
          {s.label}
          {isEditing && (
            <button
              type="button"
              onClick={() =>
                handleSkillChange(formData.skills.filter((sk: any) => sk.value !== s.value))
              }
              className="ml-2 text-orange-500 hover:text-orange-700"
            >
              ×
            </button>
          )}
        </span>
      ))
    ) : (
      <span className="text-gray-400 text-sm">No skills selected</span>
    )}
  </div>

  {isEditing && (
    <Select
      onValueChange={(val) => {
        // Find the selected skill from master list
        const selected = skillMasterOptions.find((s) => s.value === Number(val));
        if (selected && !formData.skills.some((s: any) => s.value === selected.value)) {
          handleSkillChange([...formData.skills, selected]);
        }
      }}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a skill" />
      </SelectTrigger>
      <SelectContent>
        {skillMasterOptions.map((opt) => (
          <SelectItem key={opt.value} value={String(opt.value)}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )}
</div>

          </>
        )}

        {/* === RECRUITER FIELDS === */}
        {isRecruiter && ( // Render only if company data exists or is being edited
            <>
                 <h2 className="text-xl font-semibold text-gray-800 mb-4 mt-6 border-b pb-2 flex items-center">
                     <Building className="w-5 h-5 mr-2 text-orange-500"/> Company Details
                 </h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label><Input name="name" value={formData.company?.name || ''} onChange={handleChange} disabled={!isEditing} placeholder="Your company's name" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Website</label><Input name="website" value={formData.company?.website || ''} onChange={handleChange} disabled={!isEditing} placeholder="https://company.com"/></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Location</label><Input name="location" value={formData.company?.location || ''} onChange={handleChange} disabled={!isEditing} placeholder="City, Country"/></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Industry</label><Input name="industry" value={formData.company?.industry || ''} onChange={handleChange} disabled={!isEditing} placeholder="e.g., Technology"/></div>
                    <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><Textarea name="description" value={formData.company?.description || ''} onChange={handleChange} rows={3} disabled={!isEditing} placeholder="Brief company overview"/></div>
                 </div>
                 {!formData.company && !isEditing && (
                     <p className="text-sm text-gray-500">No company details associated. Click 'Edit Profile' to add.</p>
                 )}
            </>
        )}

        {/* --- Save Button (Edit Mode) --- */}
        {isEditing && (
          <div className="mt-8 text-right">
            <Button
              type="submit"
              variant="success"
              size="md"
              loading={isSaving}
              disabled={isSaving}
            >
              Save Changes
            </Button>
          </div>
        )}
      </form>
    </div>
  );
};

export default Profile;
