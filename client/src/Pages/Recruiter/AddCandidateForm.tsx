import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Box } from '@mui/material';
import { toast } from 'sonner';

import Button from '../../Components/ui/Button';
import Input from '../../Components/ui/Input';
import AutocompleteWoControl from '../../Components/ui/AutoCompleteWoControl';
import api from '../../utils/api';
import type { AddCandidateFormData } from '../../Types/types';
import type { Skill } from '../../Types/jobTypes';

interface AddCandidateFormProps {
  onSuccess: () => void;
}

const AddCandidateForm = ({ onSuccess}: AddCandidateFormProps) => {
  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loadingSkills, setLoadingSkills] = useState(false);

  const {
    control,
    reset,
    handleSubmit,
    formState: { errors }
  } = useForm<AddCandidateFormData>({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      skills: [],
      location: '',
      degree: '',
      branch: '',
      collegeName: '',
      currentCompany: '',
      graduationYear: new Date().getFullYear(),
      totalExperience: 0
    },
    mode: 'onChange'
  });

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    setLoadingSkills(true);
    try {
      const response = await api.get('/skills');
      setSkills(response.data?.data || response.data || []);
    } catch (error: any) {
      toast.error('Failed to load skills');
    } finally {
      setLoadingSkills(false);
    }
  };

  const onSubmit = async (data: AddCandidateFormData) => {
    setLoading(true);
    try {
      await api.post('/user/candidate', {
        ...data,
        skills: data.skills.map(id => ({ skillId: id }))
      });
      toast.success('Candidate added successfully');
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add candidate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 py-2">
      {/* BASIC INFO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Controller
          name="name"
          control={control}
          rules={{ required: 'Name is required' }}
          render={({ field }) => (
            <Input {...field} label="Full Name" error={!!errors.name} />
          )}
        />

        <Controller
          name="email"
          control={control}
          rules={{ required: 'Email is required' }}
          render={({ field }) => (
            <Input {...field} label="Email" error={!!errors.email} />
          )}
        />

        <Controller
          name="phone"
          control={control}
          rules={{ required: 'Phone is required' }}
          render={({ field }) => (
            <Input {...field} label="Phone" />
          )}
        />

        <Controller
          name="location"
          control={control}
          render={({ field }) => <Input {...field} label="Location" />}
        />
      </div>

      {/* SKILLS */}
      <Controller
        name="skills"
        control={control}
        rules={{ required: 'Select at least one skill' }}
        render={({ field }) => (
          <AutocompleteWoControl
            multiple
            label="Skills"
            options={skills}
            loading={loadingSkills}
            getOptionLabel={(option: Skill) => option.name}
            value={skills.filter(s => field.value.includes(s.id))}
            onChange={(_, newValue: Skill[]) =>
              field.onChange(newValue.map(skill => skill.id))
            }
            error={!!errors.skills}
            helperText={errors.skills?.message}
          />
        )}
      />

      {/* EDUCATION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Controller
          name="degree"
          control={control}
          render={({ field }) => <Input {...field} label="Degree" />}
        />

        <Controller
          name="branch"
          control={control}
          render={({ field }) => <Input {...field} label="Branch" />}
        />

        <Controller
          name="collegeName"
          control={control}
          render={({ field }) => <Input {...field} label="College Name" />}
        />

        <Controller
          name="graduationYear"
          control={control}
          render={({ field }) => (
            <Input {...field} type="number" label="Graduation Year" />
          )}
        />
      </div>

      {/* PROFESSIONAL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Controller
          name="currentCompany"
          control={control}
          render={({ field }) => (
            <Input {...field} label="Current Company" />
          )}
        />

        <Controller
          name="totalExperience"
          control={control}
          render={({ field }) => (
            <Input {...field} type="number" label="Total Experience (Years)" />
          )}
        />
      </div>

      {/* ACTIONS */}
      <Box className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outlined" onClick={()=> reset()}>
          Clear
        </Button>

        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? 'Saving...' : 'Add Candidate'}
        </Button>
      </Box>
    </form>
  );
};

export default AddCandidateForm;
