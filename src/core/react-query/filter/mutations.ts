import { useMutation } from '@tanstack/react-query';

import { axios } from '@/core/axios';
import { invalidateQueries } from '@/core/react-query/queryClient';

import type { CreateOrUpdateFilterType } from '@/core/types/api/filter';

export const useCreateFilterMutation = () =>
  useMutation({
    mutationFn: (filter: CreateOrUpdateFilterType) => axios.post('Filter', filter),
    onSuccess: () => invalidateQueries(['filter']),
  });

export const useDeleteFilterMutation = () =>
  useMutation({
    mutationFn: (filterId: string) => axios.delete(`Filter/${filterId}`),
    onSuccess: () => invalidateQueries(['filter']),
  });
