import { useMutation } from '@tanstack/react-query';

import { axios } from '@/core/axios';
import { invalidateQueries } from '@/core/react-query/queryClient';

export const useQueueClearMutation = () =>
  useMutation({
    mutationFn: () => axios.post('Queue/Clear'),
    onSuccess: () => invalidateQueries(['queue', 'items']),
  });

export const useQueuePauseMutation = () =>
  useMutation({
    mutationFn: () => axios.post('Queue/Pause'),
    onSuccess: () => invalidateQueries(['queue', 'items']),
  });

export const useQueueResumeMutation = () =>
  useMutation({
    mutationFn: () => axios.post('Queue/Resume'),
    onSuccess: () => invalidateQueries(['queue', 'items']),
  });
