import { identity, map, pickBy } from 'lodash';

import { splitV3Api } from '@/core/rtkQuery/splitV3Api';

import type { ApiUserType, CommunitySitesType, UserType } from '@/core/types/api/user';

const simplifyCommunitySites = (sites: string[]) => {
  const result: CommunitySitesType = {
    AniDB: false,
    Trakt: false,
    Plex: false,
  };
  sites.forEach((site) => {
    result[site] = true;
  });
  return result;
};

const userApi = splitV3Api.injectEndpoints({
  endpoints: build => ({
    // List all users.
    getUsers: build.query<UserType[], void>({
      query: () => ({ url: 'User' }),
      transformResponse: (response: ApiUserType[]) => {
        const users: UserType[] = [];
        response.forEach((user) => {
          const { CommunitySites, ...tempUser } = user;
          users.push({ ...tempUser, CommunitySites: simplifyCommunitySites(CommunitySites) });
        });
        return users;
      },
      providesTags: ['Users'],
    }),

    // Add a new user.
    postUser: build.mutation<UserType, Omit<UserType, 'ID'>>({
      query: ({ CommunitySites, ...user }) => ({
        url: 'User',
        method: 'POST',
        body: {
          ...user,
          CommunitySites: CommunitySites ? map(pickBy(CommunitySites, identity), (_, key) => key) : null,
        } as ApiUserType,
      }),
      transformResponse: (user: ApiUserType) => {
        const { CommunitySites, ...tempUser } = user;
        return { ...tempUser, CommunitySites: simplifyCommunitySites(CommunitySites) };
      },
      invalidatesTags: ['Users'],
    }),

    // Edit the current user or a user by id using a raw object to do a partial update.
    putUser: build.mutation<UserType, UserType>({
      query: ({ CommunitySites, ID, Password: __, ...user }) => ({
        url: `User/${ID}`,
        method: 'PUT',
        body: {
          ...user,
          CommunitySites: CommunitySites ? map(pickBy(CommunitySites, identity), (_, key) => key) : null,
        } as ApiUserType,
      }),
      transformResponse: (user: ApiUserType) => {
        const { CommunitySites, ...tempUser } = user;
        return { ...tempUser, CommunitySites: simplifyCommunitySites(CommunitySites) };
      },
      invalidatesTags: ['Users'],
    }),

    // Remove the user.
    deleteUser: build.mutation<void, number>({
      query: userId => ({
        url: `User/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Users'],
    }),

    // Change the password for the current user or a user by id.
    postChangePassword: build.mutation<void, { Password: string, RevokeAPIKeys: boolean, ID?: number }>({
      query: ({ ID, ...body }) => ({
        url: `User/${ID || 'Current'}/ChangePassword`,
        body,
        method: 'POST',
      }),
    }),

    // Get the current user.
    getCurrentUser: build.query<UserType, void>({
      query: () => ({ url: 'User/Current' }),
      transformResponse: (response: ApiUserType) => {
        const { CommunitySites, ...tempUser } = response;
        return { ...tempUser, CommunitySites: simplifyCommunitySites(CommunitySites) };
      },
      providesTags: ['Users'],
    }),
  }),
});

export const {
  useDeleteUserMutation,
  useGetCurrentUserQuery,
  useGetUsersQuery,
  usePostChangePasswordMutation,
  usePostUserMutation,
  usePutUserMutation,
} = userApi;
