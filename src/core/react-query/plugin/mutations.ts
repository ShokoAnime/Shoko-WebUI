import { useMutation } from '@tanstack/react-query';

import { axios } from '@/core/axios';
import { invalidatePluginAndPackageQueries } from '@/core/react-query/plugin-package/mutations';

import type { DeletePluginRequestType, UpdatePluginRequestType } from '@/core/react-query/plugin/types';

export const useUpdatePluginMutation = () =>
  useMutation({
    mutationFn: ({ isEnabled, pluginId, pluginVersion }: UpdatePluginRequestType) =>
      axios.put(pluginVersion ? `Plugin/${pluginId}/${pluginVersion}` : `Plugin/${pluginId}`, {
        IsEnabled: isEnabled,
      }),
    onSuccess: invalidatePluginAndPackageQueries,
  });

export const useDeletePluginMutation = () =>
  useMutation({
    mutationFn: ({ pluginId, pluginVersion, purgeConfiguration = false }: DeletePluginRequestType) =>
      axios.delete(pluginVersion ? `Plugin/${pluginId}/${pluginVersion}` : `Plugin/${pluginId}`, {
        params: { purgeConfiguration },
      }),
    onSuccess: invalidatePluginAndPackageQueries,
  });

export const useDeleteAllPluginVersionsMutation = () =>
  useMutation({
    mutationFn: ({ pluginId, purgeConfiguration = false }: DeletePluginRequestType) =>
      axios.delete(`Plugin/${pluginId}/All`, { params: { purgeConfiguration } }),
    onSuccess: invalidatePluginAndPackageQueries,
  });
