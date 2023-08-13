import { defaultSerializeQueryArgs } from '@reduxjs/toolkit/query';
import { omit } from 'lodash';

import { splitV3Api } from '@/core/rtkQuery/splitV3Api';

import type { InfiniteResultType, ListResultType, PaginationType } from '@/core/types/api';
import type { DataSourceType, ImageType } from '@/core/types/api/common';
import type { EpisodeAniDBType, EpisodeType } from '@/core/types/api/episode';
import type { FileType } from '@/core/types/api/file';
import type {
  SeriesAniDBRelatedType,
  SeriesAniDBSearchResult,
  SeriesAniDBSimilarType,
  SeriesCast,
  SeriesDetailsType,
  SeriesRecommendedType,
  SeriesType,
} from '@/core/types/api/series';
import type { TagType } from '@/core/types/api/tags';

type SeriesImagesQueryResultType = {
  Posters: ImageType[];
  Banners: ImageType[];
  Fanarts: ImageType[];
};

export type SeriesEpisodesQueryType = {
  seriesID: number;
  includeMissing?: string;
  includeHidden?: string;
  includeDataFrom?: DataSourceType[];
  includeWatched?: string;
  type?: string;
  search?: string;
  fuzzy?: boolean;
} & PaginationType;

export type SeriesAniDBEpisodesQueryType = {
  anidbID: number;
  includeMissing?: string;
  includeHidden?: string;
  includeWatched?: string;
  type?: string;
  search?: string;
  fuzzy?: boolean;
} & PaginationType;

const seriesApi = splitV3Api.injectEndpoints({
  endpoints: build => ({
    // Delete a Series
    deleteSeries: build.mutation<void, { seriesId: number, deleteFiles: boolean }>({
      query: ({ seriesId, ...params }) => ({ url: `Series/${seriesId}`, method: 'DELETE', params }),
      invalidatesTags: ['SeriesUpdated'],
    }),

    // Get a paginated list of Shoko.Server.API.v3.Models.Shoko.Series without local files, available to the current Shoko.Server.API.v3.Models.Shoko.User.
    getSeriesWithoutFiles: build.query<ListResultType<SeriesType[]>, PaginationType>({
      query: params => ({ url: 'Series/WithoutFiles', params }),
      providesTags: ['SeriesUpdated'],
    }),

    // Search the title dump for the given query or directly using the anidb id.
    getSeriesAniDBSearch: build.query<Array<SeriesAniDBSearchResult>, { query: string } & PaginationType>({
      query: ({ query, ...params }) => ({ url: `Series/AniDB/Search/${encodeURIComponent(query)}`, params }),
      transformResponse: (response: any) => response.List,
      providesTags: ['SeriesSearch'],
    }),

    // Get the Shoko.Server.API.v3.Models.Shoko.Episodes for the Shoko.Server.API.v3.Models.Shoko.Series with seriesID.
    getSeriesEpisodes: build.query<ListResultType<EpisodeType[]>, SeriesEpisodesQueryType>({
      query: ({ seriesID, ...params }) => ({ url: `Series/${seriesID}/Episode`, params }),
      providesTags: ['SeriesEpisodes', 'UtilitiesRefresh'],
    }),

    getSeriesAniDBEpisodes: build.query<ListResultType<EpisodeAniDBType[]>, SeriesAniDBEpisodesQueryType>({
      query: ({ anidbID, ...params }) => ({ url: `Series/AniDB/${anidbID}/Episode`, params }),
      providesTags: ['SeriesEpisodes', 'UtilitiesRefresh'],
    }),

    // Get the Shoko.Server.API.v3.Models.Shoko.Episodes for the Shoko.Server.API.v3.Models.Shoko.Series with seriesID.
    getSeriesEpisodesInfinite: build.query<InfiniteResultType<EpisodeType[]>, SeriesEpisodesQueryType>({
      query: ({ seriesID, ...params }) => ({ url: `Series/${seriesID}/Episode`, params }),
      transformResponse: (response: ListResultType<EpisodeType[]>, _, args) => ({
        pages: {
          [args.page ?? 1]: response.List,
        },
        total: response.Total,
      }),
      // Only have one cache entry because the arg always maps to one string
      serializeQueryArgs: ({ endpointDefinition, endpointName, queryArgs }) =>
        defaultSerializeQueryArgs({
          endpointName,
          queryArgs: omit(queryArgs, ['page']),
          endpointDefinition,
        }),
      // Always merge incoming data to the cache entry
      merge: (currentCache, newItems) => ({
        pages: { ...currentCache.pages, ...newItems.pages },
        total: newItems.total,
      }),
      // Refetch when the page arg changes
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
      providesTags: ['SeriesEpisodes'],
    }),

    // Queue a refresh of the AniDB Info for series with AniDB ID
    refreshAnidbSeries: build.mutation<boolean, { anidbID: number, force?: boolean, createSeries?: boolean }>({
      query: ({ anidbID, createSeries = false, force = false }) => ({
        url: `Series/AniDB/${anidbID}/Refresh?force=${force}&createSeriesEntry=${createSeries}&immediate=true`,
        method: 'POST',
      }),
      invalidatesTags: ['SeriesAniDB', 'SeriesEpisodes', 'SeriesSearch'],
    }),

    // Get AniDB Info from the AniDB ID
    getSeriesAniDB: build.query<SeriesAniDBSearchResult, number>({
      query: anidbID => ({ url: `Series/AniDB/${anidbID}` }),
      providesTags: ['SeriesAniDB'],
    }),

    // Gets anidb recommendation for the user
    getAniDBRecommendedAnime: build.query<Array<SeriesRecommendedType>, PaginationType>({
      query: params => ({ url: 'Series/AniDB/RecommendedForYou', params: { ...params, showAll: true } }),
      transformResponse: (response: any) => response.List,
    }),

    getSeriesWithManuallyLinkedFiles: build.query<ListResultType<Array<SeriesType>>, PaginationType>({
      query: params => ({
        url: 'Series/WithManuallyLinkedFiles',
        params,
      }),
      providesTags: ['FileMatched', 'UtilitiesRefresh'],
    }),

    getSeriesFiles: build.query<
      Array<FileType>,
      { seriesId: number, isManuallyLinked: boolean, includeXRefs: boolean }
    >({
      query: ({ seriesId, ...params }) => ({
        url: `Series/${seriesId}/File`,
        params,
      }),
      providesTags: ['FileMatched', 'UtilitiesRefresh'],
    }),

    getSeries: build.query<SeriesDetailsType, { seriesId: string, includeDataFrom?: string[] }>({
      query: ({ seriesId, ...params }) => ({
        url: `Series/${seriesId}`,
        params,
      }),
    }),

    getSeriesTags: build.query<Array<TagType>, { seriesId: string, filter?: string, excludeDescriptions?: boolean }>({
      query: ({ seriesId, ...params }) => ({
        url: `Series/${seriesId}/Tags`,
        params,
      }),
    }),

    getAniDBRelated: build.query<Array<SeriesAniDBRelatedType>, { seriesId: string }>({
      query: ({ seriesId }) => ({
        url: `Series/${seriesId}/AniDB/Related`,
      }),
    }),

    getAniDBSimilar: build.query<Array<SeriesAniDBSimilarType>, { seriesId: string }>({
      query: ({ seriesId }) => ({
        url: `Series/${seriesId}/AniDB/Similar`,
      }),
    }),
    // Get the next Shoko.Server.API.v3.Models.Shoko.Episode for the Shoko.Server.API.v3.Models.Shoko.Series with seriesID.
    nextUpEpisode: build.query<EpisodeType, { seriesId: number }>({
      query: ({ seriesId }) => ({
        url: `Series/${seriesId}/NextUpEpisode?includeDataFrom=AniDB&includeDataFrom=TvDB&includeMissing=false`,
      }),
    }),

    getSeriesCast: build.query<SeriesCast[], { seriesId: string }>({
      query: ({ seriesId, ...params }) => ({
        url: `Series/${seriesId}/Cast`,
        params,
      }),
    }),

    getSeriesImages: build.query<SeriesImagesQueryResultType, { seriesId: string }>({
      query: ({ seriesId }) => ({
        url: `Series/${seriesId}/Images`,
      }),
    }),
  }),
});

export const {
  useDeleteSeriesMutation,
  useGetAniDBRecommendedAnimeQuery,
  useGetAniDBRelatedQuery,
  useGetAniDBSimilarQuery,
  useGetSeriesAniDBEpisodesQuery,
  useGetSeriesCastQuery,
  useGetSeriesImagesQuery,
  useGetSeriesQuery,
  useGetSeriesTagsQuery,
  useGetSeriesWithManuallyLinkedFilesQuery,
  useGetSeriesWithoutFilesQuery,
  useLazyGetSeriesAniDBQuery,
  useLazyGetSeriesAniDBSearchQuery,
  useLazyGetSeriesEpisodesInfiniteQuery,
  useLazyGetSeriesEpisodesQuery,
  useLazyGetSeriesFilesQuery,
  useNextUpEpisodeQuery,
  useRefreshAnidbSeriesMutation,
} = seriesApi;
