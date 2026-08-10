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

export const useUpdateFilterMutation = () =>
  useMutation({
    mutationFn: ({ filter, filterId }: { filter: CreateOrUpdateFilterType, filterId: number }) =>
      axios.put(`Filter/${filterId}`, filter),
    // Scoped to what actually changed - unlike invalidateQueries(['filter']) elsewhere in
    // this file, this must not also match ['filter', 'expression', 'all'], which is cached
    // with staleTime: Infinity specifically to avoid refetching the (large, rarely-changing)
    // expression catalog.
    onSuccess: (_data, { filterId }) => {
      invalidateQueries(['filter', 'all']);
      invalidateQueries(['filter', 'single', filterId]);
    },
  });
