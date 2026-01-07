import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import api from '../utils/api';
import Button from '../Components/ui/Button';
import Input from '../Components/ui/Input';
import FormSection from '../Components/ui/FormSection';
import { useProfileCompletion } from '../Hooks/useProfileCompletion'
import AutocompleteWoControl from '../Components/ui/AutoCompleteWoControl';
import type { CandidateProfileDto, CandidateProfileUpdateDto, MasterSkillOption, RecruiterProfileDto, RecruiterProfileUpdateDto } from '../Types/user';

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<CandidateProfileDto | RecruiterProfileDto | null>(null);
  const [formData, setFormData] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [skillMasterOptions, setSkillMasterOptions] = useState<MasterSkillOption[]>([]);
  const isCandidate = profile?.role.includes('CANDIDATE');
  const canEditProfile =
    profile?.role.includes('CANDIDATE') ||
    profile?.role.includes('RECRUITER');
  const isRecruiter = profile?.role.includes('RECRUITER') || profile?.role.includes('REVIEWER') || profile?.role.includes('VIEWER') || profile?.role.includes('INTERVIEWER') || profile?.role.includes('HR');
  const { isProfileComplete, refreshProfileStatus } = useProfileCompletion();

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/user/profile');
      const profileData = response.data.data;
      setProfile(profileData);

      if (profileData.role.includes('CANDIDATE')) {
        const candidateData = profileData as CandidateProfileDto;
        setFormData({
          id: candidateData.id,
          summary: candidateData.summary || '',
          phone: candidateData.phone || '',
          location: candidateData.location || '',
          totalExperience: candidateData.totalExperience ?? '',
          graduationYear: candidateData.graduationYear ?? '',
          branch: candidateData.branch,
          collegeName: candidateData.collegeName || '',
          degree: candidateData.degree || '',
          currentCompany: candidateData.currentCompany || '',
          resumeFilePath: candidateData.resumeFilePath || '',
          skills: candidateData.skills?.map(s => ({ value: s.skillId, label: s.name || 'Loading...' })) || [],
        });
      } else if (profileData.role.includes('RECRUITER')
        || profileData.role.includes('REVIEWER')
        || profileData.role.includes('VIEWER')
        || profileData.role.includes('INTERVIEWER')
        || profileData.role.includes('HR')) {
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
          branch: formData.branch,
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

      const updatedProfileData = response.data.data;
      setProfile(updatedProfileData);

      if (updatedProfileData.role.includes('CANDIDATE')) {
        const candidateData = updatedProfileData as CandidateProfileDto;
        setFormData({
          summary: candidateData.summary || '',
          phone: candidateData.phone || '',
          location: candidateData.location || '',
          branch: candidateData.branch,
          totalExperience: candidateData.totalExperience ?? '',
          graduationYear: candidateData.graduationYear ?? '',
          collegeName: candidateData.collegeName || '',
          degree: candidateData.degree || '',
          currentCompany: candidateData.currentCompany || '',
          resumeFilePath: candidateData.resumeFilePath || '',
          skills: candidateData.skills?.map(s => {
            const master = skillMasterOptions.find(opt => opt.value === s.skillId);
            return { value: s.skillId, label: master?.label || s.name || '...' };
          }) || [],
        });
      } else if (updatedProfileData.role.includes('RECRUITER')) {
        const recruiterData = updatedProfileData as RecruiterProfileDto;
        setFormData({
          company: { ...(recruiterData.company || {}) } // Ha ndle null company
        });
      }


      setIsEditing(false);
      toast.success(response.data.message || 'Profile updated successfully!');
      refreshProfileStatus();
    } catch (error: any) {
      console.error("Update Profile Error:", error);
      toast.error(error.response?.data?.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <Loader2 className="animate-spin w-8 h-8 mx-auto mt-20 text-orange-500" />;
  }

  if (!profile || !formData) {
    return <p className="text-center mt-20 text-red-600">Could not load profile data.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{profile.name}</h1>
          <p className="text-sm md:text-md text-gray-500">{profile.email}</p>
        </div>
        <div className="flex flex-col items-start sm:items-end gap-2 w-full sm:w-auto">
          {isProfileComplete === null || isProfileComplete === undefined ? ( // Check undefined too
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">Loading status...</span>
          ) : isProfileComplete ? (
            <span className="flex items-center px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700"><CheckCircle className="w-4 h-4 mr-1" /> Profile Complete</span>
          ) : (
            <span className="flex items-center px-3 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700"><XCircle className="w-4 h-4 mr-1" /> Profile Incomplete</span> // Changed to yellow for incomplete
          )}
          {canEditProfile && (
            <Button
              id="edit profile"
              variant={isEditing ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setIsEditing(!isEditing)}
              disabled={isSaving}
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {isCandidate && (
          <FormSection title="Candidate Details">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Summary</label>
              <Input id='summary' multiline name="summary" value={formData.summary} onChange={handleChange} rows={3} disabled={!isEditing} placeholder="Tell us about yourself" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div><label className="block text-sm font-medium text-black mb-1">Phone</label><Input id='phone' name="phone" value={formData.phone} onChange={handleChange} disabled={!isEditing} placeholder="Your phone number" /></div>
              <div><label className="block text-sm font-medium text-black mb-1">Location</label><Input id='location' name="location" value={formData.location} onChange={handleChange} disabled={!isEditing} placeholder="City, Country" /></div>
              <div><label className="block text-sm font-medium text-black mb-1">Degree</label><Input id='degree' name="degree" value={formData.degree} onChange={handleChange} disabled={!isEditing} placeholder="e.g., B.Tech" /></div>
              <div><label className="block text-sm font-medium text-black mb-1">Branch</label><Input id='branch' name="branch" value={formData.branch} onChange={handleChange} disabled={!isEditing} placeholder="Computer Engineering" /></div>
              <div><label className="block text-sm font-medium text-black mb-1">College</label><Input id='collegeName' name="collegeName" value={formData.collegeName} onChange={handleChange} disabled={!isEditing} placeholder="University name" /></div>
              <div><label className="block text-sm font-medium text-black mb-1">Graduation Year</label><Input id='graduationYear' name="graduationYear" value={formData.graduationYear ?? ''} onChange={handleChange} disabled={!isEditing} type="number" placeholder="YYYY" /></div>
              <div><label className="block text-sm font-medium text-black mb-1">Total Experience (Years)</label><Input id='totalExperience' name="totalExperience" value={formData.totalExperience ?? ''} onChange={handleChange} disabled={!isEditing} type="number" placeholder="e.g., 5" /></div>
              <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Current/Last Company</label><Input id='currentCompany' name="currentCompany" value={formData.currentCompany} onChange={handleChange} disabled={!isEditing} placeholder="Company name" /></div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
              {!isEditing && (
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
              )}
              {isEditing && (
                <AutocompleteWoControl
                  id="skills-autocomplete"
                  label="Select skills"
                  multiple
                  options={skillMasterOptions as unknown as any[]}
                  value={formData.skills}
                  getOptionLabel={(option: any) => option.label}
                  isOptionEqualToValue={(option: any, value: any) => option.value === value.value}
                  onChange={(_, newValue) => {
                    handleSkillChange(newValue);
                  }}
                  fullWidth
                />
              )}
            </div>
          </FormSection>
        )}

        {isRecruiter && (
          <FormSection title="Company Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label><Input id='name' name="name" value={formData.company?.name || ''} onChange={handleChange} disabled={!isEditing} placeholder="Your company's name" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Website</label><Input id='website' name="website" value={formData.company?.website || ''} onChange={handleChange} disabled={!isEditing} placeholder="https://company.com" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Location</label><Input id='location' name="location" value={formData.company?.location || ''} onChange={handleChange} disabled={!isEditing} placeholder="City, Country" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Industry</label><Input id='industry' name="industry" value={formData.company?.industry || ''} onChange={handleChange} disabled={!isEditing} placeholder="e.g., Technology" /></div>
              <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><Input id='description' multiline name="description" value={formData.company?.description || ''} onChange={handleChange} rows={3} disabled={!isEditing} placeholder="Brief company overview" /></div>
            </div>
            {!formData.company && !isEditing && (
              <p className="text-sm text-gray-500">No company details associated. Click 'Edit Profile' to add.</p>
            )}
          </FormSection>
        )}

        {isEditing && (
          <div className="text-right">
            <Button
              id='submit'
              type="submit"
              variant="contained"
              size="medium"
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
