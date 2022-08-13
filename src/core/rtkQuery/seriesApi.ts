import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import type { RootState } from '../store';
import type { SeriesAniDBSearchResult } from '../types/api/series';
import type { PaginationType } from '../types/api';

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

    // Search the title dump for the given query or directly using the anidb id.
    getSeriesAniDBSearch: build.query<Array<SeriesAniDBSearchResult>, { query: string } & PaginationType>({
      query: params => ({ url: `AniDB/Search/${params.query}`, params }),
      transformResponse: (response: any) => response.List,
    }),
  }),
});

export const {
  useLazyGetSeriesAniDBSearchQuery,
} = seriesApi;
