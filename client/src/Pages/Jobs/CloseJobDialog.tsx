import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import Button from '../../Components/ui/Button';
import Input from '../../Components/ui/Input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../Components/ui/Select';
import type { CloseDialogProps } from '../../Types/jobTypes';

const CloseJobDialog = ({ 
  open, 
  onClose, 
  onConfirm, 
  jobTitle, 
  closeReason, 
  closeComment,
  onReasonChange,
  onCommentChange 
}: CloseDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Close Job</DialogTitle>
      <DialogContent>
        <div className="space-y-4 pt-2">
          <p className="text-gray-700 mb-4">
            Are you sure you want to close the job posting for <strong>{jobTitle}</strong>?
          </p>
          <div>
            <Input
              id="close-comment"
              label="Close Comment"
              multiline
              rows={3}
              value={closeComment}
              onChange={(e) => onCommentChange(e.target.value)}
              placeholder="Add any additional comments..."
            />
          </div>
        </div>
      </DialogContent>
      <DialogActions className="p-4">
        <Button id="cancel-close" variant="outlined" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          id="confirm-close" 
          variant="contained" 
          onClick={onConfirm}
          disabled={!closeReason}
        >
          Close Job
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CloseJobDialog;