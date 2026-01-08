import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import api from '../../utils/api';
import Button from '../../Components/ui/Button';
import Input from '../../Components/ui/Input';
import ConfirmDialog from '../../Components/ui/ConfirmDialog';
import { Pagination } from '../../Components/ui/Pagination';
import AutocompleteWoControl from '../../Components/ui/AutoCompleteWoControl';
import { Delete, ManageAccounts, ManageAccountsRounded, Save, X } from '@mui/icons-material';

interface User {
  id: number;
  name: string;
  email: string;
  roles: string[];
  verified: boolean;
}

const AVAILABLE_ROLES = ['ADMIN', 'RECRUITER', 'CANDIDATE', 'REVIEWER','VIEWER','HR','INTERVIEWER'];

function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const [pendingRoleChanges, setPendingRoleChanges] = useState<Record<number, string>>({});
  const [savingRoles, setSavingRoles] = useState<Record<number, boolean>>({});

  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [page]);

  useEffect(() => {
  if (!searchTerm.trim()) {
    setFilteredUsers(users);
    return;
  }
  const search = searchTerm.toLowerCase();

  const filtered = users.filter(user =>
    user.email.toLowerCase().includes(search) ||
    user.name.toLowerCase().includes(search)
  );

  setFilteredUsers(filtered);
}, [searchTerm, users]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/users', {
      });
      const userData: User[] = response?.data?.data || []
      setUsers(userData);
      setFilteredUsers(userData);
      setTotalPages(1);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };
  const handleRoleChange = (userId: number, newRole: string) => {
    setPendingRoleChanges(prev => ({
      ...prev,
      [userId]: newRole
    }));
  };

  const handleSaveRole = async (userId: number) => {
    const newRole = pendingRoleChanges[userId];
    if (!newRole) return;

    setSavingRoles(prev => ({ ...prev, [userId]: true }));
    try {
      await api.put(`/admin/users/${userId}/roles`, { roles: [newRole] })
      toast.success('User role updated successfully');

      setPendingRoleChanges(prev => {
        const updated = { ...prev };
        delete updated[userId];
        return updated;
      });

      fetchUsers();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update role');
    } finally {
      setSavingRoles(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleCancelRoleChange = (userId: number) => {
    setPendingRoleChanges(prev => {
      const updated = { ...prev };
      delete updated[userId];
      return updated;
    });
  };

  const handlePasswordUpdate = async () => {
    if (!selectedUser) return;

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setPasswordLoading(true);
    try {
      await api.put(`/admin/users/${selectedUser.id}`, {
        password: newPassword
      });
      toast.success('Password updated successfully');
      setPasswordDialogOpen(false);
      setNewPassword('');
      setConfirmPassword('');
      setSelectedUser(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await api.delete(`/admin/users/${userToDelete.id}`);
      toast.success('User deleted successfully');
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to delete user');
    }
  };

  const openPasswordDialog = (user: User) => {
    setSelectedUser(user);
    setPasswordDialogOpen(true);
  };

  const closePasswordDialog = () => {
    setPasswordDialogOpen(false);
    setNewPassword('');
    setConfirmPassword('');
    setSelectedUser(null);
  };

  const openDeleteDialog = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
      </div>

      <div className=" rounded-lg  border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Input
              id="search-users"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              fullWidth
            />
          </div>
          <Button
            id="refresh-users"
            variant="outlined"
            onClick={fetchUsers}
          >
            Refresh
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            Loading users...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No users found
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Verified
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Roles
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.verified ? 'Yes' : 'No'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <AutocompleteWoControl
                            id={`role-select-${user.id}`}
                            options={AVAILABLE_ROLES}
                            value={user.roles?.[0] ?? null}
                            onChange={(_, value) => {
                              if (typeof value === 'string' && value) {
                                handleRoleChange(user.id, value);
                              }
                            }}
                            size="small"
                          />
                          {pendingRoleChanges[user.id] && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleSaveRole(user.id)}
                                disabled={savingRoles[user.id]}
                                className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors disabled:opacity-50"
                                title="Save Role"
                              >
                                <Save className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleCancelRoleChange(user.id)}
                                disabled={savingRoles[user.id]}
                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                                title="Discard Changes"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openPasswordDialog(user)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                            title="Update Password"
                          >
                            <ManageAccountsRounded className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openDeleteDialog(user)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                            title="Delete User"
                          >
                            <Delete className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 border-t border-gray-200">
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </div>

      {passwordDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm transition-opacity"
          onClick={closePasswordDialog}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-md m-4 transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Update Password</h2>
              <button
                onClick={closePasswordDialog}
                className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  Update password for: <span className="font-medium text-gray-900">{selectedUser?.email}</span>
                </p>
              </div>
              <div className='mb-2'>
                <Input
                  id="new-password"
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  fullWidth
                />
              </div>
              <Input
                id="confirm-password"
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                fullWidth
              />
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 rounded-b-lg border-t border-gray-200">
              <Button
                id="cancel-password-update"
                variant="outlined"
                onClick={closePasswordDialog}
              >
                Cancel
              </Button>
              <Button
                id="confirm-password-update"
                variant="contained"
                onClick={handlePasswordUpdate}
                disabled={passwordLoading || !newPassword || !confirmPassword}
              >
                {passwordLoading ? 'Updating..' : 'Update Password'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete User"
        message={`Are you sure you want to delete user "${userToDelete?.email}"? This action cannot be undone.`}
        onConfirm={handleDeleteUser}
        onCancel={closeDeleteDialog}
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="error"
      />
    </div>
  );
}

export default Users;