import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Box } from '@mui/material';
import { toast } from 'sonner';
import Button from '../../Components/ui/Button';
import Input from '../../Components/ui/Input';
import type { ApplicationFormProps, JobApplicationFormData } from '../../Types/jobTypes';
import useCloudinaryUpload from '../../Hooks/useCloudinary';
import useAuthStore from '../../Store/authStore';
import api from '../../utils/api';

const JobApplicationForm = ({ open, job, onClose }: ApplicationFormProps) => {
  const user = useAuthStore((state: any) => state);
  const [formData, setFormData] = useState<JobApplicationFormData>({
    coverLetter: '',
    resumeFilePath: '',
    jobId: job.id,
    candidateId: user.userId
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploaded, setUploaded] = useState(false);
  const { uploading, file, handleFileChange, uploadFileToCloudinary } = useCloudinaryUpload();

  useEffect(() => {
    if (open) {
      setFormData({
        coverLetter: '',
        resumeFilePath: '',
        jobId: job.id,
        candidateId: user.userId
      });
      setErrors({});
    }
  }, [open, job.id, user.userId]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.coverLetter.trim()) {
      newErrors.coverLetter = 'Cover letter is required';
    } else if (formData.coverLetter.trim().length < 10) {
      newErrors.coverLetter = 'Cover letter must be at least 50 characters';
    }
    if (!file) {
      newErrors.resumeFilePath = 'Resume is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    try {
      // upload resume
      let uploadedResumeUrl = "";
      if (file) {
        const resumeUrl = await uploadFileToCloudinary(file);
        if (!resumeUrl) {
          toast.error('Resume upload failed.');
          setLoading(false)
          return;
        }
        uploadedResumeUrl = resumeUrl
        setUploaded(true)
      }
      const payload = {
        resumeFilePath: uploadedResumeUrl,
        jobId: job.id,
        coverLetter: formData.coverLetter,
        candidateId: user.userId
      };
      const response = await api.post('/application', payload);

      toast.success(response.data.message || 'Application submitted successfully!');
      onClose();
    } catch (error) {
      if(error.response) {
        toast.error(error.response?.data?.message || 'Failed to submit application');
      }else{
        toast.error('Network error. Please check your connection');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6" className="font-semibold">
          Apply for {job.position}
        </Typography>
        <Typography variant="body2" color="text.secondary" className="mt-1">
          {job.companyName} • {job.location}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box className="space-y-4 mt-2">
          <div>
            <Input
              id="cover-letter"
              label="Cover Letter *"
              multiline
              rows={6}
              value={formData.coverLetter}
              onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
              error={!!errors.coverLetter}
              helperText={errors.coverLetter || 'Explain why you are a good fit for this role (minimum 50 characters)'}
              placeholder="Dear Hiring Manager,&#10;&#10;I am writing to express my interest in the position..."
              fullWidth
            />
          </div>

          <div>
          </div>

          <div>
            <Typography variant="body2" className="font-medium mb-2">
              Upload Resume 
              <span className='text-red-500'>*</span>
            </Typography>
            <Box className="space-y-2 mt-1">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100
                  file:cursor-pointer cursor-pointer"
                disabled={uploading}
              />
              {uploading && (
                <Typography variant="body2" className="text-blue-600">
                  Uploading resume...
                </Typography>
              )}
              {uploaded && (
                <Typography variant="body2" className="text-green-600">
                  Resume uploaded successfully
                </Typography>
              )}
              <Typography variant="caption" className="text-gray-500">
                If different from your profile resume. Supported formats: PDF, DOC, DOCX
              </Typography>
            </Box>
          </div>

          <Box className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <Typography variant="body2" className="font-medium text-blue-900 mb-2">
              📋 Job Requirements
            </Typography>
            <Typography variant="body2" className="text-blue-800">
              {job.description}
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions className="p-4 border-t">
        <Button id="cancel-application" variant="outlined" onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          id="submit-application"
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Application'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default JobApplicationForm;