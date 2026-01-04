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

interface SkillOption {
  id: number;
  name: string;
}

const JobForm = ({ jobId, initialData, onSuccess, onCancel }: JobFormProps) => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loadingSkills, setLoadingSkills] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const isEditMode = !!jobId;

  const { control, handleSubmit, formState: { errors }, setValue, watch } = useForm<JobFormData>({
    defaultValues: {
      position: initialData?.position || '',
      description: initialData?.description || '',
      yoer: initialData?.yoer || 0,
      location: initialData?.location || '',
      type: initialData?.type || 'FULL_TIME',
      requiredSkillIds: initialData?.requiredSkills?.map(s => s.skillId) || [],
      preferredSkillIds: initialData?.preferredSkills?.map(s => s.skillId) || [],
    },
    mode: 'onChange'
  });

  const selectedRequiredSkillIds = watch('requiredSkillIds');
  const selectedPreferredSkillIds = watch('preferredSkillIds');

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

  const getSelectedSkills = (ids: number[]) => {
    if (!ids) return [];
    return skills.filter(s => ids.includes(s.id));
  };


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
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
        <FormSection title="Basic Information">
          <div className='space-y-2'>
          <Controller
            name="position"
            control={control}
            rules={{ required: 'Position is required' }}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Position Title <span className='text-red-500'>*</span>
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
          <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>

            <Controller
              name="location"
              control={control}
              rules={{ required: 'Location is required' }}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location <span className='text-red-500'>*</span>
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
            <Controller
              name='yoer'
              control={control}
              rules={{
                required: 'Experience is required',
                min: { value: 0, message: 'Cannot be negative' }
              }}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-  text-black mb-2">
                    Years of Experience (Required) <span className='text-red-500'>*</span>
                  </label>
                  <Input
                    {...field}
                    type="number"
                    id="yearsOfExperience"
                    placeholder="e.g. 2"
                    error={!!errors.yoer}
                    helperText={errors.yoer?.message}
                  />
                </div>
              )}
              />
              </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Type <span className='text-red-500'>*</span>
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
                <label className="block text-sm font-medium text-gray-700">
                  Description <span className='text-red-500'>*</span>
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

        <FormSection title="Skills & Requirements">
            <div className="space-y-2">
              <Typography className="text-sm font-medium text-gray-700">
                Required Skills <span className='text-red-500'>*</span>
              </Typography>
              <AutocompleteWoControl
                multiple
                options={skills}
                loading={loadingSkills}
                getOptionLabel={(o: SkillOption) => o.name}
                value={getSelectedSkills(selectedRequiredSkillIds)}
                onChange={(_, newValue: SkillOption[]) =>
                  setValue(
                    'requiredSkillIds',
                    newValue.map(s => s.id)
                  )
                }
              />
            </div>

            <div className="space-y-2 mt-1">
              <Typography className="text-sm font-medium text-gray-700">
                Preferred Skills
              </Typography>
              <AutocompleteWoControl
                multiple
                options={skills}
                loading={loadingSkills}
                getOptionLabel={(o: SkillOption) => o.name}
                value={getSelectedSkills(selectedPreferredSkillIds)}
                onChange={(_, newValue: SkillOption[]) =>
                  setValue(
                    'preferredSkillIds',
                    newValue.map(s => s.id)
                  )
                }
              />
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