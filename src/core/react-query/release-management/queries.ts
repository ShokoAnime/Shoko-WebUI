import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { axios } from '@/core/axios';

import type {
  MultipleReleasesSeriesRequestType,
  ReleaseManagementItemType,
  ReleaseManagementSeriesEpisodesType,
  ReleaseManagementSeriesRequestType,
} from '@/core/react-query/release-management/types';
import type { ListResultType } from '@/core/types/api';
import type { EpisodeType } from '@/core/types/api/episode';
import type { SeriesWithCandidatesType } from '@/core/types/api/release-management';
import type { ReleaseManagementSeriesType } from '@/core/types/api/series';

export const useReleaseManagementSeries = (
  type: ReleaseManagementItemType,
  params: ReleaseManagementSeriesRequestType,
) =>
  useInfiniteQuery<ListResultType<ReleaseManagementSeriesType>>({
    queryKey: ['release-management', 'series', type, params],
    queryFn: ({ pageParam }) =>
      axios.get(
        `ReleaseManagement/${type}/Series`,
        {
          params: {
            ...params,
            // It is supposed to infer the type from the initialPageParam property but it doesn't work
            page: pageParam as number,
          },
        },
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _, lastPageParam: number) => {
      if (!params.pageSize || lastPage.Total / params.pageSize <= lastPageParam) return undefined;
      return lastPageParam + 1;
    },
  });

export const useReleaseManagementSeriesEpisodes = (
  type: ReleaseManagementItemType,
  seriesId: number,
  params: ReleaseManagementSeriesEpisodesType,
  enabled = true,
) =>
  useInfiniteQuery<ListResultType<EpisodeType>>({
    queryKey: ['release-management', 'series', 'episodes', type, seriesId, params],
    queryFn: ({ pageParam }) =>
      axios.get(
        `ReleaseManagement/${type}/Series/${seriesId}/Episodes`,
        {
          params: {
            ...params,
            // It is supposed to infer the type from the initialPageParam property but it doesn't work
            page: pageParam as number,
          },
        },
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _, lastPageParam: number) => {
      if (!params.pageSize || lastPage.Total / params.pageSize <= lastPageParam) return undefined;
      return lastPageParam + 1;
    },
    enabled,
    staleTime: Infinity,
  });

export const useMultipleReleaseSeriesQuery = (params: MultipleReleasesSeriesRequestType) =>
  useInfiniteQuery<ListResultType<SeriesWithCandidatesType>>({
    queryKey: ['release-management', 'multiple-releases', 'series', params],
    queryFn: ({ pageParam }) =>
      axios.get(
        'ReleaseManagement/MultipleReleases/Series',
        {
          params: {
            ...params,
            page: pageParam as number,
          },
        },
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _, lastPageParam: number) => {
      if (!params.pageSize || lastPage.Total / params.pageSize <= lastPageParam) return undefined;
      return lastPageParam + 1;
    },
  });

export const useMultipleReleaseSeriesDetailQuery = (seriesId: number, includeVariations = false, enabled = true) =>
  useQuery<SeriesWithCandidatesType>({
    queryKey: ['release-management', 'multiple-releases', 'series', seriesId, includeVariations],
    queryFn: () =>
      axios.get(
        `ReleaseManagement/MultipleReleases/Series/${seriesId}`,
        { params: { includeVariations } },
      ),
    enabled: enabled && seriesId > 0,
    staleTime: Infinity,
  });
