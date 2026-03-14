import { useMutation } from '@tanstack/react-query';

import { axios } from '@/core/axios';
import { invalidateQueries } from '@/core/react-query/queryClient';

import type { HashingSummaryType, UpdateHashingProviderType } from '@/core/react-query/hashing/types';

export const useUpdateHashingProviderMutation = () =>
  useMutation({
    mutationFn: ({ id, settings }: { id: string, settings: UpdateHashingProviderType }) =>
      axios.put(`/Hashing/Provider/${id}`, settings),
    onSuccess: () => invalidateQueries(['hashing', 'providers']),
  });

export const useUpdateHashingSettingsQuery = () =>
  useMutation({
    mutationFn: (data: HashingSummaryType) => axios.post('/Hashing/Settings', data),
    onSuccess: () => invalidateQueries(['hashing', 'summary']),
  });
