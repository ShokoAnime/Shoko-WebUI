import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react';

import type { UserType, VersionType } from '../types/api/init';
import type { ServerStatusType } from '../types/api/init';

export const initApi = createApi({
  reducerPath: 'initApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v3/Init/',
  }),
  endpoints: build => ({
    // Return current version of ShokoServer and several modules
    getInitVersion: build.query<VersionType, void>({
      query: () => ({ url: 'Version' }),
    }),

    // Test Database Connection with Current Settings
    getInitDatabaseTest: build.mutation<void, void>( {
      query: () => ({ url: 'Database/Test' }),
    }),

    // Gets the Default user's credentials. Will only return on first run
    getInitDefaultUser: build.query<UserType, void>({
      query: () => ({ url: 'DefaultUser' }),
    }),

    // Sets the default user's credentials
    postInitDefaultUser: build.mutation<void, UserType>({
      query: body => ({
        url: 'DefaultUser',
        method: 'POST',
        body,
      }),
    }),

    // Starts the server, or does nothing
    getInitStartServer: build.mutation<void, void>({
      query: () => ({ url: 'StartServer' }),
    }),

    // Gets various information about the startup status of the server. This will work after init.
    getInitStatus: build.query<ServerStatusType, void>({
      query: () => ({ url: 'Status' }),
    }),
  }),
});

export const {
  useGetInitVersionQuery,
  useGetInitDatabaseTestMutation,
  useGetInitDefaultUserQuery,
  usePostInitDefaultUserMutation,
  useGetInitStartServerMutation,
  useGetInitStatusQuery,
} = initApi;
