/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation } from '@tanstack/react-query';

import { axios } from '@/core/axios';
import { invalidateQueries } from '@/core/react-query/queryClient';

import type { ConfigurationActionResultType } from '@/core/react-query/configuration/types';

export const useSaveConfigurationMutation = (configId: string) =>
  useMutation({
    mutationKey: ['configuration', 'object', configId, 'object'],
    mutationFn: (config: any) => axios.put<any, ConfigurationActionResultType>(`/Configuration/${configId}`, config),
    onSuccess: data => data.Refresh && invalidateQueries(['configuration', 'object', configId]),
  });

export const usePerformConfigurationActionMutation = (configId: string) =>
  useMutation({
    mutationKey: ['configuration', configId, 'action'],
    mutationFn: (
      { actionName, actionType = 'Custom', config, path }: {
        config: any;
        path: string;
        actionName?: string;
        actionType?: 'Custom' | 'Changed';
      },
    ) => (actionType === 'Custom'
      ? axios.post<any, ConfigurationActionResultType>(`/Configuration/${configId}/PerformAction`, config, {
        params: { path, actionName },
      })
      : axios.post<any, ConfigurationActionResultType>(`/Configuration/${configId}/LiveEdit`, config, {
        params: { path },
      })),
    onSuccess: data => data.Refresh && invalidateQueries(['configuration', 'object', configId]),
  });
