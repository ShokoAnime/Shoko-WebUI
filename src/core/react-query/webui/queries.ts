import { useQuery } from '@tanstack/react-query';

import { axios } from '@/core/axios';

import type {
  GroupViewRequestType,
  SeriesFileSummaryRequestType,
  WebuiUpdateCheckRequestType,
} from '@/core/react-query/webui/types';
import type { ComponentVersionType } from '@/core/types/api/init';
import type {
  WebuiGroupExtra,
  WebuiSeriesDetailsType,
  WebuiSeriesFileSummaryType,
  WebuiTheme,
} from '@/core/types/api/webui';

export const useGroupViewQuery = (params: GroupViewRequestType, enabled = true) =>
  useQuery<WebuiGroupExtra[], unknown, WebuiGroupExtra[]>({
    queryKey: ['webui', 'group-view', params],
    queryFn: () => axios.post('WebUI/GroupView', params),
    enabled,
  });

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

export const useWebuiUpdateCheckQuery = (params: WebuiUpdateCheckRequestType, enabled = true) =>
  useQuery<ComponentVersionType>({
    queryKey: ['webui', 'update-check', params],
    queryFn: () => axios.get('WebUI/LatestVersion', { params }),
    enabled,
  });
