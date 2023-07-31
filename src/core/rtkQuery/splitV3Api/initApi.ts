import type { LegacyVersionType, ServerStatusType, UserType, VersionType } from '@/core/types/api/init';
import { splitV3Api } from '../splitV3Api';

export const initApi = splitV3Api.injectEndpoints({
  endpoints: build => ({
    // Return current version of ShokoServer and several modules
    getInitVersion: build.query<VersionType, void>({
      query: () => ({ url: 'Init/Version' }),
      transformResponse: (response: VersionType & LegacyVersionType) => {
        if (response.Server) return response as VersionType;
        const serverVersion = response.find(obj => obj.Name === 'Server');
        return {
          Server: {
            Version: serverVersion?.Version,
            ReleaseChannel: 'Dev',
            ReleaseDate: serverVersion?.ReleaseDate,
            Commit: 'NA',
          },
        } as VersionType;
      },
    }),

    // Test Database Connection with Current Settings
    getInitDatabaseTest: build.mutation<void, void>({
      query: () => ({ url: 'Init/Database/Test' }),
    }),

    // Gets the Default user's credentials. Will only return on first run
    getInitDefaultUser: build.query<UserType, void>({
      query: () => ({ url: 'Init/DefaultUser' }),
    }),

    // Sets the default user's credentials
    postInitDefaultUser: build.mutation<void, UserType>({
      query: body => ({
        url: 'Init/DefaultUser',
        method: 'POST',
        body,
      }),
    }),

    // Starts the server, or does nothing
    getInitStartServer: build.mutation<void, void>({
      query: () => ({ url: 'Init/StartServer' }),
    }),

    // Gets various information about the startup status of the server. This will work after init.
    getInitStatus: build.query<ServerStatusType, void>({
      query: () => ({ url: 'Init/Status' }),
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
