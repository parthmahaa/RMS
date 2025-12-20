import { useState, useEffect } from 'react';
import { Box, Chip, CircularProgress, Typography, Divider } from '@mui/material';
import { 
  ArrowBack, 
  Edit, 
  Close, 
  Delete, 
  LocationOn, 
  CalendarToday, 
  Business, 
  Description, 
  CheckCircle, 
  Star,
} from '@mui/icons-material';
import { toast } from 'sonner';
import Button from '../../Components/ui/Button';
import ConfirmDialog from '../../Components/ui/ConfirmDialog';
import type { Job } from '../../Types/jobTypes';
import { formatJobStatus, formatJobType, formatDate } from '../../utils/jobFormatters';
import api from '../../utils/api';

interface JobDetailsProps {
  jobId: number;
  onBack: () => void;
  onEdit: (jobId: number) => void;
}

const JobDetails = ({ jobId, onBack, onEdit }: JobDetailsProps) => {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);
  const [confirmData, setConfirmData] = useState<{
    open: boolean;
    action: 'delete' | 'close' | null;
  }>({ open: false, action: null });

  useEffect(() => {
    fetchJobDetails();
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/jobs/${jobId}`);
      setJob(response.data.data || null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoMatch = async () => {
    if (!job) return;
    setMatching(true);
    try {
      const response = await api.post(`/recruiter/jobs/${job.id}/auto-match`);
      toast.success(response.data.message || 'Auto-match completed successfully');
      fetchJobDetails(); 
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Auto-match failed');
    } finally {
      setMatching(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmData.action || !job) return;

    try {
      if (confirmData.action === 'delete') {
        await api.delete(`/jobs/${job.id}`);
        toast.success('Job deleted successfully');
        onBack();
      } else if (confirmData.action === 'close') {
        await api.put(`/jobs/${job.id}/status`, { status: 'CLOSED', closeReason: 'Closed by recruiter' });
        toast.success('Job closed successfully');
        fetchJobDetails(); 
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${confirmData.action} job`);
    } finally {
      setConfirmData({ open: false, action: null });
    }
  };

  if (loading) {
    return (
      <Box className="flex justify-center items-center h-64">
        <CircularProgress />
      </Box>
    );
  }

  if (!job) {
    return (
      <Box className="p-6 text-center">
        <Typography color="error">Job not found</Typography>
        <Button onClick={onBack} className="mt-4">Back to Jobs</Button>
      </Box>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex gap-4 items-start">
          <Button 
            id="back-btn" 
            variant="text" 
            startIcon={<ArrowBack />} 
            onClick={onBack}
            className="mt-1"
          >
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{job.position}</h1>
            <div className="flex items-center gap-2 mt-1 text-gray-500">
              <Business fontSize="small" />
              <span>{job.companyName}</span>
              <span className="mx-2">•</span>
              <Chip 
                label={formatJobStatus(job.status)} 
                color={job.status === 'OPEN' ? 'success' : 'error'} 
                size="small" 
                variant={job.status === 'OPEN' ? 'filled' : 'outlined'}
              />
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
            {job.status === 'OPEN' && (
              <Button
                id="auto-match-btn"
                variant="contained"
                onClick={handleAutoMatch}
                disabled={matching}
                sx={{ 
                  backgroundColor: 'black', 
                  '&:hover': { backgroundColor: '#333' } 
                }}
              >
                {matching ? 'Matching...' : 'Auto-Match Candidates'}
              </Button>
            )}

            <Button
                id="edit-job"
                variant="outlined"
                startIcon={<Edit />}
                onClick={() => onEdit(job.id)}
            >
                Edit
            </Button>
        </div>
      </div>

      <Divider className="mb-6" />

      {/* Job Meta Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <LocationOn className="text-gray-500" />
            <div>
                <p className="text-xs text-gray-500 font-medium uppercase">Location</p>
                <p className="text-sm font-semibold text-gray-900">{job.location}</p>
            </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Description className="text-gray-500" />
            <div>
                <p className="text-xs text-gray-500 font-medium uppercase">Type</p>
                <p className="text-sm font-semibold text-gray-900">{formatJobType(job.type)}</p>
            </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <CalendarToday className="text-gray-500" />
            <div>
                <p className="text-xs text-gray-500 font-medium uppercase">Posted Date</p>
                <p className="text-sm font-semibold text-gray-900">{formatDate(job.postedAt)}</p>
            </div>
        </div>
      </div>

      {/* Description */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-gray-900 mb-3">Description</h3>
        <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{job.description}</p>
      </div>

      {/* Skills Section */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Skills & Requirements</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
            {/* Mandatory Skills */}
            <div className="border border-red-100 bg-red-50/30 rounded-xl p-5">
                <h4 className="text-sm font-bold text-red-900 mb-3 flex items-center gap-2">
                    <CheckCircle className="text-red-600" fontSize="small" />
                    Required Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                    {job.requiredSkills && job.requiredSkills.length > 0 ? (
                        job.requiredSkills.map((skill) => (
                            <span 
                                key={skill.skillId} 
                                className="px-3 py-1 bg-white text-red-700 text-sm rounded-lg border border-red-200 font-medium shadow-sm"
                            >
                                {skill.skillName}
                            </span>
                        ))
                    ) : (
                        <span className="text-gray-400 text-sm italic pl-1">No mandatory skills specified</span>
                    )}
                </div>
            </div>

            {/* Preferred Skills */}
            <div className="border border-blue-100 bg-blue-50/30 rounded-xl p-5">
                <h4 className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
                    <Star className="text-blue-600" fontSize="small" />
                    Preferred Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                    {job.preferredSkills && job.preferredSkills.length > 0 ? (
                        job.preferredSkills.map((skill) => (
                            <span 
                                key={skill.skillId} 
                                className="px-3 py-1 bg-white text-blue-700 text-sm rounded-lg border border-blue-200 font-medium shadow-sm"
                            >
                                {skill.skillName}
                            </span>
                        ))
                    ) : (
                        <span className="text-gray-400 text-sm italic pl-1">No preferred skills specified</span>
                    )}
                </div>
            </div>
        </div>
      </div>

      <Divider className="mb-6" />

      {/* Footer Actions */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
            <strong>{job.applications?.length || 0}</strong> active application(s)
        </div>
        <div className="flex gap-3 mt-2">
          {job.status !== 'CLOSED' && (
            <Button
              id="close-job-btn"
              variant="outlined"
              color="warning"
              startIcon={<Close />}
              onClick={() => setConfirmData({ open: true, action: 'close' })}
            >
              Close Job
            </Button>
          )}
          <Button
            id="delete-job-btn"
            variant="contained"
            color="error"
            startIcon={<Delete />}
            onClick={() => setConfirmData({ open: true, action: 'delete' })}
          >
            Delete Job
          </Button>
        </div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmData.open}
        title={
          confirmData.action === 'delete'
            ? 'Delete Job Posting'
            : 'Close Job Posting'
        }
        message={
          confirmData.action === 'delete'
            ? 'Are you sure you want to permanently delete this job? This action cannot be undone.'
            : 'Are you sure you want to close this job posting? Applicants will no longer be able to apply.'
        }
        confirmText={confirmData.action === 'delete' ? 'Delete' : 'Close'}
        confirmColor={confirmData.action === 'delete' ? 'error' : 'warning'}
        onCancel={() => setConfirmData({ open: false, action: null })}
        onConfirm={handleConfirmAction}
      />
    </div>
  );
};

export default JobDetails;