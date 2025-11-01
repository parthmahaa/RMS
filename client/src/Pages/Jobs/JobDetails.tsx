import { useState, useEffect } from 'react';
import { Box, Typography, Chip, CircularProgress, Divider } from '@mui/material';
import { ArrowBack, Edit } from '@mui/icons-material';
import { toast } from 'sonner';
import Button from '../../Components/ui/Button';
import type { Job, Skill } from '../../Types/jobTypes';
import { formatJobStatus, formatJobType, formatDate, formatApplicationStatus } from '../../utils/jobFormatters';
import api from '../../utils/api';

interface JobDetailsProps {
  jobId: number;
  onBack: () => void;
  onEdit: (jobId: number) => void;
}

const JobDetails = ({ jobId, onBack, onEdit }: JobDetailsProps) => {
  const [job, setJob] = useState<Job | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobDetails();
    fetchSkills();
  }, [jobId]);

  const fetchJobDetails = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/jobs/${jobId}`);
      setJob(response.data.data || null);
    } catch (error: any) {
      console.error('Error fetching job:', error);
      toast.error(error.response?.data?.message || 'Failed to load job details');
      setJob(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchSkills = async () => {
    try {
      const response = await api.get('/skills');
      const skillsData = response.data.data || [];
      setSkills(Array.isArray(skillsData) ? skillsData : []);
    } catch (error: any) {
      console.error('Error fetching skills:', error);
      setSkills([]);
    }
  };

  if (loading) {
    return (
      <Box className="flex justify-center items-center py-20">
        <CircularProgress />
      </Box>
    );
  }

  if (!job) {
    return (
      <Box className="text-center py-20">
        <Typography variant="h6" color="text.secondary">
          Job not found
        </Typography>
        <Button id="back-to-jobs" onClick={onBack} className="mt-4">
          Back to Jobs
        </Button>
      </Box>
    );
  }

  const jobSkills = skills.filter(skill => job.skillRequirementIds.includes(skill.id));

  return (
    <div className="max-w-5xl mx-auto">
      <Button
        id="back-button"
        variant="outlined"
        onClick={onBack}
        startIcon={<ArrowBack />}
        className="mb-8"
        size="medium"
        >
        Back to Jobs
      </Button>

      <div className="bg-white rounded-lg mt-5 shadow-lg border border-gray-100 p-8">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <Typography variant="h4" className="font-bold mb-3 text-gray-900">
              {job.position}
            </Typography>
            <Typography variant="h6" color="text.secondary" className="mb-2 font-medium">
              {job.companyName}
            </Typography>
          </div>
          <div className="flex items-center gap-3">
            <Chip 
              label={formatJobStatus(job.status)} 
              color={'default'}
              size="medium"
              className="shrink-0"
            />
              <Button
                id="edit-job-button-header"
                variant="contained"
                onClick={() => onEdit(job.id)}
                size="small"
                startIcon={<Edit />}
              >
                Edit
              </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-5">
          <Chip label={formatJobType(job.type)} variant="outlined" />
          <Chip label={`📍 ${job.location}`} variant="outlined" />
          <Chip 
            label={`${job.applications.length} Application${job.applications.length !== 1 ? 's' : ''}`} 
            variant="outlined" 
            />
        </div>

        <Typography variant="body2" color="text.secondary" className="mb-6 text-sm">
          Posted on {formatDate(job.postedAt)}
        </Typography>

        <Divider className="my-8" />

        <div className="mb-8">
          <Typography variant="h6" className="font-semibold mb-4 text-gray-900">
            Job Description
          </Typography>
          <Typography variant="body1" className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {job.description}
          </Typography>
        </div>

        <Divider className="my-8" />

        <div className="mb-8">
          <Typography variant="h6" className="font-semibold mb-4 text-gray-900">
            Required Skills
          </Typography>
          <div className="flex flex-wrap gap-2.5">
            {jobSkills.length > 0 ? (
              jobSkills.map(skill => (
                <Chip key={skill.id} label={skill.name} color="primary" variant="outlined" />
              ))
            ) : (
              <Typography color="text.secondary">No skills specified</Typography>
            )}
          </div>
        </div>

        {job.applications.length > 0 && (
          <>
            <Divider className="my-8" />
            <div>
              <Typography variant="h6" className="font-semibold mb-4 text-gray-900">
                Applications ({job.applications.length})
              </Typography>
              <div className="space-y-4">
                {job.applications.map(application => (
                  <div key={application.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <Typography variant="body1" className="font-medium">
                        Candidate ID: {application.candidateId}
                      </Typography>
                      <Chip 
                        label={formatApplicationStatus(application.status)} 
                        size="small"
                        color={
                          application.status === 'ACCEPTED' ? 'success' :
                          application.status === 'REJECTED' ? 'error' :
                          'default'
                        }
                        />
                    </div>
                    <Typography variant="body2" color="text.secondary" className="mb-2">
                      Applied on {formatDate(application.appliedAt)}
                    </Typography>
                    {application.recruiterComment && (
                      <Typography variant="body2" className="text-gray-700">
                        <strong>Comment:</strong> {application.recruiterComment}
                      </Typography>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {job.status === 'CLOSED' && (job.closeReason || job.closeComment) && (
          <>
            <Divider className="my-8" />
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
              <Typography variant="h6" className="font-semibold mb-3 text-gray-900">
                Closure Information
              </Typography>
              {job.closeReason && (
                <Typography variant="body2" className="mb-2">
                  <strong>Reason:</strong> {job.closeReason.replace(/_/g, ' ')}
                </Typography>
              )}
              {job.closeComment && (
                <Typography variant="body2">
                  <strong>Comment:</strong> {job.closeComment}
                </Typography>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default JobDetails;