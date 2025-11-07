import { useEffect, useState } from 'react';
import { Box, Typography, Chip, CircularProgress, Divider } from '@mui/material';
import { ArrowBack, CheckCircle, LocationOn, Work, CalendarToday } from '@mui/icons-material';
import { toast } from 'sonner';
import Button from '../../Components/ui/Button';
import JobApplicationForm from './JobApplicationForm';
import api from '../../utils/api';
import type { Job, JobApplicationFormData } from '../../Types/jobTypes';
import { formatJobType, formatDate } from '../../utils/jobFormatters';

interface CandidateJobDetailsProps {
  jobId: number;
  onBack: () => void;
  hasApplied: boolean
}

const CandidateJobDetails = ({ jobId, onBack, hasApplied }: CandidateJobDetailsProps) => {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applicationFormOpen, setApplicationFormOpen] = useState(false);
  const [skills, setSkills] = useState<Array<{ id: number; name: string }>>([]);

  useEffect(() => {
    fetchJobDetails();
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      const response = await api.get(`/jobs/${jobId}`);
      setJob(response.data.data);

      // Fetch skills if skillRequirementIds exist
      if (response.data.data.skillRequirementIds?.length > 0) {
        fetchSkills(response.data.data.skillRequirementIds);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch job details');
    } finally {
      setLoading(false);
    }
  };

  const fetchSkills = async (skillIds: number[]) => {
    try {
      const response = await api.get('/skills');
      const allSkills = response.data.data || [];
      const jobSkills = allSkills.filter((skill: any) => skillIds.includes(skill.id));
      setSkills(jobSkills);
    } catch (error) {
      console.error('Failed to fetch skills');
    }
  };

  const handleApply = async (formData: JobApplicationFormData) => {
    try {
      const response = await api.post(`/application`, formData);
      toast.success(response.data.message || 'Application submitted successfully!');
      setApplicationFormOpen(false);
    } catch (error: any) {
      console.error(error.response?.data?.message || 'Failed to submit application');
      toast.error(error.response?.data?.message || 'Failed to submit application');
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <CircularProgress />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-20">
        <Typography variant="h6" color="text.secondary">
          Job not found
        </Typography>
        <Button id="back-to-jobs" variant="outlined" onClick={onBack} className="mt-4">
          Back to Jobs
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Button
        id="back-button"
        variant="outlined"
        onClick={onBack}
        startIcon={<ArrowBack />}
        className="mb-6"
      >
        Back to Jobs
      </Button>

      <div className="bg-white rounded-2xl mt-2 border border-gray-200 p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">{job.position}</h2>
            <p className="text-lg text-gray-600 mb-2">{job.companyName}</p>
          </div>
          {hasApplied && (
            <div className="flex items-center text-green-700 bg-green-50 px-3 py-1 rounded-md border border-green-200 font-medium text-sm">
              <CheckCircle className="text-green-600 mr-1" fontSize="small" /> Applied
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-4 text-gray-600 mb-6">
          <div className="flex items-center gap-1">
            <LocationOn fontSize="small" />
            <span className="text-sm">{job.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Work fontSize="small" />
            <span className="text-sm">{formatJobType(job.type)}</span>
          </div>
          <div className="flex items-center gap-1">
            <CalendarToday fontSize="small" />
            <span className="text-sm">Posted {formatDate(job.postedAt)}</span>
          </div>
        </div>


        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Job Description</h3>
          <p className="text-gray-700 whitespace-pre-line leading-relaxed">{job.description}</p>
        </div>

        {skills.length > 0 && (
          <>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill.id}
                    className="px-3 py-1 border border-blue-300 text-blue-700 bg-blue-50 rounded-lg text-sm font-medium"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Application Status */}
        {hasApplied && (
          <>
            <Divider className="my-6" />
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-semibold">
                ✅ You have already applied for this position
              </p>
              <p className="text-green-700 mt-1 text-sm">
                The recruiter will review your application and contact you if you’re shortlisted.
              </p>
            </div>
          </>
        )}

        {/* Apply Button */}
        {!hasApplied && (
          <div className="flex justify-end mt-6">
            <Button
              id="apply-now-button"
              variant="contained"
              size="medium"
              onClick={() => setApplicationFormOpen(true)}
            >
              Apply for this Position
            </Button>
          </div>
        )}
      </div>

      {/* Application Form Modal */}
      <JobApplicationForm
        open={applicationFormOpen}
        job={job}
        onClose={() => setApplicationFormOpen(false)}
        onSubmit={handleApply}
      />
    </div>
  );
};

export default CandidateJobDetails;