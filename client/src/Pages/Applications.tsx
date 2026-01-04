import { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography, Chip, Paper } from '@mui/material';
import { CheckCircle, Cancel, HourglassEmpty, RateReview, Visibility } from '@mui/icons-material';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import Button from '../Components/ui/Button';
import api from '../utils/api';
import { formatDate, formatJobType } from '../utils/jobFormatters';
import type { JobApplication, Job } from '../Types/jobTypes';


const Applications = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await api.get('/application/candidate');
      setApplications(response.data.data || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, 'success' | 'error' | 'warning' | 'info'> = {
      'ACCEPTED': 'success',
      'REJECTED': 'error',
      'PENDING': 'warning',
      'REVIEWED': 'info',
      'LINKED' : 'info',
      'UNDER_REVIEW': 'info'
    };
    return colorMap[status] || 'default';
  };

  const getStatusIcon = (status: string) => {
    const iconMap: Record<string, React.ReactElement> = {
      'ACCEPTED': <CheckCircle fontSize="small" />,
      'REJECTED': <Cancel fontSize="small" />,
      'PENDING': <HourglassEmpty fontSize="small" />,
      'REVIEWED': <RateReview fontSize="small" />,
      'LINKED : ': <Visibility fontSize="small" />,
      'UNDER_REVIEW': <RateReview fontSize="small" />
    };
    return iconMap[status] || null;
  };

  const formatApplicationStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
      'PENDING': 'Pending',
      'ACCEPTED': 'Accepted',
      'REJECTED': 'Rejected',
      'REVIEWED': 'Under Review',
      'UNDER_REVIEW': 'Under Review',
      'LINKED' : 'Linked'
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <Box className="flex justify-center items-center py-20">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="max-w-7xl mx-auto p-6">
      <Box className="mb-8">
        <Typography variant="h4" className="font-bold text-gray-900">
          My Applications
        </Typography>
        <Typography variant="body2" className="text-gray-600 mt-1">
          Track the status of your job applications
        </Typography>
      </Box>

      {applications.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {applications.map((application) => (
            <Paper
              key={application.id}
              className="border border-gray-200 rounded-2xl hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-full overflow-hidden"
            >
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 flex-1 pr-2">
                    {application.position}
                  </h3>
                  <Chip
                    label={formatApplicationStatus(application.status)}
                    color={getStatusColor(application.status)}
                    icon={getStatusIcon(application.status)}
                    size="small"
                    className="font-medium"
                  />
                </div>

                <p className="text-sm text-black font-medium">
                  {application.companyName}
                </p>

                <p className="text-sm text-gray-500 flex items-center mb-3">
                  {application.location}
                </p>

                <span className="inline-block text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 px-2 py-1 rounded-md mb-2">
                  {formatJobType(application.type)}
                </span>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    Applied on {formatDate(application.appliedAt)}
                  </p>
                  {application.recruiterComment && (
                    <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                      <p className="text-xs font-medium text-blue-900 mb-1">
                        Recruiter Comment:
                      </p>
                      <p className="text-xs text-blue-800">
                        {application.recruiterComment}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
                <Button
                  id={`view-job-${application.id}`}
                  variant="outlined"
                  size="small"
                  onClick={() => navigate(`/applications/jobs/${application.jobId}` , { state: { from: '/applications' } })}
                  startIcon={<Visibility fontSize="small" />}
                  fullWidth
                >
                  View Job Details
                </Button>
              </div>
            </Paper>
          ))}
        </div>
      ) : (
        <Box className="text-center py-16">
          <div className="mb-6">
            <svg
              className="mx-auto h-24 w-24 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <Typography variant="h6" className="text-gray-900 font-semibold mb-2">
            No applications yet
          </Typography>
          <Typography variant="body2" className="text-gray-600 mb-6">
            You haven't applied to any jobs yet. Start exploring opportunities!
          </Typography>
          <Button
            id="browse-jobs"
            variant="contained"
            onClick={() => navigate('/jobs')}
          >
            Browse Jobs
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default Applications;