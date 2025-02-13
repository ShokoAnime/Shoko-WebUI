import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { axios } from '@/core/axios';
import { transformListResultSimplified } from '@/core/react-query/helpers';

import type {
  SeriesAniDBEpisodesRequestType,
  SeriesEpisodesInfiniteRequestType,
  SeriesNextUpRequestType,
  SeriesRequestType,
  SeriesTagsRequestType,
  SeriesWithLinkedFilesRequestType,
  SeriesWithoutFilesRequestType,
} from '@/core/react-query/series/types';
import type { DashboardRequestType, FileRequestType } from '@/core/react-query/types';
import type { ListResultType } from '@/core/types/api';
import type { CollectionGroupType } from '@/core/types/api/collection';
import type { ImagesType } from '@/core/types/api/common';
import type { AniDBEpisodeType, EpisodeType } from '@/core/types/api/episode';
import type { FileType } from '@/core/types/api/file';
import type {
  SeriesAniDBRelatedType,
  SeriesAniDBSearchResult,
  SeriesAniDBSimilarType,
  SeriesCast,
  SeriesRecommendedType,
  SeriesType,
} from '@/core/types/api/series';
import type { TagType } from '@/core/types/api/tags';

export const useSeriesQuery = (
  seriesId: number,
  params: SeriesRequestType,
  enabled = true,
) =>
  useQuery<SeriesType>({
    queryKey: ['series', seriesId, 'data', params],
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
  useQuery<ListResultType<AniDBEpisodeType>, unknown, AniDBEpisodeType[]>({
    queryKey: ['series', 'anidb', anidbId, 'episodes', params],
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
    queryKey: ['series', seriesId, 'cast'],
    queryFn: () => axios.get(`Series/${seriesId}/Cast`),
    enabled,
  });

export const useSeriesEpisodesInfiniteQuery = (
  seriesId: number,
  params: SeriesEpisodesInfiniteRequestType,
  enabled = true,
) =>
  useInfiniteQuery<ListResultType<EpisodeType>>({
    queryKey: ['series', seriesId, 'episodes', params],
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
    queryKey: ['series', seriesId, 'files', params],
    queryFn: () => axios.get(`Series/${seriesId}/File`, { params }),
    select: transformListResultSimplified,
    enabled,
  });

export const useSeriesGroupQuery = (seriesId: number, topLevel: boolean) =>
  useQuery<CollectionGroupType>({
    queryKey: ['series', seriesId, 'group', topLevel],
    queryFn: () => axios.get(`Series/${seriesId}/Group`, { params: { topLevel } }),
  });

export const useSeriesImagesQuery = (seriesId: number, enabled = true) =>
  useQuery<ImagesType>({
    queryKey: ['series', seriesId, 'images'],
    queryFn: () => axios.get(`Series/${seriesId}/Images`),
    enabled,
  });

export const useSeriesNextUpQuery = (seriesId: number, params: SeriesNextUpRequestType, enabled = true) =>
  useQuery<EpisodeType>({
    queryKey: ['series', seriesId, 'next-up', params],
    queryFn: () => axios.get(`Series/${seriesId}/NextUpEpisode`, { params }),
    enabled,
  });

export const useSeriesTagsQuery = (seriesId: number, params: SeriesTagsRequestType, enabled = true) =>
  useQuery<TagType[]>({
    queryKey: ['series', seriesId, 'tags', params],
    queryFn: () => axios.get(`Series/${seriesId}/Tags`, { params }),
    enabled,
  });

export const useSeriesUserTagsSetQuery = (seriesId: number, enabled = true) =>
  useQuery<TagType[], unknown, Set<number>>({
    queryKey: ['series', seriesId, 'tags', 'user'],
    queryFn: () => axios.get(`Series/${seriesId}/Tags/User`),
    select: data => new Set(data.map(tag => tag.ID)),
    enabled,
    initialData: [],
  });

export const useSeriesWithLinkedFilesInfiniteQuery = (params: SeriesWithLinkedFilesRequestType) =>
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

export const useSeriesWithoutFilesInfiniteQuery = (params: SeriesWithoutFilesRequestType) =>
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
    queryKey: ['series', 'recommended', params],
    queryFn: () => axios.get('Series/AniDB/RecommendedForYou', { params }),
    select: transformListResultSimplified,
  });

export const useRelatedAnimeQuery = (seriesId: number, enabled = true) =>
  useQuery<SeriesAniDBRelatedType[]>({
    queryKey: ['series', seriesId, 'related'],
    queryFn: () => axios.get(`Series/${seriesId}/AniDB/Related`),
    enabled,
  });

export const useSimilarAnimeQuery = (seriesId: number, enabled = true) =>
  useQuery<SeriesAniDBSimilarType[]>({
    queryKey: ['series', seriesId, 'similar'],
    queryFn: () => axios.get(`Series/${seriesId}/AniDB/Similar`),
    enabled,
  });
