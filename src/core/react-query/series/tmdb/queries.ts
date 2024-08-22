import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { axios } from '@/core/axios';

import type { TmdbEpisodeXRefRequestType } from '@/core/react-query/series/tmdb/types';
import type { ListResultType, PaginationType } from '@/core/types/api';
import type { TmdbBaseItemType, TmdbEpisodeType, TmdbEpisodeXRefType, TmdbMovieXRefType } from '@/core/types/api/tmdb';

export const useTmdbEpisodeXRefsInfiniteQuery = (
  seriesId: number,
  params: TmdbEpisodeXRefRequestType,
  enabled = true,
) =>
  useInfiniteQuery<ListResultType<TmdbEpisodeXRefType>>({
    queryKey: ['series', seriesId, 'tmdb', 'cross-references', 'episode', params],
    queryFn: ({ pageParam }) =>
      axios.get(
        `Series/${seriesId}/TMDB/Show/CrossReferences/Episode`,
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

export const useTmdbMovieXrefsQuery = (seriesId: number, enabled = true) =>
  useQuery<TmdbMovieXRefType[]>({
    queryKey: ['series', seriesId, 'tmdb', 'cross-references', 'movie'],
    queryFn: () => axios.get(`Series/${seriesId}/TMDB/Movie/CrossReferences`),
    enabled,
  });

export const useTmdbShowEpisodesQuery = (showId: number, params: PaginationType, enabled = true) =>
  useInfiniteQuery<ListResultType<TmdbEpisodeType>>({
    queryKey: ['series', 'tmdb', 'episodes', showId, params],
    queryFn: ({ pageParam }) =>
      axios.get(
        `Tmdb/Show/${showId}/Episode`,
        { params: { ...params, page: pageParam as number } },
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _, lastPageParam: number) => {
      if (!params.pageSize || lastPage.Total / params.pageSize <= lastPageParam) return undefined;
      return lastPageParam + 1;
    },
    enabled,
  });

export const useTmdbShowOrMovieQuery = (tmdbId: number, type: 'tv' | 'movie', enabled = true) =>
  useQuery<TmdbBaseItemType>({
    queryKey: ['series', 'tmdb', 'show', type, tmdbId],
    queryFn: () => axios.get(`Tmdb/${type === 'tv' ? 'Show' : 'Movie'}/${tmdbId}`),
    enabled,
  });
