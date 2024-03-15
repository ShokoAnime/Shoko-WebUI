import { useMutation } from '@tanstack/react-query';

import { axios } from '@/core/axios';

export const useQueueClearMutation = () =>
  useMutation({
    mutationFn: () => axios.post('Queue/Clear'),
  });

export const useQueuePauseMutation = () =>
  useMutation({
    mutationFn: () => axios.post('Queue/Pause'),
  });

export const useQueueResumeMutation = () =>
  useMutation({
    mutationFn: () => axios.post('Queue/Resume'),
  });
