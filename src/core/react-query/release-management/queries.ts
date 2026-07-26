import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { axios } from '@/core/axios';

import type {
  ReleaseDeletionPreviewRequestType,
  ReleaseManagementSeriesRequestType,
  ReleaseMixMatchDeletionPreviewRequestType,
} from '@/core/react-query/release-management/types';
import type { ListResultType } from '@/core/types/api';
import type { ReleaseDeletionPreviewType, SeriesWithCandidatesType } from '@/core/types/api/release-management';

export const useReleaseManagementSeriesQuery = (params: ReleaseManagementSeriesRequestType) =>
  useInfiniteQuery<ListResultType<SeriesWithCandidatesType>>({
    queryKey: ['release-management', 'series', params],
    queryFn: ({ pageParam }) =>
      axios.get(
        'ReleaseManagement/Series',
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

export const useReleaseManagementSeriesDetailQuery = (seriesId: number, includeVariations = false, enabled = true) =>
  useQuery<SeriesWithCandidatesType>({
    queryKey: ['release-management', 'series', seriesId, includeVariations],
    queryFn: () =>
      axios.get(
        `ReleaseManagement/Series/${seriesId}`,
        { params: { includeVariations } },
      ),
    enabled: enabled && seriesId > 0,
    staleTime: Infinity,
  });

export const useReleaseDeletionPreviewQuery = (
  body: ReleaseDeletionPreviewRequestType,
  onlyFinishedSeries?: boolean,
  includeVariations?: boolean,
  enabled = true,
) =>
  useQuery<ReleaseDeletionPreviewType[]>({
    queryKey: ['release-management', 'preview', body, onlyFinishedSeries, includeVariations],
    queryFn: () =>
      axios.post('ReleaseManagement/Preview', body, {
        params: { includeVariations, onlyFinishedSeries },
      }),
    enabled,
  });

export const useReleaseMixMatchDeletionPreviewQuery = (
  seriesId: number,
  body: ReleaseMixMatchDeletionPreviewRequestType,
  enabled = true,
) =>
  useQuery<ReleaseDeletionPreviewType>({
    queryKey: ['release-management', 'preview', 'mix-match', seriesId, body],
    queryFn: () => axios.post(`ReleaseManagement/Series/${seriesId}/Override`, body),
    enabled,
  });
