import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import type { RootState } from '../store';
import type { TraktCodeType } from '../types/api';

export const traktApi = createApi({
  reducerPath: 'traktApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/trakt/',
    prepareHeaders: (headers, { getState }) => {
      const apikey = (getState() as RootState).apiSession.apikey;
      headers.set('apikey', apikey);
      return headers;
    },
  }),
  endpoints: build => ({
    // Gety Trakt code and url.
    getTraktCode: build.query<TraktCodeType, void>({
      query: () => ({ url: 'code' }),
    }),
  }),
});

export const {
  useLazyGetTraktCodeQuery,
} = traktApi;
