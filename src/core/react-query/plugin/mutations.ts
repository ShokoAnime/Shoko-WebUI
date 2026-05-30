import { useMutation } from '@tanstack/react-query';

import { axios } from '@/core/axios';
import { invalidateQueries } from '@/core/react-query/queryClient';

import type { DeletePluginMutationArgs, UpdatePluginMutationArgs } from '@/core/react-query/plugin/types';

const invalidatePluginQueries = () => {
  invalidateQueries(['plugin']);
  invalidateQueries(['plugin-package', 'list']);
};

export const useUpdatePluginMutation = () =>
  useMutation({
    mutationFn: ({ isEnabled, pluginId, pluginVersion }: UpdatePluginMutationArgs) =>
      axios.put(pluginVersion ? `Plugin/${pluginId}/${pluginVersion}` : `Plugin/${pluginId}`, { isEnabled }),
    onSuccess: invalidatePluginQueries,
  });

export const useDeletePluginMutation = () =>
  useMutation({
    mutationFn: ({ pluginId, pluginVersion, purgeConfiguration = true }: DeletePluginMutationArgs) =>
      axios.delete(pluginVersion ? `Plugin/${pluginId}/${pluginVersion}` : `Plugin/${pluginId}`, {
        params: { purgeConfiguration },
      }),
    onSuccess: invalidatePluginQueries,
  });

export const useDeleteAllPluginVersionsMutation = () =>
  useMutation({
    mutationFn: ({ pluginId, purgeConfiguration = true }: DeletePluginMutationArgs) =>
      axios.delete(`Plugin/${pluginId}/All`, { params: { purgeConfiguration } }),
    onSuccess: invalidatePluginQueries,
  });
