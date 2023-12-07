import { defaultSerializeQueryArgs } from '@reduxjs/toolkit/query';
import { omit } from 'lodash';

import { splitV3Api } from '@/core/rtkQuery/splitV3Api';

import type { InfiniteResultType, ListResultType, PaginationType } from '@/core/types/api';
import type { CollectionGroupType } from '@/core/types/api/collection';
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
  SeriesTitleType,
  SeriesType,
} from '@/core/types/api/series';
import type { TagType } from '@/core/types/api/tags';

type SeriesImagesQueryResultType = {
  Posters: ImageType[];
  Banners: ImageType[];
  Fanarts: ImageType[];
};

type SeriesEpisodesQueryBaseType = {
  seriesID: number;
  includeMissing?: string;
  includeHidden?: string;
  includeWatched?: string;
  type?: string;
  search?: string;
  fuzzy?: boolean;
};

export type SeriesEpisodesQueryType =
  & SeriesEpisodesQueryBaseType
  & { includeDataFrom?: DataSourceType[] }
  & PaginationType;

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

    deleteSeriesTvdbLink: build.mutation<void, { seriesId: number, tvdbShowId: number }>({
      query: ({ seriesId, tvdbShowId }) => ({
        url: `Series/${seriesId}/TvDB`,
        method: 'DELETE',
        body: { ID: tvdbShowId },
      }),
      invalidatesTags: ['SeriesUpdated', 'SeriesAniDB', 'SeriesEpisodes'],
    }),

    // Get a paginated list of Shoko.Server.API.v3.Models.Shoko.Series without local files, available to the current Shoko.Server.API.v3.Models.Shoko.User.
    getSeriesWithoutFiles: build.query<ListResultType<SeriesType>, PaginationType>({
      query: params => ({ url: 'Series/WithoutFiles', params }),
      providesTags: ['SeriesUpdated'],
    }),

    // Search the title dump for the given query or directly using the anidb id.
    getSeriesAniDBSearch: build.query<SeriesAniDBSearchResult[], { query: string } & PaginationType>({
      query: ({ query, ...params }) => ({ url: `Series/AniDB/Search/${encodeURIComponent(query)}`, params }),
      transformResponse: (response: ListResultType<SeriesAniDBSearchResult>) => response.List,
      providesTags: ['SeriesSearch'],
    }),

    // Get the Shoko.Server.API.v3.Models.Shoko.Episodes for the Shoko.Server.API.v3.Models.Shoko.Series with seriesID.
    getSeriesEpisodes: build.query<ListResultType<EpisodeType>, SeriesEpisodesQueryType>({
      query: ({ seriesID, ...params }) => ({ url: `Series/${seriesID}/Episode`, params }),
      providesTags: ['SeriesEpisodes', 'UtilitiesRefresh'],
    }),

    // Set the watched state for all the episodes that fit the query.
    setSeriesEpisodesWatched: build.mutation<void, SeriesEpisodesQueryBaseType & { value: boolean }>({
      query: ({ seriesID, ...params }) => ({
        url: `Series/${seriesID}/Episode/Watched`,
        method: 'POST',
        params,
      }),
      invalidatesTags: ['EpisodeUpdated', 'SeriesEpisodes'],
    }),

    getSeriesAniDBEpisodes: build.query<ListResultType<EpisodeAniDBType>, SeriesAniDBEpisodesQueryType>({
      query: ({ anidbID, ...params }) => ({ url: `Series/AniDB/${anidbID}/Episode`, params }),
      providesTags: ['SeriesEpisodes', 'UtilitiesRefresh'],
    }),

    // Get the Shoko.Server.API.v3.Models.Shoko.Episodes for the Shoko.Server.API.v3.Models.Shoko.Series with seriesID.
    getSeriesEpisodesInfinite: build.query<InfiniteResultType<EpisodeType>, SeriesEpisodesQueryType>({
      query: ({ seriesID, ...params }) => ({ url: `Series/${seriesID}/Episode`, params }),
      transformResponse: (response: ListResultType<EpisodeType>, _, args) => ({
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

    // Queue a refresh of the AniDB Info for series with ID
    refreshSeriesAnidbInfo: build.mutation<boolean, { seriesId: number, force?: boolean, cacheOnly?: boolean }>({
      query: ({ cacheOnly = false, force = false, seriesId }) => ({
        url: `Series/${seriesId}/AniDB/Refresh?force=${force}&cacheOnly=${cacheOnly}`,
        method: 'POST',
      }),
      invalidatesTags: ['SeriesAniDB', 'SeriesEpisodes'],
    }),

    // Get AniDB Info from the AniDB ID
    getSeriesAniDB: build.query<SeriesAniDBSearchResult, number>({
      query: anidbID => ({ url: `Series/AniDB/${anidbID}` }),
      providesTags: ['SeriesAniDB'],
    }),

    getSeriesInfinite: build.query<InfiniteResultType<SeriesTitleType>, PaginationType & { startsWith?: string }>({
      query: ({ ...params }) => ({ url: 'Series', params: { ...params } }),
      transformResponse: (response: ListResultType<SeriesTitleType>, _, args) => ({
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
      providesTags: ['SeriesSearch'],
    }),

    // Gets anidb recommendation for the user
    getAniDBRecommendedAnime: build.query<SeriesRecommendedType[], PaginationType>({
      query: params => ({ url: 'Series/AniDB/RecommendedForYou', params: { ...params, showAll: true } }),
      transformResponse: (response: ListResultType<SeriesRecommendedType>) => response.List,
    }),

    getSeriesWithManuallyLinkedFiles: build.query<ListResultType<SeriesType>, PaginationType>({
      query: params => ({
        url: 'Series/WithManuallyLinkedFiles',
        params,
      }),
      providesTags: ['FileMatched', 'UtilitiesRefresh'],
    }),

    getSeriesFiles: build.query<
      FileType[],
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
      providesTags: ['SeriesAniDB'],
    }),

    getSeriesGroup: build.query<CollectionGroupType, { seriesId: string, topLevel: boolean }>({
      query: ({ seriesId, ...params }) => ({
        url: `Series/${seriesId}/Group`,
        params,
      }),
    }),

    getSeriesTags: build.query<TagType[], { seriesId: string, filter?: number, excludeDescriptions?: boolean }>({
      query: ({ seriesId, ...params }) => ({
        url: `Series/${seriesId}/Tags`,
        params,
      }),
    }),

    getAniDBRelated: build.query<SeriesAniDBRelatedType[], { seriesId: string }>({
      query: ({ seriesId }) => ({
        url: `Series/${seriesId}/AniDB/Related`,
      }),
    }),

    getAniDBSimilar: build.query<SeriesAniDBSimilarType[], { seriesId: string }>({
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
      providesTags: ['SeriesAniDB'],
    }),

    changeSeriesImage: build.mutation<
      ResponseType,
      { seriesId: string, image: Pick<ImageType, 'ID' | 'Source' | 'Type'> }
    >({
      query: ({ image, seriesId }) => ({
        url: `Series/${seriesId}/Images/${image.Type}`,
        method: 'PUT',
        body: { ID: image.ID, Source: image.Source },
      }),
      invalidatesTags: ['SeriesAniDB'],
    }),

    // Queue a refresh of all the TvDB data linked to a series using the seriesID.
    refreshSeriesTvdbInfo: build.mutation<boolean, { seriesId: number, force?: boolean }>({
      query: ({ force = false, seriesId }) => ({
        url: `Series/${seriesId}/TvDB/Refresh?force=${force}`,
        method: 'POST',
      }),
      invalidatesTags: ['SeriesEpisodes'],
    }),

    // Rescan all files for a series
    rescanSeriesFiles: build.mutation<void, { seriesId: number }>({
      query: ({ seriesId }) => ({
        url: `Series/${seriesId}/File/Rescan`,
        method: 'POST',
      }),
      invalidatesTags: ['SeriesAniDB', 'SeriesEpisodes'],
    }),

    // Rehash all files for a series
    rehashSeriesFiles: build.mutation<void, { seriesId: number }>({
      query: ({ seriesId }) => ({
        url: `Series/${seriesId}/File/Rehash`,
        method: 'POST',
      }),
      invalidatesTags: ['SeriesAniDB', 'SeriesEpisodes'],
    }),
  }),
});

export const {
  useChangeSeriesImageMutation,
  useDeleteSeriesMutation,
  useDeleteSeriesTvdbLinkMutation,
  useGetAniDBRecommendedAnimeQuery,
  useGetAniDBRelatedQuery,
  useGetAniDBSimilarQuery,
  useGetSeriesAniDBEpisodesQuery,
  useGetSeriesAniDBSearchQuery,
  useGetSeriesCastQuery,
  useGetSeriesGroupQuery,
  useGetSeriesImagesQuery,
  useGetSeriesInfiniteQuery,
  useGetSeriesQuery,
  useGetSeriesTagsQuery,
  useGetSeriesWithManuallyLinkedFilesQuery,
  useGetSeriesWithoutFilesQuery,
  useLazyGetSeriesAniDBQuery,
  useLazyGetSeriesEpisodesInfiniteQuery,
  useLazyGetSeriesEpisodesQuery,
  useLazyGetSeriesFilesQuery,
  useLazyGetSeriesGroupQuery,
  useLazyGetSeriesInfiniteQuery,
  useNextUpEpisodeQuery,
  useRefreshAnidbSeriesMutation,
  useRefreshSeriesAnidbInfoMutation,
  useRefreshSeriesTvdbInfoMutation,
  useRehashSeriesFilesMutation,
  useRescanSeriesFilesMutation,
  useSetSeriesEpisodesWatchedMutation,
} = seriesApi;
