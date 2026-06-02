import { useMutation } from '@tanstack/react-query';

import { axios } from '@/core/axios';
import { invalidateQueries } from '@/core/react-query/queryClient';

import type { DeletePluginRequestType, UpdatePluginRequestType } from '@/core/react-query/plugin/types';

const invalidatePluginQueries = () => {
  invalidateQueries(['plugin']);
  invalidateQueries(['plugin-package', 'list']);
};

export const useUpdatePluginMutation = () =>
  useMutation({
    mutationFn: ({ IsEnabled, pluginId, pluginVersion }: UpdatePluginRequestType) =>
      axios.put(pluginVersion ? `Plugin/${pluginId}/${pluginVersion}` : `Plugin/${pluginId}`, { IsEnabled }),
    onSuccess: invalidatePluginQueries,
  });

export const useDeletePluginMutation = () =>
  useMutation({
    mutationFn: ({ pluginId, pluginVersion, purgeConfiguration = false }: DeletePluginRequestType) =>
      axios.delete(pluginVersion ? `Plugin/${pluginId}/${pluginVersion}` : `Plugin/${pluginId}`, {
        params: { purgeConfiguration },
      }),
    onSuccess: invalidatePluginQueries,
  });

export const useDeleteAllPluginVersionsMutation = () =>
  useMutation({
    mutationFn: ({ pluginId, purgeConfiguration = false }: DeletePluginRequestType) =>
      axios.delete(`Plugin/${pluginId}/All`, { params: { purgeConfiguration } }),
    onSuccess: invalidatePluginQueries,
  });
