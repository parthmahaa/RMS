import { Card, CardContent, CardActions, Typography, Chip, IconButton, Box } from '@mui/material';
import { Delete, Edit, Close as CloseIcon, Visibility } from '@mui/icons-material';
import type { JobCardProps } from '../../Types/jobTypes';
import { formatJobStatus, formatJobType, formatDate } from '../../utils/jobFormatters';

const JobCard = ({ job, onDelete, onClose, onView, onEdit }: JobCardProps) => {

  return (
    <Card className="h-full flex flex-col hover:shadow-xl transition-all duration-300 border border-gray-100">
      <CardContent className="flex-1 cursor-pointer p-5" onClick={() => onView(job.id)}>
        <Box className="flex justify-between items-start mb-3">
          <Typography variant="h6" className="font-semibold text-gray-900 flex-1 pr-2">
            {job.position}
          </Typography>
          <Chip
            label={formatJobStatus(job.status)}
            size="small"
            className="shrink-0"
          />
        </Box>

        <Typography variant="body2" color="text.secondary" className="mb-3 font-medium">
          {job.companyName}
        </Typography>

        <Typography variant="body2" className="mb-3 text-gray-600 flex items-center">
          <span className="mr-1">📍</span> {job.location}
        </Typography>

        <Typography variant="body2" className="mb-4 line-clamp-2 text-gray-700 leading-relaxed">
          {job.description}
        </Typography>

        <Box className="flex flex-wrap gap-2 mb-3">
          <Chip label={formatJobType(job.type)} size="small" variant="outlined" className="font-medium" />
          <Chip
            label={`${job.applications.length} Application${job.applications.length !== 1 ? 's' : ''}`}
            size="small"
            variant="outlined"
            className="font-medium"
          />
        </Box>

        <Typography variant="caption" color="text.secondary" className="block">
          Posted on {formatDate(job.postedAt)}
        </Typography>
      </CardContent>

      <CardActions className="justify-between px-4 pb-4 pt-2 bg-gray-50 border-t border-gray-100">
        <Box className="flex gap-2">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(job.id);
              }}
              title="Edit Job"
              sx={{
                color: '#0284c7',
                '&:hover': { backgroundColor: 'rgba(2, 132, 199, 0.1)' }
              }}
            >
              <Edit fontSize="small" />
            </IconButton>
        </Box>

        <Box className="flex gap-1">
            <IconButton
              size="small"
              color="warning"
              onClick={(e) => {
                e.stopPropagation();
                onClose(job.id);
              }}
              title="Close Job"
              className="hover:bg-orange-50"
            >
              <CloseIcon fontSize="small" />
            </IconButton>

          <IconButton
            size="small"
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(job.id);
            }}
            title="Delete Job"
            className="hover:bg-red-50"
          >
            <Delete fontSize="small" />
          </IconButton>
        </Box>
      </CardActions>
    </Card>
  );
};

export default JobCard;