// src/hooks/useProfileCompletion.ts

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import api from '../utils/api';
import useAuthStore from '../Store/authStore';

export const useProfileCompletion = () => {
  const [isProfileComplete, setIsProfileComplete] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuthStore((state) => state); 

  const checkProfileCompletion = useCallback(async () => {
    if (!isAuthenticated) {
      setIsProfileComplete(null);
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.get('/user/status');

      if (response.data.data) {
        setIsProfileComplete(response.data.data); 
      } else {
        setIsProfileComplete(false)
      }
    } catch (error: any) {
      console.error('Error checking profile completion:', error);
      toast.error(error.message || 'Failed to check profile status');
      setIsProfileComplete(null); 
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    checkProfileCompletion();
  }, [checkProfileCompletion]);

  const refreshProfileStatus = useCallback(async () => {
    toast.promise(checkProfileCompletion(), {
      loading: 'Refreshing profile status...',
      success: 'Profile status updated!',
      error: 'Could not refresh status.',
    });
  }, [checkProfileCompletion]);

  return {
    isProfileComplete,
    isLoading,
    refreshProfileStatus,
  };
};