import { Chip } from '@mui/material';
import { Delete, Edit, Close as CloseIcon} from '@mui/icons-material';
import type { JobCardProps } from '../../Types/jobTypes';
import { formatJobStatus, formatJobType, formatDate } from '../../utils/jobFormatters';

const JobCard = ({ job, onDelete, onClose, onView, onEdit }: JobCardProps) => {

  return (
    <div
      onClick={() => onView(job.id)}
      className="bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-300 p-5 flex flex-col justify-between cursor-pointer"
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-900">{job.position}</h3>
        {job.status === 'OPEN' ? (
          <Chip
            size="small"
            label={formatJobStatus(job.status)}
            color="success"
            className="text-white"
          />
        ) : (
          <Chip
            size="small"
            label={formatJobStatus(job.status)}
            color="error"
            className="text-white"
          />
        )}
      </div>

      <p className="text-gray-600 text-sm mb-2 font-medium">{job.companyName}</p>
      <p className="text-gray-500 text-sm mb-3">📍 {job.location}</p>
      <p className="text-gray-700 text-sm line-clamp-2 mb-4">{job.description}</p>

      <div className="flex flex-wrap gap-2 mb-3">
        <span className="text-xs font-medium border px-2 py-1 rounded-lg text-blue-700 border-blue-300 bg-blue-50">
          {formatJobType(job.type)}
        </span>
        <span className="text-xs font-medium border px-2 py-1 rounded-lg text-gray-700 border-gray-300 bg-gray-50">
          {job.applications.length} Application
          {job.applications.length !== 1 && 's'}
        </span>
      </div>

      <p className="text-xs text-gray-400">Posted on {formatDate(job.postedAt)}</p>

      <div className="flex justify-between items-center pt-3">
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(job.id);
            }}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
            title="Edit Job"
          >
            <Edit fontSize="small" />
          </button>
        </div>
        <div className="flex gap-2">
          {job.status !== 'CLOSED' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose(job.id);
              }}
              className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg"
              title="Close Job"
            >
              <CloseIcon fontSize="small" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(job.id);
            }}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
            title="Delete Job"
          >
            <Delete fontSize="small" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobCard;