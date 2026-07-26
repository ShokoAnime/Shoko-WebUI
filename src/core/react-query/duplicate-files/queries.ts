import { useInfiniteQuery } from '@tanstack/react-query';

import { axios } from '@/core/axios';

import type {
  DuplicateFilesEpisodesRequestType,
  DuplicateFilesSeriesRequestType,
} from '@/core/react-query/duplicate-files/types';
import type { ListResultType } from '@/core/types/api';
import type { EpisodeType } from '@/core/types/api/episode';
import type { ReleaseManagementSeriesType } from '@/core/types/api/series';

export const useDuplicateFilesSeriesQuery = (params: DuplicateFilesSeriesRequestType, enabled = true) =>
  useInfiniteQuery<ListResultType<ReleaseManagementSeriesType>>({
    queryKey: ['duplicate-files', 'series', params],
    queryFn: ({ pageParam }) =>
      axios.get(
        'DuplicateFiles/Series',
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
    enabled,
  });

export const useDuplicateFilesQuery = (
  seriesId: number,
  params: DuplicateFilesEpisodesRequestType,
  enabled = true,
) =>
  useInfiniteQuery<ListResultType<EpisodeType>>({
    queryKey: ['duplicate-files', 'series', 'episodes', seriesId, params],
    queryFn: ({ pageParam }) =>
      axios.get(
        `DuplicateFiles/Series/${seriesId}/Episodes`,
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
    enabled,
    staleTime: Infinity,
  });
