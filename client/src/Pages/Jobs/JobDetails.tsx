import { useState, useEffect } from 'react';
import { CircularProgress } from '@mui/material';
import { ArrowBack, Edit, Close, Delete } from '@mui/icons-material';
import { toast } from 'sonner';
import Button from '../../Components/ui/Button';
import ConfirmDialog from '../../Components/ui/ConfirmDialog';
import type { Job, Skill } from '../../Types/jobTypes';
import { formatJobStatus, formatJobType, formatDate } from '../../utils/jobFormatters';
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
  const [confirmData, setConfirmData] = useState<{
    open: boolean;
    action: 'delete' | 'close' | null;
  }>({ open: false, action: null });

  useEffect(() => {
    fetchJobDetails();
    fetchSkills();
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

  const fetchSkills = async () => {
    try {
      const response = await api.get('/skills');
      setSkills(response.data.data || []);
    } catch (error) {
      console.error('Error fetching skills:', error);
    }
  };

  const handleConfirmAction = async () => {
    if (!job) return;
    try {
      if (confirmData.action === 'close') {
        await api.put(`/jobs/${job.id}/close`);
        toast.success('Job closed successfully');
      } else if (confirmData.action === 'delete') {
        await api.delete(`/jobs/${job.id}`);
        toast.success('Job deleted successfully');
      }
      setConfirmData({ open: false, action: null });
      onBack();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Action failed');
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
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Job not found</h2>
        <Button id='back' onClick={onBack}>Back to Jobs</Button>
      </div>
    );
  }

  const jobSkills = skills.filter((skill) => job.skillRequirements.includes(skill.id));

  return (
    <div className="max-w-5xl mx-auto p-6">
      <Button
        id='back'
        variant="outlined"
        startIcon={<ArrowBack />}
        onClick={onBack}
        className="mb-6"
      >
        Back to Jobs
      </Button>

      <div className="bg-white border border-gray-200 rounded-2xl mt-2 p-5 transition-all">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-1">
              {job.position}
            </h1>
            <p className="text-lg text-gray-600">{job.companyName}</p>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 text-sm font-medium rounded-md border ${
                job.status === 'CLOSED'
                  ? 'bg-red-50 border-red-200 text-red-700'
                  : 'bg-green-50 border-green-200 text-green-700'
              }`}
            >
              {formatJobStatus(job.status)}
            </span>
            <Button
              id='edit'
              variant="contained"
              size="small"
              startIcon={<Edit />}
              onClick={() => onEdit(job.id)}
              className="!bg-gray-900 hover:!bg-gray-800 text-white shadow-sm"
            >
              Edit
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 text-sm mb-6">
          <span className="px-3 py-1 border border-gray-300 rounded-md bg-gray-50">
            {formatJobType(job.type)}
          </span>
          <span className="px-3 py-1 border border-gray-300 rounded-md bg-gray-50 flex items-center gap-1">
            📍 {job.location}
          </span>
          <span className="px-3 py-1 border border-gray-300 rounded-md bg-gray-50">
            {job.applications.length} Applications
          </span>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-500">
            Posted on <strong>{formatDate(job.postedAt)}</strong>
          </p>
          {job.closeReason && (
            <p className="text-sm text-red-600 mt-1 italic">
              Closed Reason: {job.closeReason.replace(/_/g, ' ')}
            </p>
          )}
        </div>

        <hr className="my-8 border-gray-200" />

        {/* Description */}
        <section className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Job Description</h3>
          <p className="text-gray-700 whitespace-pre-line leading-relaxed">
            {job.description}
          </p>
        </section>

        {/* Skills */}
        <section className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Required Skills</h3>
          <div className="flex flex-wrap gap-2">
            {jobSkills.length > 0 ? (
              jobSkills.map((s) => (
                <span
                  key={s.id}
                  className="px-3 py-1 border border-blue-300 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100"
                >
                  {s.name}
                </span>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No skills listed</p>
            )}
          </div>
        </section>

        <hr className="my-3 border-gray-200" />

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          {job.status !=='CLOSED' &&(
            <Button
            id='close'
            variant="outlined"
            color="warning"
            startIcon={<Close />}
            onClick={() => setConfirmData({ open: true, action: 'close' })}
          >
            Close Job
          </Button>
          )}
          <Button
            id='delete'
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
