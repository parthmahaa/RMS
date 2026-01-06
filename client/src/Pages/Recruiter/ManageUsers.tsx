import { useState, useEffect } from 'react';
import { 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Chip,
  IconButton,
  CircularProgress
} from '@mui/material';
import { 
  Add, 
  UploadFile, 
  Search, 
  Edit, 
  Delete
} from '@mui/icons-material';
import { toast } from 'sonner';
import Button from '../../Components/ui/Button';
import BulkUpload from './BulkUpload';
import AddUserForm from './AddUserForm'; 
import api from '../../utils/api';
import ConfirmDialog from '../../Components/ui/ConfirmDialog';
import CommonModal from '../../Components/layout/CommonModal';
import AddCandidateForm from './AddCandidateForm';

interface Employee {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'ACTIVE' | 'INVITED' | 'INACTIVE';
}

const ManageUsers = () => {
  const [showUpload, setShowUpload] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCanidateModal, setShowCanidateModal] = useState(false)
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState<number | null>(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await api.get('/recruiter/employees');
      setEmployees(response.data.data || []);
    } catch (error: any) {
      toast.error('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSuccess = () => {
    setShowAddModal(false);
    fetchEmployees();
  };

  const handleDelete = async () => {
    if (!selectedEmpId) return;
    try {
      await api.delete(`/admin/users/${selectedEmpId}`); 
      toast.success('User removed successfully');
      setEmployees(prev => prev.filter(e => e.id !== selectedEmpId));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to remove user');
    } finally {
      setDeleteConfirmOpen(false);
      setSelectedEmpId(null);
    }
  };

  const handleEdit = (id: number) => {
    toast.info(`Edit functionality for user ${id} coming soon`);
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Team & Candidates</h1>
          <p className="text-gray-500 text-sm mt-1">Add, upload, and manage users for your company.</p>
        </div>
      </div>

      <div className="flex justify-end gap-4 mb-6">
        <Button 
          id="add-candidate-btn"
          variant="contained" 
          startIcon={<Add />}
          onClick={() => setShowAddModal(true)}
          sx={{ backgroundColor: 'black' }}
        >
          Add User
        </Button>
        <Button 
          id="add-candidate-btn"
          variant="contained" 
          startIcon={<Add />}
          onClick={() => setShowCanidateModal(true)}
          sx={{ backgroundColor: 'black' }}
        >
          Add Candidate
        </Button>
        <Button 
          id="toggle-upload-btn"
          variant="outlined"
          startIcon={<UploadFile />}
          onClick={() => setShowUpload(true)}
        >
          Upload via Excel
        </Button>
      </div>

      {showCanidateModal && (
        <CommonModal
          openState={showCanidateModal}
          onClose={() => setShowCanidateModal(false)}
          title="Add New Candidate">
            <AddCandidateForm onSuccess={() => setShowCanidateModal(false)} />
          </CommonModal>
      )}

      {showAddModal && (
        <CommonModal
          openState={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Invite New User"
          sizes={["70%", "70%", "100%", "50%"]}
        >
            <AddUserForm 
                onSuccess={handleAddSuccess} 
                onCancel={() => setShowAddModal(false)} 
            />
        </CommonModal>
      )}

      {showUpload && (
        <CommonModal
          openState={showUpload}
          onClose={() => setShowUpload(false)}
          title="Upload Candidates"
          sizes={["70%", "70%", "100%", "80%"]}
          closeOnEscape
        >
            <BulkUpload />
        </CommonModal>
      )}

      {/* Search and List Section */}
      <Paper elevation={0} className="border border-gray-200 rounded-xl overflow-hidden bg-white">
        <div className="p-4 border-b border-gray-200 flex items-center gap-2">
            <Search className="text-gray-400" />
            <input 
                type="text" 
                placeholder="Search by name, email or role..." 
                className="w-full outline-none text-sm text-gray-700"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>

        {/* Table */}
        <TableContainer>
          <Table>
            <TableHead className="bg-gray-50">
              <TableRow>
                <TableCell className="font-semibold text-gray-600">Name</TableCell>
                <TableCell className="font-semibold text-gray-600">Role</TableCell>
                <TableCell className="font-semibold text-gray-600">Status</TableCell>
                <TableCell align="right" className="font-semibold text-gray-600">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" className="py-8">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : filteredEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" className="py-8 text-gray-500">
                    No employees found matching your search.
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmployees.map((emp) => (
                  <TableRow key={emp.id} hover>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                            {emp.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <Typography variant="body2" className="font-medium text-gray-900">
                                {emp.name}
                            </Typography>
                            <Typography variant="caption" className="text-gray-500">
                                {emp.email}
                            </Typography>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                        <Chip 
                            label={emp.role} 
                            size="small" 
                            className="bg-gray-100 text-gray-700 font-medium text-xs" 
                        />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={emp.status} 
                        size="small"
                        color={emp.status === 'ACTIVE' ? 'success' : 'warning'}
                        variant={emp.status === 'ACTIVE' ? 'filled' : 'outlined'}
                        className="text-xs font-bold"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleEdit(emp.id)} className="text-blue-600">
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => {
                            setSelectedEmpId(emp.id);
                            setDeleteConfirmOpen(true);
                        }} 
                        className="text-red-600"
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <ConfirmDialog 
        open={deleteConfirmOpen}
        title="Remove User"
        message="Are you sure you want to remove this user from your company? This action cannot be undone."
        confirmText="Remove"
        confirmColor="error"
        onCancel={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default ManageUsers;