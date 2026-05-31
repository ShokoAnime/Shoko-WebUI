import { useQuery } from '@tanstack/react-query';

import { axios } from '@/core/axios';

import type { PluginPageType } from '@/core/types/api/plugin';

export const usePluginPagesQuery = () =>
  useQuery<PluginPageType[]>({
    queryKey: ['plugin', 'pages'],
    queryFn: () => axios.get('Plugin/Pages'),
  });

export const usePluginPagesForPluginQuery = (pluginId: string, enabled = true) =>
  useQuery<PluginPageType[]>({
    queryKey: ['plugin', 'pages', pluginId],
    queryFn: () => axios.get(`Plugin/${pluginId}/Pages`),
    enabled,
  });
