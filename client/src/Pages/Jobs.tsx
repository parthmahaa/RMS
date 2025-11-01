import { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { toast } from 'sonner';
import Button from '../Components/ui/Button';
import JobCard from './Jobs/JobCard';
import JobForm from './Jobs/JobForm';
import JobDetails from './Jobs/JobDetails';
import api from '../utils/api';
import type { Job, JobFormData } from '../Types/jobTypes';

const JobsPage = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [editingJobId, setEditingJobId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);

  // Close job modal state
  const [closeModal, setCloseModal] = useState(false);
  const [closeReason, setCloseReason] = useState('');
  const [closingJobId, setClosingJobId] = useState<number | null>(null);

  // Fetch all jobs
  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await api.get('/jobs');
      setJobs(response.data.data || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // job creation or update
  const handleJobSave = async (data: JobFormData) => {
    try {
      if (editingJobId) {
        const response = await api.put(`/jobs/${editingJobId}`, data);
        toast.success(response.data.message || 'Job updated successfully');
      } else {
        const response = await api.post("/jobs", data);
        toast.success(response.data.message || 'Job created successfully');
      }
      setEditingJobId(null);
      setCreating(false);
      fetchJobs();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save job');
    }
  };

  // Handle job deletion
  const handleDeleteJob = async (jobId: number) => {
    if (!confirm('Are you sure you want to delete this job?')) return;
    try {
      const response = await api.delete(`/jobs/${jobId}`);
      setJobs((prev) => prev.filter((job) => job.id !== jobId));
      toast.success(response.data.message || 'Job deleted successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete job');
    }
  };

  // Handle job close
  const handleCloseJob = (jobId: number) => {
    setClosingJobId(jobId);
    setCloseReason('');
    setCloseModal(true);
  };

  const confirmCloseJob = async () => {
    if (!closingJobId || !closeReason.trim()) {
      toast.error('Please provide a close reason');
      return;
    }
    try {
      const response = await api.put(`/jobs/close/${closingJobId}`, {
        status: 'CLOSED',
        closeReason,
      });
      toast.success(response.data.message || 'Job closed successfully');
      setJobs((prev) =>
        prev.map((job) =>
          job.id === closingJobId ? { ...job, status: 'CLOSED', closeReason } : job
        )
      );
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to close job');
    } finally {
      setCloseModal(false);
      setClosingJobId(null);
      setCloseReason('');
    }
  };

  // Handle edit
  const handleEditJob = (jobId: number) => setEditingJobId(jobId);

  // Handle view
  const handleViewJob = (jobId: number) => setSelectedJobId(jobId);

  // Conditional rendering
  if (loading) {
    return (
      <Box className="flex justify-center items-center py-20">
        <CircularProgress />
      </Box>
    );
  }

  if (selectedJobId) {
    return (
      <JobDetails
        jobId={selectedJobId}
        onBack={() => setSelectedJobId(null)}
        onEdit={(id) => {
          setEditingJobId(id);
          setSelectedJobId(null);
        }}
      />
    );
  }

  if (editingJobId || creating) {
    const editingJob = jobs.find((job) => job.id === editingJobId);
    return (
      <JobForm
        jobId={editingJobId || undefined}
        initialData={editingJob}
        onCancel={() => {
          setEditingJobId(null);
          setCreating(false);
        }}
        onSuccess={handleJobSave}
      />
    );
  }

  return (
    <Box className="max-w-7xl mx-auto p-6">
      <Box className="flex justify-between items-center mb-8">
        <Typography variant="h4" className="font-bold text-gray-900">
          Job Listings
        </Typography>
        <Button
          id="create-job"
          variant="contained"
          onClick={() => setCreating(true)}
          size="medium"
        >
          + Create Job
        </Button>
      </Box>

      {jobs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onClose={handleCloseJob}
              onDelete={handleDeleteJob}
              onView={handleViewJob}
              onEdit={handleEditJob}
            />
          ))}
        </div>
      ) : (
        <Typography variant="body1" className="text-center text-gray-600">
          No jobs available.
        </Typography>
      )}

      {/* Close reason modal */}
      <Dialog open={closeModal} onClose={() => setCloseModal(false)} fullWidth maxWidth="sm">
        <DialogTitle>Close Job</DialogTitle>
        <DialogContent>
          <Typography variant="body2" className="mb-3 text-gray-700">
            Please provide a reason for closing this job.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={3}
            placeholder="Enter close reason..."
            value={closeReason}
            onChange={(e) => setCloseReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button id='close' variant="outlined" onClick={() => setCloseModal(false)}>
            Cancel
          </Button>
          <Button id='confirm-close' variant="contained" onClick={confirmCloseJob}>
            Confirm Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default JobsPage;
