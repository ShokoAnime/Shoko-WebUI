import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { RootState } from '../store';

export const plexApi = createApi({
  reducerPath: 'plexApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/plex/',
    prepareHeaders: (headers, { getState }) => {
      const { apikey } = (getState() as RootState).apiSession;
      headers.set('apikey', apikey);
      return headers;
    },
  }),
  tagTypes: ['PlexLink'],
  refetchOnMountOrArgChange: true,
  endpoints: build => ({
    getPlexLoginUrl: build.query<string, void>({
      query: () => ({
        url: 'loginurl',
        responseHandler: response => response.text(),
      }),
    }),

    getPlexAuthenticated: build.query<boolean, void>({
      query: () => ({
        url: 'pin/authenticated',
        responseHandler: 'text',
      }),
      transformResponse: (response: string) => response === 'true',
      providesTags: ['PlexLink'],
    }),

    invalidatePlexToken: build.mutation<boolean, void>({
      query: () => ({
        url: 'token/invalidate',
        responseHandler: 'text',
      }),
      transformResponse: (response: string) => response === 'true',
      invalidatesTags: ['PlexLink'],
    }),
  }),
});

export const {
  useLazyGetPlexLoginUrlQuery,
  useGetPlexAuthenticatedQuery,
  useInvalidatePlexTokenMutation,
} = plexApi;
