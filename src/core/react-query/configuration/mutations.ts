/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation } from '@tanstack/react-query';

import { axios } from '@/core/axios';
import { invalidateQueries } from '@/core/react-query/queryClient';

import type { ConfigurationActionResultType } from '@/core/react-query/configuration/types';

export const useSaveConfigurationActionMutation = (configId: string) =>
  useMutation({
    mutationKey: ['configuration', configId, 'object'],
    mutationFn: (config: any) => axios.put<any, void>(`/Configuration/${configId}`, config),
    onSuccess: () => invalidateQueries(['configuration', configId]),
  });

export const usePerformConfigurationActionMutation = (configId: string) =>
  useMutation({
    mutationKey: ['configuration', configId, 'action'],
    mutationFn: ({ action, config, path }: { config: any, path: string, action: string }) =>
      axios.post<any, ConfigurationActionResultType>(`/Configuration/${configId}/PerformAction`, config, {
        params: { path, action },
      }),
    onSuccess: data => data.RefreshConfiguration && invalidateQueries(['configuration', configId]),
  });
