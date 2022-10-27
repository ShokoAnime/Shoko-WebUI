import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import type { RootState } from '../store';
import type { WebUIVersionType } from '../types/api';

export const webuiApi = createApi({
  reducerPath: 'webuiApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/webui/',
    prepareHeaders: (headers, { getState }) => {
      const apikey = (getState() as RootState).apiSession.apikey;
      headers.set('apikey', apikey);
      return headers;
    },
  }),
  endpoints: build => ({
    // Check for newest webui version
    getWebuiLatest: build.mutation<WebUIVersionType, string>({
      query: channel => ({ url: `latest/${channel}` }),
    }),

    // Update webui
    getWebuiUpdate: build.mutation<void, string>({
      query: channel => ({ url: `update/${channel}` }),
    }),
  }),
});

export const {
  useGetWebuiLatestMutation,
  useGetWebuiUpdateMutation,
} = webuiApi;
