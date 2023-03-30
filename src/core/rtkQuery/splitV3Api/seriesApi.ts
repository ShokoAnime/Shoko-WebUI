import { splitV3Api } from '../splitV3Api';

import type { SeriesAniDBSearchResult, SeriesType, SeriesRecommendedType } from '../../types/api/series';
import type { ListResultType, PaginationType } from '../../types/api';
import { EpisodeType } from '../../types/api/episode';
import { FileType } from '../../types/api/file';
import { SeriesAniDBRelatedType, SeriesAniDBSimilarType, SeriesCast, SeriesDetailsType } from '../../types/api/series';
import { TagType } from '../../types/api/tags';
import { ImageType } from '../../types/api/common';

type SeriesImagesQueryResultType = {
  Posters: ImageType[];
  Banners: ImageType[];
  Fanarts: ImageType[];
};

const seriesApi = splitV3Api.injectEndpoints({
  endpoints: build => ({

    // Delete a Series
    deleteSeries: build.mutation<void, { seriesId: number, deleteFiles: boolean }>({
      query: ({ seriesId, ...params }) => ({ url: `Series/${seriesId}`, method: 'DELETE', params }),
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
    getSeriesEpisodes: build.query<ListResultType<EpisodeType[]>, { seriesId: number; } & PaginationType>({
      query: ({ seriesId, ...params }) => ({ url: `Series/${seriesId}/Episode?includeDataFrom=AniDB&includeDataFrom=TvDB`, params }),
      providesTags: ['SeriesEpisodes', 'UtilitiesRefresh'],
    }),

    // Get the Shoko.Server.API.v3.Models.Shoko.Episodes for the Shoko.Server.API.v3.Models.Shoko.Series with seriesID.
    getSeriesEpisodesInfinite: build.query<ListResultType<EpisodeType[]>, { seriesId: number; } & PaginationType>({
      query: ({ seriesId, ...params }) => ({ url: `Series/${seriesId}/Episode?includeDataFrom=AniDB&includeDataFrom=TvDB`, params }),
      // Only have one cache entry because the arg always maps to one string
      serializeQueryArgs: ({ endpointName }) => {
        return endpointName;
      },
      // Always merge incoming data to the cache entry
      merge: (currentCache, newItems) => {
        currentCache.List.push(...newItems.List);
      },
      // Refetch when the page arg changes
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
    }),

    // Queue a refresh of the AniDB Info for series with AniDB ID
    refreshAnidbSeries: build.mutation<void, { anidbID: number; force?: boolean; }>({
      query: ({ anidbID }) => ({ url: `Series/AniDB/${anidbID}/Refresh?force=true&createSeriesEntry=true&immediate=true`, method: 'POST' }),
      invalidatesTags: ['SeriesEpisodes', 'SeriesSearch'],
    }),

    // Get AniDB Info from the AniDB ID
    getSeriesAniDB: build.query<SeriesAniDBSearchResult, { anidbID: number; }>({
      query: params => ({ url: `Series/AniDB/${params.anidbID}` }),
      transformResponse: (response: any) => response.List,
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

    getSeriesFiles: build.query<Array<FileType>, { seriesId: number, isManuallyLinked: boolean, includeXRefs: boolean }>({
      query: ({ seriesId, ...params }) => ({
        url: `Series/${seriesId}/File`,
        params,
      }),
      providesTags: ['FileMatched', 'UtilitiesRefresh'],
    }),
    
    getSeries: build.query<SeriesDetailsType, { seriesId: string, includeDataFrom?: string[] } >({ 
      query: ({ seriesId, ...params }) => ({
        url: `Series/${seriesId}`,
        params,
      }),
    }),

    getSeriesTags: build.query<Array<TagType>, { seriesId: string, filter?: string, excludeDescriptions?: boolean } >({
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
    //Get the next Shoko.Server.API.v3.Models.Shoko.Episode for the Shoko.Server.API.v3.Models.Shoko.Series with seriesID.
    nextUpEpisode: build.query<EpisodeType, { seriesId: number; }>({
      query: ({ seriesId }) => ({ url: `Series/${seriesId}/NextUpEpisode?includeDataFrom=AniDB&includeDataFrom=TvDB` }),
    }),

    getSeriesCast: build.query<SeriesCast[], { seriesId: string } >({
      query: ({ seriesId, ...params }) => ({
        url: `Series/${seriesId}/Cast`,
        params,
      }),
    }),

    getSeriesImages: build.query<SeriesImagesQueryResultType, { seriesId: string } >({
      query: ({ seriesId }) => ({
        url: `Series/${seriesId}/Images`,
      }),
    }),
  }),
});

export const {
  useDeleteSeriesMutation,
  useGetSeriesWithoutFilesQuery,
  useLazyGetSeriesAniDBSearchQuery,
  useGetSeriesEpisodesQuery,
  useLazyGetSeriesEpisodesQuery,
  useRefreshAnidbSeriesMutation,
  useLazyGetSeriesAniDBQuery,
  useGetAniDBRecommendedAnimeQuery,
  useGetSeriesWithManuallyLinkedFilesQuery,
  useGetSeriesFilesQuery,
  useGetSeriesQuery,
  useGetSeriesTagsQuery,
  useGetAniDBRelatedQuery,
  useGetAniDBSimilarQuery,
  useNextUpEpisodeQuery,
  useLazyGetSeriesEpisodesInfiniteQuery,
  useGetSeriesCastQuery,
  useGetSeriesImagesQuery,
} = seriesApi;
