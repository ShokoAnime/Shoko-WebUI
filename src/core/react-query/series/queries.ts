import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { axios } from '@/core/axios';
import { transformListResultSimplified } from '@/core/react-query/helpers';

import type {
  SeriesAniDBEpisodesRequestType,
  SeriesEpisodesInfiniteRequestType,
  SeriesNextUpRequestType,
  SeriesRequestType,
  SeriesTagsRequestType,
} from '@/core/react-query/series/types';
import type { DashboardRequestType, FileRequestType } from '@/core/react-query/types';
import type { ListResultType, PaginationType } from '@/core/types/api';
import type { CollectionGroupType } from '@/core/types/api/collection';
import type { EpisodeAniDBType, EpisodeType } from '@/core/types/api/episode';
import type { FileType } from '@/core/types/api/file';
import type {
  SeriesAniDBRelatedType,
  SeriesAniDBSearchResult,
  SeriesAniDBSimilarType,
  SeriesCast,
  SeriesDetailsType,
  SeriesImagesType,
  SeriesRecommendedType,
  SeriesType,
} from '@/core/types/api/series';
import type { TagType } from '@/core/types/api/tags';

export const useSeriesQuery = (
  seriesId: number,
  params: SeriesRequestType,
  enabled = true,
) =>
  useQuery<SeriesDetailsType>({
    queryKey: ['series', 'single', seriesId, params],
    queryFn: () => axios.get(`Series/${seriesId}`, { params }),
    enabled,
  });

export const useSeriesAniDBQuery = (anidbId: number, enabled = true) =>
  useQuery<SeriesAniDBSearchResult>({
    queryKey: ['series', 'anidb', anidbId],
    queryFn: () => axios.get(`Series/AniDB/${anidbId}`),
    enabled,
  });

export const useSeriesAniDBEpisodesQuery = (anidbId: number, params: SeriesAniDBEpisodesRequestType, enabled = true) =>
  useQuery<ListResultType<EpisodeAniDBType>, unknown, EpisodeAniDBType[]>({
    queryKey: ['series', 'episodes', 'anidb', anidbId, params],
    queryFn: () => axios.get(`Series/AniDB/${anidbId}/Episode`, { params }),
    select: transformListResultSimplified,
    enabled,
  });

export const useSeriesAniDBSearchQuery = (query: string, enabled = true) =>
  useQuery<ListResultType<SeriesAniDBSearchResult>, unknown, SeriesAniDBSearchResult[]>({
    queryKey: ['series', 'anidb-search', query],
    queryFn: () => axios.get(`Series/AniDB/Search/${encodeURIComponent(query)}`),
    select: transformListResultSimplified,
    enabled,
  });

export const useSeriesCastQuery = (seriesId: number, enabled = true) =>
  useQuery<SeriesCast[]>({
    queryKey: ['series', 'cast', seriesId],
    queryFn: () => axios.get(`Series/${seriesId}/Cast`),
    enabled,
  });

export const useSeriesEpisodesInfiniteQuery = (
  seriesId: number,
  params: SeriesEpisodesInfiniteRequestType,
  enabled = true,
) =>
  useInfiniteQuery<ListResultType<EpisodeType>>({
    queryKey: ['series', 'episodes', seriesId, params],
    queryFn: ({ pageParam }) =>
      axios.get(
        `Series/${seriesId}/Episode`,
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

// Unused: but keeping it as it might be used in the future for other utilities
export const useSeriesFilesQuery = (
  seriesId: number,
  params: FileRequestType,
  enabled = true,
) =>
  useQuery<ListResultType<FileType>, unknown, FileType[]>({
    queryKey: ['series', 'files', seriesId, params],
    queryFn: () => axios.get(`Series/${seriesId}/File`, { params }),
    select: transformListResultSimplified,
    enabled,
  });

export const useSeriesGroupQuery = (seriesId: number, topLevel: boolean) =>
  useQuery<CollectionGroupType>({
    queryKey: ['series', 'group', seriesId, topLevel],
    queryFn: () => axios.get(`Series/${seriesId}/Group`, { params: { topLevel } }),
  });

export const useSeriesImagesQuery = (seriesId: number, enabled = true) =>
  useQuery<SeriesImagesType>({
    queryKey: ['series', 'images', seriesId],
    queryFn: () => axios.get(`Series/${seriesId}/Images`),
    enabled,
  });

export const useSeriesNextUpQuery = (seriesId: number, params: SeriesNextUpRequestType, enabled = true) =>
  useQuery<EpisodeType>({
    queryKey: ['series', 'next-up', seriesId, params],
    queryFn: () => axios.get(`Series/${seriesId}/NextUpEpisode`),
    enabled,
  });

export const useSeriesTagsQuery = (seriesId: number, params: SeriesTagsRequestType, enabled = true) =>
  useQuery<TagType[]>({
    queryKey: ['series', 'tags', seriesId, params],
    queryFn: () => axios.get(`Series/${seriesId}/Tags`, { params }),
    enabled,
  });

export const useSeriesWithLinkedFilesInfiniteQuery = (params: PaginationType) =>
  useInfiniteQuery<ListResultType<SeriesType>>({
    queryKey: ['series', 'linked-files', params],
    queryFn: ({ pageParam }) =>
      axios.get(
        'Series/WithManuallyLinkedFiles',
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

export const useSeriesWithoutFilesInfiniteQuery = (params: PaginationType) =>
  useInfiniteQuery<ListResultType<SeriesType>>({
    queryKey: ['series', 'without-files', params],
    queryFn: ({ pageParam }) =>
      axios.get(
        'Series/WithoutFiles',
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

export const useRecommendedAnimeQuery = (params: DashboardRequestType) =>
  useQuery<ListResultType<SeriesRecommendedType>, unknown, SeriesRecommendedType[]>({
    queryKey: ['series', 'recommended-anime', params],
    queryFn: () => axios.get('Series/AniDB/RecommendedForYou', { params }),
    select: transformListResultSimplified,
  });

export const useRelatedAnimeQuery = (seriesId: number, enabled = true) =>
  useQuery<SeriesAniDBRelatedType[]>({
    queryKey: ['series', 'related', seriesId],
    queryFn: () => axios.get(`Series/${seriesId}/AniDB/Related`),
    enabled,
  });

export const useSimilarAnimeQuery = (seriesId: number, enabled = true) =>
  useQuery<SeriesAniDBSimilarType[]>({
    queryKey: ['series', 'similar', seriesId],
    queryFn: () => axios.get(`Series/${seriesId}/AniDB/Similar`),
    enabled,
  });
