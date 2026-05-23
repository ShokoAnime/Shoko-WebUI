import { useQuery } from '@tanstack/react-query';

import { axios } from '@/core/axios';

import type { PluginListFilters } from '@/core/react-query/plugin/types';
import type { PluginInfoType } from '@/core/types/api/plugin';

export const usePluginsQuery = (filters: PluginListFilters = {}) =>
  useQuery<PluginInfoType[]>({
    queryKey: ['plugin', 'list', filters],
    queryFn: () => axios.get('Plugin', { params: filters }),
    placeholderData: previousData => previousData,
  });

export const usePluginVersionsQuery = (pluginId: string | undefined) =>
  useQuery<PluginInfoType[]>({
    queryKey: ['plugin', 'versions', pluginId],
    queryFn: () => axios.get(`Plugin/${pluginId}/All`),
    enabled: !!pluginId,
  });
