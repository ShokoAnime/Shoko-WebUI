import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react';

import type { ApiLoginType, ApiSessionState } from '../types/api';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/auth',
  }),
  endpoints: build => ({
    // Get an authentication token for the user.
    postAuth: build.mutation<ApiSessionState, ApiLoginType>({
      query: ({ rememberUser, ...body }) => ({
        url: '',
        body,
        method: 'POST',
      }),
      transformResponse: (response: { apikey: string }, _, arg) => {
        const { user: username, rememberUser } = arg;
        return { ...response, username, rememberUser };
      },
    }),
  }),
});

export const {
  usePostAuthMutation,
} = authApi;
