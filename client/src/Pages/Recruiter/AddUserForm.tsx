import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'sonner';
import { Box, MenuItem } from '@mui/material';
import Button from '../../Components/ui/Button';
import Input from '../../Components/ui/Input';
import api from '../../utils/api';
import AutocompleteWoControl from '../../Components/ui/AutoCompleteWoControl';

interface AddUserFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

interface AddUserFormData {
    name: string;
    email: string;
    role: string;
}

const AddUserForm = ({ onSuccess, onCancel }: AddUserFormProps) => {
    const [loading, setLoading] = useState(false);
    const {
        control,
        handleSubmit,
        formState: { errors }
    } = useForm<AddUserFormData>({
        defaultValues: {
            name: '',
            email: '',
            role: ''
        },
        mode: 'onChange'
    });

    const onSubmit = async (data: AddUserFormData) => {
        setLoading(true);
        try {
            await api.post('/user/add', data);
            toast.success('User invited successfully');
            onSuccess();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to invite user');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-2">
            <div className='flex flex-col gap-3'>
                <Controller
                    name="name"
                    control={control}
                    rules={{ required: 'Name is required' }}
                    render={({ field }) => (
                        <Input
                            {...field}
                            label="Name"
                            error={!!errors.name}
                            helperText={errors.name?.message}
                        />
                    )}
                />

                <Controller
                    name="email"
                    control={control}
                    rules={{
                        required: 'Email is required',
                        pattern: {
                            value: /^\S+@\S+\.\S+$/,
                            message: 'Enter a valid email address'
                        }
                    }}
                    render={({ field }) => (
                        <Input
                            {...field}
                            label="Email"
                            error={!!errors.email}
                            helperText={errors.email?.message}
                        />
                    )}
                />

                <Controller
                    name="role"
                    control={control}
                    rules={{ required: 'Role is required' }}
                    render={({ field }) => (
                        <AutocompleteWoControl
                            id="role"
                            label="Role"
                            value={field.value}
                            options={["RECRUITER", "HR", "INTERVIEWER", "VIEWER", "REVIEWER"]}
                            onChange={(_, newValue) => field.onChange(newValue)}
                            error={!!errors.role}
                            helperText={errors.role?.message}
                        />
                    )}
                />
            </div>
            <Box className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                <Button
                    id="cancel-add"
                    variant="outlined"
                    onClick={onCancel}
                    disabled={loading}
                >
                    Cancel
                </Button>
                <Button
                    id="submit-add"
                    variant="contained"
                    type="submit"
                    disabled={loading}
                    sx={{ backgroundColor: 'black' }}
                >
                    {loading ? 'Inviting...' : 'Add User'}
                </Button>
            </Box>
        </form>
    );
};

export default AddUserForm;