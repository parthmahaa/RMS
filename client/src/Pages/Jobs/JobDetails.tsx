import { useState, useEffect } from 'react';
import {
  Box,
  Chip,
  CircularProgress,
  Divider,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Edit,
  Close,
  Business,
  Description,
  AutoFixHigh,
  Person,
  OpenInNew,
  Delete,
} from '@mui/icons-material';
import { toast } from 'sonner';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../../Components/ui/Button';
import ConfirmDialog from '../../Components/ui/ConfirmDialog';
import type { ApplicationStatus, Job, JobApplication, JobFormData, Skill, SkillWithYoe } from '../../Types/jobTypes';
import { formatJobStatus, formatJobType, formatDate } from '../../utils/jobFormatters';
import api from '../../utils/api';
import Input from '../../Components/ui/Input';
import JobForm from './JobForm';
import AutocompleteWoControl from '../../Components/ui/AutoCompleteWoControl';
import type { EmployeeDTO } from '../../Types/user';

const JobDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [job, setJob] = useState<Job | null>(null);
  const [applicants, setApplicants] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);
  const [allReviewers, setAllReviewers] = useState<EmployeeDTO[]>([]);
  const [selectedReviewers, setSelectedReviewers] = useState<EmployeeDTO[]>([]);
  const [savingReviewers, setSavingReviewers] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [confirmData, setConfirmData] = useState<{
    open: boolean;
    action: 'delete' | 'close' | null;
  }>({ open: false, action: null });

  const [closeModalOpen, setCloseModalOpen] = useState(false);
  const [closeReason, setCloseReason] = useState('');
  const [closing, setClosing] = useState(false);
  const [recruiterComment, setRecruiterComment] = useState('');
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [appSkills, setAppSkills] = useState<SkillWithYoe[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus>('PENDING');

  const statusOptions: ApplicationStatus[] = [
    'PENDING', 'REVIEWED', 'ACCEPTED', 'REJECTED',
    'TEST_SCHEDULED', 'INTERVIEW_SCHEDULED', 'HIRED'
  ];

  const [roundsCount, setRoundsCount] = useState<number>();

  useEffect(() => {
    if (id) {
      fetchJobDetails();
      fetchApplicants();
      fetchSkills();
      fetchReviewers();
    }
  }, [id]);

  useEffect(() => {
    if (selectedApp) {
      setRecruiterComment(selectedApp.recruiterComment || '');
      setSelectedStatus(selectedApp.status as ApplicationStatus);
      if (selectedApp.skills && selectedApp.skills.length > 0) {
        const mapped = selectedApp.skills.map((s: any) => ({
          skill: { id: s.skillId, name: s.skillName },
          yearsOfExperience: s.yearsOfExperience || 0
        }));
        setAppSkills(mapped);
      } else {
        setAppSkills([]);
      }
    } else {
      setRecruiterComment('');
      setAppSkills([]);
      setSelectedStatus('PENDING');
    }
  }, [selectedApp, allSkills]);

  const fetchSkills = async () => {
    try {
      const response = await api.get('/skills');
      const data = response.data.data || [];
      setAllSkills(data.map((s: any) => ({ id: s.id, name: s.name })));
    } catch (error) {
      console.error("Failed to load skills");
    }
  };

  const fetchReviewers = async () => {
    try {
      const response = await api.get('/recruiter/reviewers');
      setAllReviewers(response.data.data || []);
    } catch (error) {
      console.error("Failed to load reviewers");
    }
  };

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/jobs/${id}`);
      const jobData = response.data.data || null;
      setJob(response.data.data || null);

      if (jobData && jobData.reviewers) {
        setSelectedReviewers(jobData.reviewers);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load job details');
      navigate('/jobs');
    } finally {
      setLoading(false);
    }
  };

  const fetchApplicants = async () => {
    try {
      const response = await api.get(`/application/job/${id}`);
      setApplicants(response.data.data || []);
    } catch (error: any) {
      console.error("Failed to load applicants", error);
    }
  };

  const handleEditSuccess = async (data: JobFormData) => {
    try {
      await api.put(`/jobs/${id}`, data);
      toast.success('Job updated successfully');
      setIsEditing(false);
      fetchJobDetails();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update job');
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

  const handleSaveReviewers = async () => {
    if (!job) return;
    setSavingReviewers(true);
    try {
      const reviewerIds = selectedReviewers.map(r => r.id);
      await api.post(`/recruiter/jobs/${job.id}/assign-reviewers`, reviewerIds);
      toast.success('Reviewers assigned successfully');
      fetchJobDetails();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to assign reviewers');
    } finally {
      setSavingReviewers(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedApp) return;
    setUpdatingStatus(true);

    try {
      const remark = recruiterComment.trim().length > 0 ? recruiterComment : 'Status updated';

      const skillsPayload = appSkills.map(s => ({
        skillId: s.skill.id,
        yearsOfExperience: Number(s.yearsOfExperience)
      }));

      const payload = {
        status: selectedStatus,
        remarks: remark,
        skillsWithYoe: skillsPayload,
        numberOfRounds: selectedStatus === "INTERVIEW_SCHEDULED" ? roundsCount : null
      };

      await api.patch(`/application/${selectedApp.id}/status`, payload);
      toast.success(`Application status updated to ${selectedStatus}`);

      setApplicants(prev => prev.map(app =>
        app.id === selectedApp.id ? { ...app, status: selectedStatus, recruiterComment: remark } : app
      ));
      setSelectedApp(null);
      fetchApplicants();
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
        navigate('/jobs');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${confirmData.action} job`);
    } finally {
      setConfirmData({ open: false, action: null });
    }
  };

  const handleCloseSubmit = async () => {
    setClosing(true);
    try {
      await api.put(`/jobs/status/${job!.id}`, { status: 'CLOSED', closeReason: closeReason });
      toast.success('Job closed successfully');
      setCloseModalOpen(false);
      fetchJobDetails();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to close job');
    } finally {
      setClosing(false);
    }
  };

  const handleOpenJob = async () => {
    try {
      await api.put(`/jobs/status/${job?.id}`, { status: 'OPEN' });
      toast.success('Job opened successfully');
      fetchJobDetails();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to open job');
    }
  };

  const handleSkillChange = (_: any, newSkills: Skill[]) => {
    const updatedAppSkills = newSkills.map(skill => {
      const existing = appSkills.find(as => as.skill.id === skill.id);
      return existing || { skill, yearsOfExperience: 0 };
    });
    setAppSkills(updatedAppSkills);
  };

  const handleYoeChange = (skillId: number, yoe: string) => {
    setAppSkills(prev => prev.map(item =>
      item.skill.id === skillId ? { ...item, yearsOfExperience: yoe } : item
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DOCUMENTS_VERIFIED': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'OFFER_SENT' : return 'bg-cyan-100 text-cyan-700 border-cyan-200';
      case 'ACCEPTED': return 'bg-green-100 text-green-700 border-green-200';
      case 'REJECTED': return 'bg-red-100 text-red-700 border-red-200';
      case 'LINKED': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'TEST_SCHEDULED': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'ON_HOLD': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'INTERVIEW_SCHEDULED': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'HIRED': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  if (loading) return <Box className="flex justify-center items-center h-64"><CircularProgress /></Box>;
  if (!job) return <Box className="p-6 text-center">Job not found</Box>;

  if (isEditing) {
    return (
      <JobForm
        jobId={job.id}
        initialData={job}
        onCancel={() => setIsEditing(false)}
        onSuccess={handleEditSuccess}
      />
    );
  }

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4 items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{job.position}</h1>
            <div className="flex items-center gap-2 mt-1 text-gray-500">
              <Business fontSize="small" /> <span>{job.companyName}</span>
              <span className="mx-2"></span>
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
          <Button variant="outlined" startIcon={<Edit />} onClick={() => setIsEditing(true)}>Edit</Button>
        </div>
      </div>

      <Divider className="mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-4 gap-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 uppercase">Location</p>
              <p className="font-semibold text-gray-900">{job.location}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 uppercase">Type</p>
              <p className="font-semibold text-gray-900">{formatJobType(job.type)}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 uppercase">Experience</p>
              <p className="font-semibold text-gray-900">
                {job.yoer ? `${job.yoer} Years` : 'N/A'}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 uppercase">Posted</p>
              <p className="font-semibold text-gray-900">{formatDate(job.postedAt)}</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-600 whitespace-pre-wrap">{job.description}</p>
          </div>

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
          <div className="bg-gray-50 border-t border-gray-200">
            <div className="flex items-center gap-2 mt-3 mb-2">
              <h3 className="text-lg font-bold text-gray-900">Assign Reviewers</h3>
            </div>

            <AutocompleteWoControl
              multiple
              options={allReviewers}
              getOptionLabel={(option: EmployeeDTO) => `${option.name} (${option.email})`}
              value={selectedReviewers}
              onChange={(_: any, newValue: EmployeeDTO[]) => setSelectedReviewers(newValue)}
            />
          </div>

          {job.status === 'CLOSED' && job.closeReason && (
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <h4 className="text-orange-900 font-bold mb-1">Job Closed</h4>
              <p className="text-orange-800 text-sm">Reason: {job.closeReason}</p>
            </div>
          )}

        </div>

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
                        {app.status.replace('_', ' ')}
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
      <div className="flex justify-end gap-3 mt-2">
        <Button
          variant="contained"
          onClick={handleSaveReviewers}
          disabled={savingReviewers}
          sx={{ backgroundColor: 'black', '&:hover': { backgroundColor: '#333' } }}
        >
          {savingReviewers ? 'Saving...' : 'Save Changes'}
        </Button>
        {job.status === 'CLOSED' ? (
          <Button variant="outlined" color="success" onClick={handleOpenJob}>
            Open Job
          </Button>
        ) : (
          <Button variant="outlined" color="warning" onClick={() => setCloseModalOpen(true)}>
            Close Job
          </Button>
        )}
        <Button variant="contained" color="error" onClick={() => setConfirmData({ open: true, action: 'delete' })}>
          Delete Job
        </Button>
      </div>

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
                <div className='flex gap-2 w-full items-stretch'>
                  {selectedApp.resumeFilePath ? (
                    <div className="flex-1 min-w-0 bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <Description className="text-blue-600 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-blue-900 truncate">Candidate Resume</p>
                          <p className="text-xs text-blue-700 truncate">Click to view the full document</p>
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
                    <div className="flex-1 min-w-0 bg-gray-50 p-4 rounded-xl text-center text-gray-500 text-sm italic flex items-center justify-center">
                      No resume uploaded
                    </div>
                  )}
                </div>

                <div>
                  <Typography variant="subtitle2" className="font-bold text-gray-900 mb-2">
                    Status
                  </Typography>
                  <AutocompleteWoControl
                    id='status'
                    value={selectedStatus}
                    options={statusOptions}
                    onChange={(_, value) => setSelectedStatus(value as ApplicationStatus)}
                  />
                </div>
                {selectedStatus === 'INTERVIEW_SCHEDULED' && (
                  <div className="mb-4 border-1 border-gray-200 p-3 rounded-lg">
                    <div className="flex items-center gap-3 mt-2">
                      <Typography variant="body2">Number of Rounds:</Typography>
                      <Input
                        type="number"
                        value={roundsCount}
                        onChange={(e) => setRoundsCount(Number(e.target.value))}
                        size="small"
                      /> 
                    </div>
                  </div>
                )}
                <div>
                  <Typography variant="subtitle2" className="font-bold text-gray-900 mb-2">
                    Cover Letter
                  </Typography>
                  <div className="bg-gray-50 p-4 mb-2 rounded-xl border border-gray-200 text-sm text-gray-700 leading-relaxed min-h-[100px]">
                    {selectedApp.coverLetter || "No cover letter provided."}
                  </div>
                  <Typography variant="subtitle2" className="font-bold text-gray-900 mb-2">
                    Recruiter Comment
                  </Typography>
                  <Input
                    multiline
                    rows={3}
                    placeholder="Add a comment or feedback about this application."
                    value={recruiterComment}
                    onChange={(e) => setRecruiterComment(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Box className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <Typography variant="subtitle2" className="font-bold text-gray-900 mb-3">
                    Candidate Skills
                  </Typography>

                  <AutocompleteWoControl
                    multiple
                    options={allSkills}
                    getOptionLabel={(option: Skill) => option.name}
                    value={appSkills.map(as => as.skill)}
                    onChange={handleSkillChange}
                  />

                  <div className="mt-3 space-y-2 max-h-[200px] overflow-y-auto">
                    {appSkills.length === 0 && <p className="text-xs text-gray-400 italic">No skills selected.</p>}

                    {appSkills.map((item) => (
                      <div key={item.skill.id} className="flex items-center gap-3 bg-white p-2 rounded border border-gray-100">
                        <span className="text-sm font-medium text-gray-700 flex-1">{item.skill.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Exp (Yrs):</span>
                          <input
                            type="number"
                            min="0"
                            className="w-16 p-1 text-sm border border-gray-300 rounded focus:border-black outline-none"
                            value={item.yearsOfExperience}
                            onChange={(e) => handleYoeChange(item.skill.id, e.target.value)}
                          />
                        </div>
                        <IconButton size="small" color="error" onClick={() => handleSkillChange(null, appSkills.filter(s => s.skill.id !== item.skill.id).map(s => s.skill))}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </div>
                    ))}
                  </div>
                </Box>
              </div>
            </DialogContent>

            <DialogActions className="p-4 border-t border-gray-100 bg-gray-50">
              <div className="flex gap-3 w-full justify-end">
                <Button
                  variant="contained"
                  onClick={handleStatusUpdate}
                  disabled={updatingStatus}
                  sx={{ backgroundColor: 'black', '&:hover': { backgroundColor: '#333' } }}
                >
                  {updatingStatus ? 'Updating...' : 'Update Status'}
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
            Please provide a reason for closing this job.
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
            onClick={handleCloseSubmit}
            disabled={closing}
          >
            {closing ? 'Closing...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmData.open}
        title="Delete Job"
        message="Are you sure you want to delete this job?"
        confirmText="Delete"
        confirmColor="error"
        onCancel={() => setConfirmData({ open: false, action: null })}
        onConfirm={handleConfirmAction}
      />
    </div>
  );
};

export default JobDetails;