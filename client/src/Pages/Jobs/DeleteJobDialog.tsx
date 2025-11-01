import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import Button from '../../Components/ui/Button';
import Input from '../../Components/ui/Input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../Components/ui/Select';
import type { DeleteDialogProps } from '../../Types/jobTypes';

const DeleteJobDialog = ({ 
  open, 
  onClose, 
  onConfirm, 
  jobTitle,
  hasApplicants,
  closeReason,
  closeComment,
  onReasonChange,
  onCommentChange
}: DeleteDialogProps) => {
  if (!hasApplicants) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Delete Job</DialogTitle>
        <DialogContent>
          <div className="space-y-4 pt-2">
            <p className="text-gray-700 mb-4">
              Before deleting the job posting for <strong>{jobTitle}</strong>, please provide a close reason.
            </p>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Close Reason *
              </label>
            </div>
            
            <div>
              <Input
                id="delete-close-comment"
                label="Close Comment (Optional)"
                multiline
                rows={3}
                value={closeComment || ''}
                onChange={(e) => onCommentChange?.(e.target.value)}
                placeholder="Add any additional comments..."
              />
            </div>
          </div>
        </DialogContent>
        <DialogActions className="p-4">
          <Button id="cancel-delete" variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            id="confirm-delete" 
            variant="contained" 
            onClick={onConfirm}
            disabled={!closeReason}
          >
            Delete Job
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  // If job has applicants, show simple confirmation dialog
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Delete Job</DialogTitle>
      <DialogContent>
        <div className="pt-2">
          <p className="text-gray-700">
            Are you sure you want to delete the job posting for <strong>{jobTitle}</strong>? This action cannot be undone.
          </p>
        </div>
      </DialogContent>
      <DialogActions className="p-4">
        <Button id="cancel-delete" variant="outlined" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          id="confirm-delete" 
          variant="contained" 
          onClick={onConfirm}
        >
          Delete Job
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteJobDialog;