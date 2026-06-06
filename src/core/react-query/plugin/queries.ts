import { useQuery } from '@tanstack/react-query';

import { axios } from '@/core/axios';
import { STALE_TIME } from '@/core/util';

import type { PluginListFilterType } from '@/core/react-query/plugin/types';
import type { PluginInfoType, PluginPageType, SharedPluginPageType } from '@/core/types/api/plugin';

export const usePluginsQuery = (filters: PluginListFilterType, enabled = true) =>
  useQuery<PluginInfoType[]>({
    queryKey: ['plugin', 'list', filters],
    queryFn: () => axios.get('Plugin', { params: filters }),
    enabled,
  });

export const usePluginPagesQuery = () =>
  useQuery<SharedPluginPageType[]>({
    queryKey: ['plugin', 'pages'],
    queryFn: () => axios.get('Plugin/Pages'),
    staleTime: STALE_TIME,
  });

export const usePluginPagesForPluginQuery = (pluginId: string, enabled = true) =>
  useQuery<PluginPageType[]>({
    queryKey: ['plugin', 'pages', pluginId],
    queryFn: () => axios.get(`Plugin/${pluginId}/Pages`),
    staleTime: STALE_TIME,
    enabled,
  });
