import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import type { RootState } from '../store';
import type { SeriesAniDBSearchResult, SeriesType } from '../types/api/series';
import type { ListResultType, PaginationType } from '../types/api';

export const seriesApi = createApi({
  reducerPath: 'series',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v3/Series/',
    prepareHeaders: (headers, { getState }) => {
      const apikey = (getState() as RootState).apiSession.apikey;
      headers.set('apikey', apikey);
      return headers;
    },
  }),
  endpoints: build => ({

    // Delete a Series
    deleteSeries: build.mutation<void, { seriesId: number, deleteFiles: boolean }>({
      query: ({ seriesId, ...params }) => ({ url: `${seriesId}`, method: 'DELETE', params }),
    }),

    // Get a paginated list of Shoko.Server.API.v3.Models.Shoko.Series without local files, available to the current Shoko.Server.API.v3.Models.Shoko.User.
    getSeriesWithoutFiles: build.query<ListResultType<SeriesType[]>, PaginationType>({
      query: params => ({ url: 'WithoutFiles', params }),
    }),

    // Search the title dump for the given query or directly using the anidb id.
    getSeriesAniDBSearch: build.query<Array<SeriesAniDBSearchResult>, { query: string } & PaginationType>({
      query: params => ({ url: `AniDB/Search/${params.query}`, params }),
      transformResponse: (response: any) => response.List,
    }),
  }),
});

export const {
  useDeleteSeriesMutation,
  useGetSeriesWithoutFilesQuery,
  useLazyGetSeriesAniDBSearchQuery,
} = seriesApi;
