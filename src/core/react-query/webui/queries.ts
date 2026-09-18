import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import { axios } from '@/core/axios';
import queryClient from '@/core/react-query/queryClient';

import type {
  GroupViewRequestType,
  SeriesFileSummaryRequestType,
  UpdateCheckRequestType,
} from '@/core/react-query/webui/types';
import type { ComponentVersionType } from '@/core/types/api/init';
import type {
  WebuiGroupExtra,
  WebuiSeriesDetailsType,
  WebuiSeriesFileSummaryType,
  WebuiTheme,
} from '@/core/types/api/webui';

export const useGroupViewQuery = (params: GroupViewRequestType, enabled = true) => {
  const query = useQuery<WebuiGroupExtra[]>({
    queryKey: ['webui', 'group-view', params],
    queryFn: () => axios.post('WebUI/GroupView', params),
    enabled,
  });

  useEffect(() => {
    if (!query.data) return;
    queryClient.setQueryData(
      ['webui', 'group-view', 'all'],
      (oldData: WebuiGroupExtra[] | undefined) => [...(oldData ?? []), ...query.data],
    );
  }, [query.data]);

  const groupViewQuery = useQuery<WebuiGroupExtra[]>({
    queryKey: ['webui', 'group-view', 'all'],
    queryFn: () => [],
    initialData: [],
    staleTime: Infinity,
  });

  return {
    data: groupViewQuery.data,
    isSuccess: query.isSuccess,
    isPending: query.isPending,
    isFetching: query.isFetching,
  };
};

export const useSeriesFileSummaryQuery = (seriesId: number, params: SeriesFileSummaryRequestType, enabled = true) =>
  useQuery<WebuiSeriesFileSummaryType>({
    queryKey: ['webui', 'series-file-summary', seriesId, params],
    queryFn: () => axios.get(`WebUI/Series/${seriesId}/FileSummary`, { params }),
    enabled,
  });

export const useSeriesOverviewQuery = (seriesId: number, enabled = true) =>
  useQuery<WebuiSeriesDetailsType>({
    queryKey: ['webui', 'series-overview', seriesId],
    queryFn: () => axios.get(`WebUI/Series/${seriesId}`),
    enabled,
  });

export const useWebuiThemesQuery = () =>
  useQuery<WebuiTheme[]>({
    queryKey: ['webui', 'themes'],
    queryFn: () => axios.get('WebUI/Theme', { params: { forceRefresh: true } }),
  });

export const useWebuiUpdateCheckQuery = (params: UpdateCheckRequestType, enabled = true) =>
  // oxlint-disable-next-line @tanstack/query/exhaustive-deps -- the key must match for force: true/false so a forced check from settings reflects in TopNav
  useQuery<ComponentVersionType>({
    queryKey: ['webui', 'update-check', params.channel],
    queryFn: () => axios.get('WebUI/LatestVersion', { params }),
    enabled,
    staleTime: 3600,
  });

export const useServerUpdateCheckQuery = (params: UpdateCheckRequestType, enabled = true) =>
  // oxlint-disable-next-line @tanstack/query/exhaustive-deps -- same as useWebuiUpdateCheckQuery: the key must stay identical across forced checks
  useQuery<ComponentVersionType>({
    queryKey: ['server', 'update-check', params.channel],
    queryFn: () => axios.get('WebUI/LatestServerVersion', { params }),
    enabled,
    staleTime: 3600,
  });
