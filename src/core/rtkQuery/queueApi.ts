import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import type { RootState } from '../store';

export const queueApi = createApi({
  reducerPath: 'queue',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/queue/',
    prepareHeaders: (headers, { getState }) => {
      const apikey = (getState() as RootState).apiSession.apikey;
      headers.set('apikey', apikey);
      return headers;
    },
  }),
  endpoints: build => ({
    getQueueOperation: build.mutation<void, { operation: string; queue?: string }>({
      query: ({ operation, queue }) => ({
        url: (queue ? queue + '/' : '') + operation,
      }),
    }),
  }),
});

export const {
  useGetQueueOperationMutation,
} = queueApi;
