import { useState, useEffect } from 'react';
import {
  Box,
  Chip,
  CircularProgress,
  Typography,
  Divider,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
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
  AutoFixHigh,
  Person,
  OpenInNew,
  ThumbUp,
  ThumbDown,
  Download
} from '@mui/icons-material';
import { toast } from 'sonner';
import Button from '../../Components/ui/Button';
import ConfirmDialog from '../../Components/ui/ConfirmDialog';
import type { Job, JobApplication } from '../../Types/jobTypes';
import { formatJobStatus, formatJobType, formatDate } from '../../utils/jobFormatters';
import api from '../../utils/api';
import Input from '../../Components/ui/Input';

interface JobDetailsProps {
  jobId: number;
  onBack: () => void;
  onEdit: (jobId: number) => void;
}

const JobDetails = ({ jobId, onBack, onEdit }: JobDetailsProps) => {
  const [job, setJob] = useState<Job | null>(null);
  const [applicants, setApplicants] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);
  const [confirmData, setConfirmData] = useState<{
    open: boolean;
    action: 'delete' | 'close' | null;
  }>({ open: false, action: null });

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [closeModalOpen, setCloseModalOpen] = useState(false);
  const [closeReason, setCloseReason] = useState('');
  const [closing, setClosing] = useState(false);

  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchJobDetails();
    fetchApplicants();
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      const response = await api.get(`/jobs/${jobId}`);
      setJob(response.data.data || null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const fetchApplicants = async () => {
    try {
      const response = await api.get(`/application/job/${jobId}`);
      setApplicants(response.data.data || []);
    } catch (error: any) {
      console.error("Failed to load applicants", error);
    }
  };

  const handleAutoMatch = async () => {
    if (!job) return;
    setMatching(true);
    try {
      const response = await api.post(`/recruiter/jobs/${job.id}/auto-match`);
      toast.success(response.data.message || 'Auto-match completed successfully');
      fetchJobDetails();
      fetchApplicants();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Auto-match failed');
    } finally {
      setMatching(false);
    }
  };

  const handleStatusUpdate = async (status: 'ACCEPTED' | 'REJECTED') => {
    if (!selectedApp) return;
    setUpdatingStatus(true);
    try {
      await api.put(`/application/${selectedApp.id}/status`, {
        status: status,
        remarks: status === 'ACCEPTED' ? 'Candidate shortlisted for interview' : 'Not a good fit at this time'
      });

      toast.success(`Application ${status.toLowerCase()} successfully`);

      setApplicants(prev => prev.map(app =>
        app.id === selectedApp.id ? { ...app, status: status } : app
      ));
      setSelectedApp(null);
    } catch (error: any) {
      toast.error('Failed to update status');
    } finally {
      setUpdatingStatus(false);
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
        await api.put(`/jobs/close/${job.id}`, { status: 'CLOSED', closeReason: closeReason });
        toast.success('Job closed successfully');
        setCloseModalOpen(false);
        fetchJobDetails();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${confirmData.action} job`);
    } finally {
      setConfirmData({ open: false, action: null });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return 'bg-green-100 text-green-700 border-green-200';
      case 'REJECTED': return 'bg-red-100 text-red-700 border-red-200';
      case 'LINKED': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  if (loading) return <Box className="flex justify-center items-center h-64"><CircularProgress /></Box>;
  if (!job) return <Box className="p-6 text-center">Job not found</Box>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-in fade-in duration-300">

      <div className="flex justify-between items-start mb-6">
        <div className="flex gap-4 items-start">
          <Button variant="text" startIcon={<ArrowBack />} onClick={onBack} className="mt-1">Back</Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{job.position}</h1>
            <div className="flex items-center gap-2 mt-1 text-gray-500">
              <Business fontSize="small" /> <span>{job.companyName}</span>
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
              variant="contained"
              startIcon={<AutoFixHigh />}
              onClick={handleAutoMatch}
              disabled={matching}
              sx={{ backgroundColor: 'black', '&:hover': { backgroundColor: '#333' } }}
            >
              {matching ? 'Matching...' : 'Auto-Match'}
            </Button>
          )}
          <Button variant="outlined" startIcon={<Edit />} onClick={() => onEdit(job.id)}>Edit</Button>
        </div>
      </div>

      <Divider className="mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 uppercase">Location</p>
              <p className="font-semibold text-gray-900">{job.location}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 uppercase">Type</p>
              <p className="font-semibold text-gray-900">{formatJobType(job.type)}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 uppercase">Posted</p>
              <p className="font-semibold text-gray-900">{formatDate(job.postedAt)}</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-600 whitespace-pre-wrap">{job.description}</p>
          </div>

          {/* Skills */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {job.requiredSkills?.map(skill => (
                <span key={skill.skillId} className="px-3 py-1 bg-red-50 text-red-700 text-sm rounded-full border border-red-100">
                  {skill.skillName} *
                </span>
              ))}
              {job.preferredSkills?.map(skill => (
                <span key={skill.skillId} className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full border border-blue-100">
                  {skill.skillName}
                </span>
              ))}
            </div>
          </div>

          {job.status === 'CLOSED' && job.closeReason && (
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <h4 className="text-orange-900 font-bold mb-1">Job Closed</h4>
              <p className="text-orange-800 text-sm">Reason: {job.closeReason}</p>
            </div>
          )}

        </div>

        {/* Right Column: Applicants List (1/3 width, Scrollable) */}
        <div className="lg:col-span-1">
          <div className="bg-white border-l-1 border-gray-200 overflow-hidden flex flex-col h-[600px] sticky top-4">
            <div className="p-4 border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-gray-800">Applicants</h3>
              <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded text-xs font-bold">
                {applicants.length}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {applicants.length > 0 ? (
                applicants.map((app) => (
                  <div
                    key={app.id}
                    onClick={() => setSelectedApp(app)}
                    className="p-3 border border-gray-100 rounded-lg hover:border-black hover:bg-gray-50 cursor-pointer transition-all group"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex gap-3 items-center">
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'black', fontSize: 14 }}>
                          {app.candidateName?.[0] || 'C'}
                        </Avatar>
                        <div>
                          <p className="font-semibold text-sm text-gray-900 leading-tight">
                            {app.candidateName || 'Candidate'}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {formatDate(app.appliedAt)}
                          </p>
                        </div>
                      </div>
                      <div className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusColor(app.status)}`}>
                        {app.status}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <Person fontSize="large" className="mb-2 opacity-20" />
                  <p className="text-sm">No applicants yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Divider className="my-6" />
      <div className="flex justify-end gap-3  mt-2">
        {job.status !== 'CLOSED' && (
          <Button variant="outlined" color="warning" onClick={() => setCloseModalOpen(true)}>
            Close Job
          </Button>
        )}
        <Button variant="contained" color="error" onClick={() => setConfirmData({ open: true, action: 'delete' })}>
          Delete Job
        </Button>
      </div>

      {/* --- Application Details Modal --- */}
      <Dialog
        open={!!selectedApp}
        onClose={() => setSelectedApp(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px' } }}
      >
        {selectedApp && (
          <>
            <DialogTitle className="border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div className="flex items-center gap-3">
                <Avatar sx={{ width: 40, height: 40, bgcolor: 'black' }}>
                  {selectedApp.candidateName?.[0]}
                </Avatar>
                <div>
                  <Typography variant="h6" className="font-bold leading-tight">
                    {selectedApp.candidateName}
                  </Typography>
                  <Typography variant="caption" className="text-gray-500">
                    Applied on {formatDate(selectedApp.appliedAt)}
                  </Typography>
                </div>
              </div>
              <IconButton onClick={() => setSelectedApp(null)} size="small">
                <Close />
              </IconButton>
            </DialogTitle>

            <DialogContent className="p-6">
              <div className="mt-4 space-y-6">
                {/* Status Banner */}
                <div className={`p-4 rounded-lg border flex items-center gap-3 ${getStatusColor(selectedApp.status)}`}>
                  <Typography className="font-semibold text-sm">
                    Current Status: {selectedApp.status}
                  </Typography>
                </div>

                {/* Resume Section */}
                {selectedApp.resumeFilePath ? (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Description className="text-blue-600" />
                      <div>
                        <p className="text-sm font-bold text-blue-900">Candidate Resume</p>
                        <p className="text-xs text-blue-700">Click to view the full document</p>
                      </div>
                    </div>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => window.open(selectedApp.resumeFilePath, '_blank')}
                      startIcon={<OpenInNew />}
                    >
                      Open
                    </Button>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-xl text-center text-gray-500 text-sm italic">
                    No resume uploaded
                  </div>
                )}

                {/* Cover Letter */}
                <div>
                  <Typography variant="subtitle2" className="font-bold text-gray-900 mb-2">
                    Cover Letter / Remarks
                  </Typography>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-sm text-gray-700 leading-relaxed min-h-[100px]">
                    {selectedApp.coverLetter || selectedApp.recruiterComment || "No additional information provided."}
                  </div>
                </div>
              </div>
            </DialogContent>

            <DialogActions className="p-4 border-t border-gray-100 bg-gray-50">
              <div className="flex gap-3 w-full justify-end">
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<ThumbDown />}
                  onClick={() => handleStatusUpdate('REJECTED')}
                  disabled={updatingStatus || selectedApp.status === 'REJECTED'}
                >
                  Reject
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<ThumbUp />}
                  onClick={() => handleStatusUpdate('ACCEPTED')}
                  disabled={updatingStatus || selectedApp.status === 'ACCEPTED'}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Shortlist
                </Button>
              </div>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Dialog
        open={closeModalOpen}
        onClose={() => setCloseModalOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Close Job</DialogTitle>
        <DialogContent>
          <Typography variant="body2" className="mb-3 text-gray-700 mt-2">
            Please provide a reason for closing this job. This will be visible in the job history.
          </Typography>
          <Input
            fullWidth
            multiline
            minRows={3}
            placeholder='Enter close reason'
            value={closeReason}
            onChange={(e) => setCloseReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions className="p-4">
          <Button
            id='cancel-close'
            variant="outlined"
            onClick={() => setCloseModalOpen(false)}
            disabled={closing}
          >
            Cancel
          </Button>
          <Button
            id='confirm-close'
            variant="contained"
            color="error"
            onClick={handleConfirmAction}
            disabled={closing}
          >
            {closing ? 'Closing...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default JobDetails;