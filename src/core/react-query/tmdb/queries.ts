import { useEffect } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { toNumber } from 'lodash';

import { axios } from '@/core/axios';
import { transformListResultSimplified } from '@/core/react-query/helpers';
import queryClient from '@/core/react-query/queryClient';

import type {
  TmdbBulkRequestType,
  TmdbSearchRequestType,
  TmdbShowEpisodesRequestType,
  TmdbShowOrderingInformationType,
} from '@/core/react-query/tmdb/types';
import type { ListResultType } from '@/core/types/api';
import type {
  TmdbAutoSearchResultType,
  TmdbBaseItemType,
  TmdbEpisodeType,
  TmdbEpisodeXrefType,
  TmdbMovieType,
  TmdbMovieXrefType,
  TmdbSearchResultType,
} from '@/core/types/api/tmdb';

export const useTmdbEpisodeXrefsQuery = (
  seriesId: number,
  isNewLink: boolean,
  tmdbShowID: number,
  enabled = true,
) =>
  useQuery<ListResultType<TmdbEpisodeXrefType>, unknown, TmdbEpisodeXrefType[]>({
    queryKey: ['series', seriesId, 'tmdb', 'cross-references', 'episode', isNewLink, tmdbShowID],
    queryFn: () =>
      axios.get(
        `Series/${seriesId}/TMDB/Show/CrossReferences/Episode${isNewLink ? '/Auto' : ''}`,
        { params: { pageSize: 0, tmdbShowID: isNewLink ? tmdbShowID : undefined } },
      ),
    select: transformListResultSimplified,
    enabled,
  });

export const useTmdbMovieXrefsQuery = (seriesId: number, enabled = true) =>
  useQuery<TmdbMovieXrefType[]>({
    queryKey: ['series', seriesId, 'tmdb', 'cross-references', 'movie'],
    queryFn: () => axios.get(`Series/${seriesId}/TMDB/Movie/CrossReferences`),
    enabled,
  });

export const useTmdbShowEpisodesQuery = (showId: number, params: TmdbShowEpisodesRequestType, enabled = true) =>
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
    staleTime: Infinity,
  });

export const useTmdbShowOrMovieQuery = (tmdbId: number, type: 'Show' | 'Movie', enabled = true) =>
  useQuery<TmdbBaseItemType>({
    queryKey: ['series', 'tmdb', type, tmdbId],
    queryFn: () => axios.get(type === 'Movie' ? `Tmdb/Movie/Online/${tmdbId}` : `Tmdb/Show/${tmdbId}`),
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
        } catch (error) {
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

export const useTmdbBulkMoviesOnlineQuery = (data: TmdbBulkRequestType, enabled = true) =>
  useQuery<TmdbMovieType[]>({
    queryKey: ['series', 'tmdb', 'movie', 'bulk', data],
    queryFn: () => axios.post('Tmdb/Movie/Online/Bulk', data),
    enabled: enabled && data.IDs.length > 0,
  });

export const useTmdbShowOrderingQuery = (showId: number, enabled = true) =>
  useQuery<TmdbShowOrderingInformationType[]>({
    queryKey: ['series', 'tmdb', 'show', showId, 'ordering'],
    queryFn: () => (showId > 0 ? axios.get(`TMDB/Show/${showId}/Ordering`) : Promise.resolve([])),
    initialData: () => [],
    enabled,
  });
