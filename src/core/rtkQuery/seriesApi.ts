import { splitV3Api } from './splitV3Api';

import type { SeriesAniDBSearchResult, SeriesType, SeriesRecommendedType } from '../types/api/series';
import type { ListResultType, PaginationType } from '../types/api';
import { EpisodeType } from '../types/api/episode';

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
    }),

    // Get the Shoko.Server.API.v3.Models.Shoko.Episodes for the Shoko.Server.API.v3.Models.Shoko.Series with seriesID.
    getSeriesEpisodes: build.query<Array<EpisodeType>, { seriesId: number; }>({
      query: ({ seriesId }) => ({ url: `Series/${seriesId}/Episode?includeMissing=true` }),
      providesTags: ['SeriesEpisodes'],
    }),

    // Queue a refresh of the AniDB Info for series with AniDB ID
    refreshAnidbSeries: build.mutation<void, { anidbID: number; force?: boolean; }>({
      query: ({ anidbID }) => ({ url: `Series/AniDB/${anidbID}/Refresh?force=true&createSeriesEntry=true&immediate=true`, method: 'POST' }),
      invalidatesTags: ['SeriesEpisodes'],
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
  }),
});

export const {
  useDeleteSeriesMutation,
  useGetSeriesWithoutFilesQuery,
  useLazyGetSeriesAniDBSearchQuery,
  useLazyGetSeriesEpisodesQuery,
  useRefreshAnidbSeriesMutation,
  useLazyGetSeriesAniDBQuery,
  useGetAniDBRecommendedAnimeQuery,
} = seriesApi;
