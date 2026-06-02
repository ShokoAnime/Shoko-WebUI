import { useQuery } from '@tanstack/react-query';

import { axios } from '@/core/axios';

import type { PluginPageType, SharedPluginPageType } from '@/core/types/api/plugin';

export const usePluginPagesQuery = () =>
  useQuery<PluginPageType[]>({
    queryKey: ['plugin', 'pages'],
    queryFn: () => axios.get('Plugin/Pages'),
    staleTime: 86400 * 100000,
  });

export const usePluginPagesForPluginQuery = (pluginId: string, enabled = true) =>
  useQuery<SharedPluginPageType[]>({
    queryKey: ['plugin', 'pages', pluginId],
    queryFn: () => axios.get(`Plugin/${pluginId}/Pages`),
    staleTime: 86400 * 100000,
    enabled,
  });
