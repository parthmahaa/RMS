//
import { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Divider } from '@mui/material';
import { ArrowBack, CheckCircle, LocationOn, Work, CalendarToday } from '@mui/icons-material';
import { toast } from 'sonner';
import { useParams, useNavigate, useLocation } from 'react-router-dom'; // Added Router hooks
import Button from '../../Components/ui/Button';
import JobApplicationForm from './JobApplicationForm';
import api from '../../utils/api';
import type { Job } from '../../Types/jobTypes';
import { formatJobType, formatDate } from '../../utils/jobFormatters';
import useAuthStore from '../../Store/authStore'; // Needed for ID check

const CandidateJobDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const userId = useAuthStore((state: any) => state.userId);

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applicationFormOpen, setApplicationFormOpen] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    if (id) {
      fetchJobAndCheckStatus();
    }
  }, [id, userId]);

  const fetchJobAndCheckStatus = async () => {
    try {
      setLoading(true);
      const jobResponse = await api.get(`/jobs/${id}`);
      const jobData: Job = jobResponse.data.data;
      setJob(jobData);
      const profileResponse = await api.get('/user/profile');
      if (profileResponse.data.data && profileResponse.data.data.role.includes('CANDIDATE')) {
        const candidateId = profileResponse.data.data.id;
        const isApplied = jobData.applications?.some(app => app.candidateId === candidateId);
        setHasApplied(isApplied || false);
      }

    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (location.state?.from) {
      navigate(location.state.from);
      return;
    }
    if (location.pathname.includes('/applications')) {
      navigate('/applications');
    } else {
      navigate('/jobs');
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
        <Button id="back-to-jobs" variant="outlined" onClick={handleBack} className="mt-4">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Button
        id="back-button"
        variant="outlined"
        onClick={handleBack}
        startIcon={<ArrowBack />}
        className="mb-6"
      >
        {location.pathname.includes('/applications') ? 'Back to Applications' : 'Back to Jobs'}
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

        {/* Required Skills */}
        {job.requiredSkills?.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Minimum Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {job.requiredSkills.map((skill) => (
                <span
                  key={skill.skillId}
                  className="px-3 py-1 border border-red-300 text-red-700 bg-red-50 rounded-lg text-sm font-medium"
                >
                  {skill.skillName}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Preferred Skills */}
        {job.preferredSkills?.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Preferred Skills</h3>
            <div className="flex flex-wrap gap-2">
              {job.preferredSkills.map((skill) => (
                <span
                  key={skill.skillId}
                  className="px-3 py-1 border border-blue-300 text-blue-700 bg-blue-50 rounded-lg text-sm font-medium"
                >
                  {skill.skillName}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Application Status */}
        {hasApplied && (
          <>
            <Divider className="my-6" />
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-semibold">
                You have already applied for this position
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

      <JobApplicationForm
        open={applicationFormOpen}
        job={job}
        onClose={() => setApplicationFormOpen(false)}
      />
    </div>
  );
};

export default CandidateJobDetails;