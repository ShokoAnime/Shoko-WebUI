import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react';
import { RootState } from '../store';

export const actionsrApi = createApi({
  reducerPath: 'actionsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v3/Action',
    prepareHeaders: (headers, { getState }) => {
      const apikey = (getState() as RootState).apiSession.apikey;
      headers.set('apikey', apikey);
      return headers;
    },
  }),
  endpoints: build => ({
    // Run action
    runAction: build.mutation<void, string>({
      query: action => ({ url: `/${action}` }),
    }),
  }),
});

export const {
  useRunActionMutation,
} = actionsrApi;