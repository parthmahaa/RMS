import { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography, TextField, InputAdornment } from '@mui/material';
import { Search } from '@mui/icons-material';
import { toast } from 'sonner';
import CandidateJobCard from './Candidate/CandidateJobCard';
import CandidateJobDetails from './Candidate/CandidateJobDetails';
import JobApplicationForm from './Candidate/JobApplicationForm';
import api from '../utils/api';
import type { Job, JobApplicationFormData } from '../Types/jobTypes';
import useAuthStore from '../Store/authStore';

const CandidateDashboard = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [applyingJobId, setApplyingJobId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedJobIds, setAppliedJobIds] = useState<Set<number>>(new Set());
  
  const userId = useAuthStore((state: any) => state.userId);

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [searchQuery, jobs]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await api.get('/jobs/open');
      const allJobs = response.data.data || [];
      
      setJobs(allJobs);
      setFilteredJobs(allJobs);
      
      checkAppliedJobs(allJobs);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };


  // logic to check if already applied
  const checkAppliedJobs = (jobList: Job[]) => {
    const applied = new Set<number>();
    jobList.forEach((job) => {
      const hasApplied = job.applications?.some(
        (app) => app.candidateId === Number(userId)
      );
      if (hasApplied) {
        applied.add(job.id);
      }
    });
    setAppliedJobIds(applied);
  };

  const filterJobs = () => {
    if (!searchQuery.trim()) {
      setFilteredJobs(jobs);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = jobs.filter(
      (job) =>
        job.position.toLowerCase().includes(query) ||
        job.companyName.toLowerCase().includes(query) ||
        job.location.toLowerCase().includes(query) ||
        job.description.toLowerCase().includes(query)
    );
    setFilteredJobs(filtered);
  };

  const handleApply = (jobId: number) => {
    setApplyingJobId(jobId);
  };

  const handleSubmitApplication = async (formData: JobApplicationFormData) => {
    if (!applyingJobId) return;

    try {
      const response = await api.post(`/application`, formData);
      toast.success(response.data.message || 'Application submitted successfully!');
      
      setAppliedJobIds((prev) => new Set(prev).add(applyingJobId));
      setApplyingJobId(null);
      
      fetchJobs();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit application');
      throw error;
    }
  };

  const handleViewJob = (jobId: number) => {
    setSelectedJobId(jobId);
  };

  if (loading) {
    return (
      <Box className="flex justify-center items-center py-20">
        <CircularProgress />
      </Box>
    );
  }

  if (selectedJobId) {
    return (
      <CandidateJobDetails
        hasApplied= {appliedJobIds.has(selectedJobId)}
        jobId={selectedJobId}
        onBack={() => setSelectedJobId(null)}
      />
    );
  }

  const applyingJob = jobs.find((job) => job.id === applyingJobId);

  return (
    <div className="max-w-7xl mx-auto ">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Available Jobs</h1>
        <p className="text-gray-600">Browse and apply to open positions</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <TextField
          fullWidth
          placeholder="Search by position, company, location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          size="small"
        />
      </div>

      {/* Job Count */}
      <p className="text-sm text-gray-500 mb-4">
        {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'} found
      </p>

      {/* Tailwind Grid */}
      {filteredJobs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <CandidateJobCard
              key={job.id}
              job={job}
              onApply={() => setApplyingJobId(job.id)}
              onView={setSelectedJobId}
              hasApplied={appliedJobIds.has(job.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <Typography variant="h6" color="text.secondary">
            {searchQuery ? 'No jobs found matching your search' : 'No jobs available currently'}
          </Typography>
        </div>
      )}

      {/* Application Modal */}
      {applyingJob && (
        <JobApplicationForm
          open={!!applyingJobId}
          job={applyingJob}
          onClose={() => setApplyingJobId(null)}
          onSubmit={async (data) => {
            await api.post(`/application`, data);
            toast.success('Application submitted successfully!');
            setApplyingJobId(null);
            fetchJobs();
          }}
        />
      )}
    </div>
  );
};

export default CandidateDashboard;