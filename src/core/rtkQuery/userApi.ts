import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import type { RootState } from '../store';
import type { UserType } from '../types/api/user';

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v3/User/',
    prepareHeaders: (headers, { getState }) => {
      const apikey = (getState() as RootState).apiSession.apikey;
      headers.set('apikey', apikey);
      return headers;
    },
  }),
  endpoints: build => ({
    // List all Users. Admin only
    getUsers: build.query<Array<UserType>, void>({
      query: () => ({ url: '' }),
    }),
  }),
});

export const {
  useGetUsersQuery,
} = userApi;
