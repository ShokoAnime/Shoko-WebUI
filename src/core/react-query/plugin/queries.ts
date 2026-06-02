import { useQuery } from '@tanstack/react-query';

import { axios } from '@/core/axios';
import { STALE_TIME } from '@/core/util';

import type { PluginPageType, SharedPluginPageType } from '@/core/types/api/plugin';

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
