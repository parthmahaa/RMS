import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock, FileText, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import Button from '../Components/ui/Button';
import api from '../utils/api';
import { formatDate, formatJobType } from '../utils/jobFormatters';
import type { JobApplication } from '../Types/jobTypes';

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

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { 
      bgColor: string; 
      textColor: string; 
      borderColor: string;
      icon: React.ReactElement;
    }> = {
      'ACCEPTED': {
        bgColor: 'bg-green-50',
        textColor: 'text-green-700',
        borderColor: 'border-green-200',
        icon: <CheckCircle className="w-4 h-4" />
      },
      'REJECTED': {
        bgColor: 'bg-red-50',
        textColor: 'text-red-700',
        borderColor: 'border-red-200',
        icon: <XCircle className="w-4 h-4" />
      },
      'PENDING': {
        bgColor: 'bg-yellow-50',
        textColor: 'text-yellow-700',
        borderColor: 'border-yellow-200',
        icon: <Clock className="w-4 h-4" />
      },
      'REVIEWED': {
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-700',
        borderColor: 'border-blue-200',
        icon: <FileText className="w-4 h-4" />
      },
      'LINKED': {
        bgColor: 'bg-purple-50',
        textColor: 'text-purple-700',
        borderColor: 'border-purple-200',
        icon: <Eye className="w-4 h-4" />
      },
      'UNDER_REVIEW': {
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-700',
        borderColor: 'border-blue-200',
        icon: <FileText className="w-4 h-4" />
      }
    };
    return configs[status] || {
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-700',
      borderColor: 'border-gray-200',
      icon: <FileText className="w-4 h-4" />
    };
  };

  const formatApplicationStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
      'PENDING': 'Pending',
      'ACCEPTED': 'Accepted',
      'REJECTED': 'Rejected',
      'REVIEWED': 'Under Review',
      'UNDER_REVIEW': 'Under Review',
      'LINKED': 'Linked'
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          My Applications
        </h1>
        <p className="text-gray-600 mt-1">
          Track the status of your job applications
        </p>
      </div>

      {applications.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {applications.map((application) => {
            const statusConfig = getStatusConfig(application.status);
            
            return (
              <div
                key={application.id}
                className="bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-full overflow-hidden"
              >
                <div className="p-5 flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 flex-1 pr-2">
                      {application.position}
                    </h3>
                    <span 
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor}`}
                    >
                      {statusConfig.icon}
                      {formatApplicationStatus(application.status)}
                    </span>
                  </div>

                  <p className="text-sm text-black font-medium mb-1">
                    {application.companyName}
                  </p>

                  <p className="text-sm text-gray-500 mb-3">
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
                      <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-100">
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
                    onClick={() => navigate(`/applications/jobs/${application.jobId}`, { state: { from: '/applications' } })}
                    startIcon={<Eye className="w-4 h-4" />}
                    fullWidth
                  >
                    View Job Details
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center space-y-2">
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
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No applications yet
          </h2>
          <Button
            id="browse-jobs"
            variant="contained"
            onClick={() => navigate('/jobs')}
          >
            Browse Jobs
          </Button>
        </div>
      )}
    </div>
  );
};

export default Applications;