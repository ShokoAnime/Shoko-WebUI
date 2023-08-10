import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import type { RootState } from '@/core/store';

export const splitApi = createApi({
  reducerPath: 'splitApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/',
    prepareHeaders: (headers, { getState }) => {
      const { apikey } = (getState() as RootState).apiSession;
      headers.set('apikey', apikey);
      return headers;
    },
  }),
  endpoints: () => ({}),
});
