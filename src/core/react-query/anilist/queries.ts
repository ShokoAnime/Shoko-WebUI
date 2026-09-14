import { useInfiniteQuery, useQueries, useQuery } from '@tanstack/react-query';
import { toNumber } from 'lodash';

import { axios } from '@/core/axios';
import { getAnilistUnavailableState, retryUnlessAnilistUnavailable } from '@/core/react-query/anilist/helpers';
import { transformListResultSimplified } from '@/core/react-query/helpers';

import type {
  AnilistAnimeEpisodesRequestType,
  AnilistAnimeListRequestType,
  AnilistAnimeRequestType,
  AnilistAutoXrefsPreviewRequestType,
  AnilistEpisodeIncludeValues,
  AnilistSearchRequestType,
} from '@/core/react-query/anilist/types';
import type { ListResultType } from '@/core/types/api';
import type {
  AnilistAnimeType,
  AnilistAnimeXrefType,
  AnilistAutoSearchResultType,
  AnilistEpisodeType,
  AnilistEpisodeXrefType,
  AnilistSearchResultType,
} from '@/core/types/api/anilist';
import type { AniDBSeriesType, SeriesCast, SeriesType } from '@/core/types/api/series';

export const useAnilistAutoSearchQuery = (seriesId: number, enabled = true) =>
  useQuery<AnilistAutoSearchResultType[]>({
    queryKey: ['series', seriesId, 'anilist', 'auto-search'],
    queryFn: () => axios.get(`Series/${seriesId}/Anilist/Action/AutoSearch`),
    retry: retryUnlessAnilistUnavailable,
    enabled,
  });

export const useSeriesAnilistAnimeQuery = (seriesId: number, params: AnilistAnimeRequestType = {}, enabled = true) =>
  useQuery<AnilistAnimeType[]>({
    queryKey: ['series', seriesId, 'anilist', 'anime', params],
    queryFn: () => axios.get(`Series/${seriesId}/Anilist/Anime`, { params }),
    enabled,
  });

export const useAnilistAnimeXrefsQuery = (seriesId: number, enabled = true) =>
  useQuery<AnilistAnimeXrefType[]>({
    queryKey: ['series', seriesId, 'anilist', 'cross-references', 'anime'],
    queryFn: () => axios.get(`Series/${seriesId}/Anilist/Anime/CrossReferences`),
    enabled,
  });

export const useAnilistEpisodeXrefsQuery = (
  seriesId: number,
  isNewLink: boolean,
  anilistAnimeID: number,
  enabled = true,
) =>
  useQuery<ListResultType<AnilistEpisodeXrefType>, unknown, AnilistEpisodeXrefType[]>({
    queryKey: ['series', seriesId, 'anilist', 'cross-references', 'episode', isNewLink, anilistAnimeID],
    queryFn: () =>
      axios.get(
        `Series/${seriesId}/Anilist/Anime/CrossReferences/Episode${isNewLink ? '/Auto' : ''}`,
        { params: { pageSize: 0, anilistAnimeID: isNewLink ? anilistAnimeID : undefined } },
      ),
    select: transformListResultSimplified,
    enabled,
  });

export const useAnilistAutoEpisodeXrefsPreviewQuery = (
  seriesId: number,
  params: AnilistAutoXrefsPreviewRequestType,
  enabled = true,
) =>
  useQuery<ListResultType<AnilistEpisodeXrefType>, unknown, AnilistEpisodeXrefType[]>({
    queryKey: ['series', seriesId, 'anilist', 'cross-references', 'episode', 'auto-preview', params],
    queryFn: () =>
      axios.get(
        `Series/${seriesId}/Anilist/Anime/CrossReferences/Episode/Auto`,
        { params: { pageSize: 0, ...params } },
      ),
    select: transformListResultSimplified,
    enabled,
  });

export const useEpisodeAnilistEpisodesQuery = (
  episodeId: number,
  include: AnilistEpisodeIncludeValues[] = [],
  enabled = true,
) =>
  useQuery<AnilistEpisodeType[]>({
    queryKey: ['episode', episodeId, 'anilist', 'episode', include],
    queryFn: () => axios.get(`Episode/${episodeId}/Anilist/Episode`, { params: { include } }),
    enabled,
  });

export const useEpisodeAnilistEpisodeXrefsQuery = (episodeId: number, enabled = true) =>
  useQuery<AnilistEpisodeXrefType[]>({
    queryKey: ['episode', episodeId, 'anilist', 'cross-references'],
    queryFn: () => axios.get(`Episode/${episodeId}/Anilist/Episode/CrossReferences`),
    enabled,
  });

export const useAnilistAnimeListQuery = (params: AnilistAnimeListRequestType, enabled = true) =>
  useInfiniteQuery<ListResultType<AnilistAnimeType>>({
    queryKey: ['series', 'anilist', 'anime', 'list', params],
    queryFn: ({ pageParam }) => axios.get('Anilist/Anime', { params: { ...params, page: pageParam as number } }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _, lastPageParam: number) => {
      if (!params.pageSize || lastPage.Total / params.pageSize <= lastPageParam) return undefined;
      return lastPageParam + 1;
    },
    enabled,
  });

export const useAnilistAnimeQuery = (anilistId: number, params: AnilistAnimeRequestType = {}, enabled = true) =>
  useQuery<AnilistAnimeType>({
    queryKey: ['series', 'anilist', 'anime', anilistId, params],
    queryFn: () => axios.get(`Anilist/Anime/${anilistId}`, { params }),
    enabled,
  });

export const useAnilistAnimeOnlineQuery = (anilistId: number, enabled = true) =>
  useQuery<AnilistSearchResultType>({
    queryKey: ['series', 'anilist', 'anime', 'online', anilistId],
    queryFn: () => axios.get(`Anilist/Anime/Online/${anilistId}`),
    retry: retryUnlessAnilistUnavailable,
    enabled,
  });

export const useAnilistAnimeXrefsByAnimeQuery = (anilistId: number, enabled = true) =>
  useQuery<AnilistAnimeXrefType[]>({
    queryKey: ['series', 'anilist', 'anime', anilistId, 'cross-references'],
    queryFn: () => axios.get(`Anilist/Anime/${anilistId}/CrossReferences`),
    enabled,
  });

export const useAnilistAnimeEpisodesQuery = (
  anilistId: number,
  params: AnilistAnimeEpisodesRequestType,
  enabled = true,
) =>
  useInfiniteQuery<ListResultType<AnilistEpisodeType>>({
    queryKey: ['series', 'anilist', 'episodes', anilistId, params],
    queryFn: ({ pageParam }) =>
      axios.get(
        `Anilist/Anime/${anilistId}/Episode`,
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

export const useAnilistAnimeAllEpisodesQuery = (anilistId: number, enabled = true) =>
  useQuery<ListResultType<AnilistEpisodeType>, unknown, AnilistEpisodeType[]>({
    queryKey: ['series', 'anilist', 'episodes', anilistId, 'all'],
    queryFn: () => axios.get(`Anilist/Anime/${anilistId}/Episode`, { params: { pageSize: 0 } }),
    select: transformListResultSimplified,
    enabled,
    staleTime: Infinity,
  });

export const useAnilistAnimeAnidbAnimeQuery = (anilistId: number, enabled = true) =>
  useQuery<AniDBSeriesType[]>({
    queryKey: ['series', 'anilist', 'anime', anilistId, 'anidb'],
    queryFn: () => axios.get(`Anilist/Anime/${anilistId}/AniDB/Anime`),
    enabled,
  });

export const useAnilistAnimeShokoSeriesQuery = (anilistId: number, enabled = true) =>
  useQuery<SeriesType[]>({
    queryKey: ['series', 'anilist', 'anime', anilistId, 'shoko'],
    queryFn: () => axios.get(`Anilist/Anime/${anilistId}/Shoko/Series`),
    enabled,
  });

export const useAnilistSearchQuery = (query: string, params: AnilistSearchRequestType) =>
  useQuery<AnilistSearchResultType[]>({
    queryKey: ['series', 'anilist', 'search', query, params],
    queryFn: async () => {
      const finalData: AnilistSearchResultType[] = [];

      if (toNumber(query) !== 0) {
        try {
          const idLookupData: AnilistSearchResultType = await axios.get(`Anilist/Anime/Online/${query}`);
          finalData.push(idLookupData);
        } catch (error) {
          // Surface upstream outages, otherwise ignore, anime not found on AniList with provided ID
          if (getAnilistUnavailableState(error)) throw error;
        }
      }

      const searchData: ListResultType<AnilistSearchResultType> = await axios.get('Anilist/Anime/Online/Search', {
        params: { ...params, query },
      });
      finalData.push(...searchData.List.filter(result => result.ID !== finalData[0]?.ID));

      return finalData;
    },
    retry: retryUnlessAnilistUnavailable,
    enabled: query.length > 0,
  });

const anilistAnimeCastQueryOptions = (anilistId: number, enabled: boolean) => ({
  queryKey: ['series', 'anilist', 'anime', anilistId, 'cast'],
  queryFn: (): Promise<SeriesCast[]> => axios.get(`Anilist/Anime/${anilistId}/Cast`),
  enabled,
});

const anilistAnimeCrewQueryOptions = (anilistId: number, enabled: boolean) => ({
  queryKey: ['series', 'anilist', 'anime', anilistId, 'crew'],
  queryFn: (): Promise<SeriesCast[]> => axios.get(`Anilist/Anime/${anilistId}/Crew`),
  enabled,
});

export const useAnilistAnimeCastQuery = (anilistId: number, enabled = true) =>
  useQuery(anilistAnimeCastQueryOptions(anilistId, enabled));

export const useAnilistAnimeCrewQuery = (anilistId: number, enabled = true) =>
  useQuery(anilistAnimeCrewQueryOptions(anilistId, enabled));

/**
 * Fetches the cast and crew for every given AniList anime and concatenates
 * them into a single list.
 */
export const useAnilistAnimeCreditsQueries = (anilistIds: number[], enabled = true) =>
  useQueries({
    queries: anilistIds.flatMap(anilistId => [
      anilistAnimeCastQueryOptions(anilistId, enabled),
      anilistAnimeCrewQueryOptions(anilistId, enabled),
    ]),
    combine: results => ({
      data: results.flatMap(result => result.data ?? []),
      isPending: results.some(result => result.isPending),
      isFetching: results.some(result => result.isFetching),
    }),
  });
