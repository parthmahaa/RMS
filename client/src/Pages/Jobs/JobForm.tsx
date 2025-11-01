import { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'sonner';
import Button from '../../Components/ui/Button';
import Input from '../../Components/ui/Input';
import AutocompleteWoControl from '../../Components/ui/AutoCompleteWoControl';
import FormSection from '../../Components/ui/FormSection';
import type { JobFormProps, JobFormData, Skill } from '../../Types/jobTypes';
import api from '../../utils/api';

const JobForm = ({ jobId, initialData, onSuccess, onCancel }: JobFormProps) => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loadingSkills, setLoadingSkills] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const isEditMode = !!jobId;

  const { control, handleSubmit, formState: { errors }, setValue, watch } = useForm<JobFormData>({
    defaultValues: {
      position: initialData?.position || '',
      description: initialData?.description || '',
      location: initialData?.location || '',
      type: initialData?.type || 'FULL_TIME',
      skillRequirementIds: initialData?.skillRequirementIds || []
    }
  });

  const selectedSkillIds = watch('skillRequirementIds');

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    setLoadingSkills(true);
    try {
      const response = await api.get('/skills');
      const skillsData = response.data.data || [];
      setSkills(Array.isArray(skillsData) ? skillsData : []);
    } catch (error: any) {
      console.error('Error fetching skills:', error);
      toast.error(error.response?.data?.message || 'Failed to load skills');
      setSkills([]);
    } finally {
      setLoadingSkills(false);
    }
  };

  const onSubmit = async (data: JobFormData) => {
    setSubmitting(true);
    try {
      await onSuccess(data);
    } catch (error: any) {
      console.error('Error submitting job:', error);
      toast.error(error.response?.data?.message || 'Failed to save job');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedSkills = skills.filter(skill => selectedSkillIds.includes(skill.id));

  return (
    <Box className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Typography variant="h4" className="font-bold text-gray-900 mb-2">
          {isEditMode ? 'Update Job Posting' : 'Create Job'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {isEditMode ? 'Update the job details below' : 'Fill in the details to create a new job posting'}
        </Typography>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
          }
        }} className="space-y-6">
        <FormSection title="Basic Information">
          <div className="space-y-5">
            <Controller
              name="position"
              control={control}
              rules={{ required: 'Position is required' }}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Position Title *
                  </label>
                  <Input
                    {...field}
                    id="position"
                    error={!!errors.position}
                    helperText={errors.position?.message}
                  />
                </div>
              )}
            />

            <Controller
              name="location"
              control={control}
              rules={{ required: 'Location is required' }}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <Input
                    {...field}
                    id="location"
                    error={!!errors.location}
                    helperText={errors.location?.message}
                  />
                </div>
              )}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Type *
              </label>
              <AutocompleteWoControl
                id='type'
                options={['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN']}
                value={watch('type')}

                onChange={(_event, newValue) => {
                  if (newValue) setValue('type', newValue as any);
                }}
              />
              {errors.type && (
                <p className="text-red-600 text-sm mt-1">{errors.type.message}</p>
              )}
            </div>
          </div>
        </FormSection>

        <FormSection title="Job Description">
          <Controller
            name="description"
            control={control}
            rules={{ required: 'Description is required' }}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <Input
                  {...field}
                  id="description"
                  multiline
                  rows={6}
                  placeholder="Describe the role, responsibilities, and requirements..."
                  error={!!errors.description}
                  helperText={errors.description?.message}
                />
              </div>
            )}
          />
        </FormSection>

        <FormSection title="Required Skills">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Skills *
            </label>
            {loadingSkills ? (
              <Box className="flex justify-center py-8">
                <CircularProgress size={24} />
                <Typography variant="body2" className="ml-3 text-gray-600">
                  Loading skills...
                </Typography>
              </Box>
            ) : (
              <AutocompleteWoControl<Skill, true, false, false>
                id="skills"
                multiple
                options={skills}
                getOptionLabel={(option) => typeof option === 'string' ? option : option.name}
                value={selectedSkills}
                onChange={(_event, newValue) => {
                  const skillIds = Array.isArray(newValue) 
                    ? newValue.map(s => typeof s === 'string' ? 0 : s.id).filter(id => id !== 0)
                    : [];
                  setValue('skillRequirementIds', skillIds);
                }}
                error={!!errors.skillRequirementIds}
                helperText={errors.skillRequirementIds?.message || 'Select the skills required for this position'}
              />
            )}
          </div>
        </FormSection>

        <Box className="flex gap-3 pt-6 pb-4">
          <Button
            id="submit-job"
            type="submit"
            variant="contained"
            disabled={submitting}
            size="medium"
          >
            {submitting ? (
              <>
                <CircularProgress size={16} className="mr-2" />
                {isEditMode ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              isEditMode ? 'Update Job' : 'Create Job'
            )}
          </Button>
          <Button
            id="cancel-job"
            type="button"
            variant="outlined"
            onClick={onCancel}
            disabled={submitting}
            size="medium"
          >
            Cancel
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default JobForm;