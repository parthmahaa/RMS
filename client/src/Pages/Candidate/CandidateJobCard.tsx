import { CheckCircle, Visibility } from '@mui/icons-material';
import type { CandidateJobCardProps } from '../../Types/jobTypes';
import { formatJobType, formatDate } from '../../utils/jobFormatters';
import Button from '../../Components/ui/Button';

const CandidateJobCard = ({ job, onApply, onView, hasApplied }: CandidateJobCardProps) => {
  return(
    <div
      onClick={() => onView(job.id)}
      className="bg-white border border-gray-200 rounded-2xl hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between h-full"
    >
      <div className="p-5 flex-1">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-900">{job.position}</h3>
          {hasApplied && (
            <span className="flex items-center text-green-700 bg-green-50 text-sm font-medium px-2 py-1 rounded-md">
              <CheckCircle className="text-green-600 mr-1" fontSize="small" /> Applied
            </span>
          )}
        </div>

        <p className="text-sm text-black font-medium mb-2">{job.companyName}</p>
        <p className="text-sm text-gray-500 flex items-center mb-3">
          📍 {job.location}
        </p>

        <span className="inline-block text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 px-2 py-1 rounded-md mb-3">
          {formatJobType(job.type)}
        </span>

        <p className="text-xs text-gray-400">Posted on {formatDate(job.postedAt)}</p>
      </div>

      <div className="flex justify-between items-center px-5 py-3 rounded-b-2xl">
        <Button
          id={`view-job-${job.id}`}
          variant="outlined"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onView(job.id);
          }}
          startIcon={<Visibility fontSize="small" />}
        >
          View Details
        </Button>

        <Button
          id={`apply-job-${job.id}`}
          variant="contained"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onApply(job.id);
          }}
          disabled={hasApplied}
        >
          {hasApplied ? 'Already Applied' : 'Apply Now'}
        </Button>
      </div>
    </div>
  )
};

export default CandidateJobCard;