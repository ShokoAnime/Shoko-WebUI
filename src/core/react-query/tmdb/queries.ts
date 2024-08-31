import { useEffect } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { toNumber } from 'lodash';

import { axios } from '@/core/axios';
import queryClient from '@/core/react-query/queryClient';

import type {
  TmdbBulkRequestType,
  TmdbEpisodeXRefRequestType,
  TmdbSearchRequestType,
} from '@/core/react-query/tmdb/types';
import type { ListResultType, PaginationType } from '@/core/types/api';
import type {
  TmdbAutoSearchResultType,
  TmdbBaseItemType,
  TmdbEpisodeType,
  TmdbEpisodeXRefType,
  TmdbMovieType,
  TmdbMovieXRefType,
  TmdbSearchResultType,
} from '@/core/types/api/tmdb';

export const useTmdbEpisodeXRefsInfiniteQuery = (
  seriesId: number,
  isNewLink: boolean,
  params: TmdbEpisodeXRefRequestType,
  enabled = true,
) =>
  useInfiniteQuery<ListResultType<TmdbEpisodeXRefType>>({
    queryKey: ['series', seriesId, 'tmdb', 'cross-references', 'episode', isNewLink, params],
    queryFn: ({ pageParam }) =>
      axios.get(
        `Series/${seriesId}/TMDB/Show/CrossReferences/Episode${isNewLink ? '/Auto' : ''}`,
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

export const useTmdbShowOrMovieQuery = (tmdbId: number, type: 'Show' | 'Movie', enabled = true) =>
  useQuery<TmdbBaseItemType>({
    queryKey: ['series', 'tmdb', 'show', tmdbId, type],
    queryFn: () => axios.get(`Tmdb/${type}/${tmdbId}`),
    enabled,
  });

export const useTmdbSearchQuery = (
  type: 'Show' | 'Movie',
  query: string,
  params: TmdbSearchRequestType,
) =>
  useQuery<TmdbSearchResultType[]>({
    queryKey: ['series', 'tmdb', 'search', type, query, params],
    queryFn: async () => {
      const finalData: TmdbSearchResultType[] = [];

      if (toNumber(query) !== 0) {
        try {
          const idLookupData: TmdbSearchResultType = await axios.get(`Tmdb/${type}/Online/${query}`);
          finalData.push(idLookupData);
        } catch (e) {
          // Ignore, show/movie not found on TMDB with provided ID
        }
      }

      const searchData: ListResultType<TmdbSearchResultType> = await axios.get(`Tmdb/${type}/Online/Search`, {
        params: { ...params, query },
      });
      finalData.push(...searchData.List);

      return finalData;
    },
    enabled: query.length > 0,
  });

export const useTmdbAutoSearchQuery = (seriesId: number, enabled = true) =>
  useQuery<TmdbAutoSearchResultType[]>({
    queryKey: ['series', seriesId, 'tmdb', 'auto-search'],
    queryFn: () => axios.get(`Series/${seriesId}/TMDB/Action/AutoSearch`),
    enabled,
  });

export const useTmdbBulkEpisodesQuery = (data: TmdbBulkRequestType, enabled = true) => {
  const query = useQuery<TmdbEpisodeType[]>({
    queryKey: ['series', 'tmdb', 'episode', 'bulk', data],
    queryFn: () => axios.post('Tmdb/Episode/Bulk', data),
    enabled: enabled && data.IDs.length > 0,
  });

  useEffect(() => {
    if (!query.data) return;
    queryClient.setQueryData(
      ['series', 'tmdb', 'episode', 'bulk', 'all'],
      (oldData: TmdbEpisodeType[]) => [...oldData, ...query.data],
    );
  }, [query.data]);

  const bulkEpisodesQuery = useQuery<TmdbEpisodeType[]>({
    queryKey: ['series', 'tmdb', 'episode', 'bulk', 'all'],
    queryFn: () => [],
    initialData: [],
    staleTime: Infinity,
  });

  return {
    ...bulkEpisodesQuery,
    isSuccess: query.isSuccess,
    isPending: query.isPending,
    isFetching: query.isFetching,
  };
};

export const useTmdbBulkMoviesQuery = (data: TmdbBulkRequestType, enabled = true) =>
  useQuery<TmdbMovieType[]>({
    queryKey: ['series', 'tmdb', 'movie', 'bulk', data],
    queryFn: () => axios.post('Tmdb/Movie/Bulk', data),
    enabled: enabled && data.IDs.length > 0,
  });
