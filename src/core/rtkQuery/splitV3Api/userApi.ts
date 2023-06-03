import { splitV3Api } from '../splitV3Api';

import type { ApiUserType, CommunitySitesType, UserType } from '@/core/types/api/user';
import { identity, map, pickBy } from 'lodash';

const simplifyCommunitySites = (sites: Array<string>) => {
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
    // List all Users. Admin only
    getUsers: build.query<Array<UserType>, void>({
      query: () => ({ url: 'User' }),
      transformResponse: (response: Array<ApiUserType>) => {
        const users: Array<UserType> = [];
        response.forEach((user) => {
          let { CommunitySites, ...tempUser } = user;
          users.push({ ...tempUser, CommunitySites: simplifyCommunitySites(CommunitySites) });
        });
        return users;
      },
      providesTags: ['Users'],
    }),

    // Edit User. This replaces all values, except Plex and Password.
    putUser: build.mutation<void, UserType>({
      query: ({ CommunitySites, ...user }) => {
        return {
          url: 'User',
          method: 'PUT',
          body: { ...user, CommunitySites: map(pickBy(CommunitySites, identity), (_, key) => key) },
        };
      },
      invalidatesTags: ['Users'],
    }),

    // Change the password for a user
    postChangePassword: build.mutation<void, { Password: string, RevokeAPIKeys: boolean, userId: number, admin: boolean }>({
      query: ({ admin, userId, ...body }) => ({
        url: `User/${admin ? userId.toString() : 'Current'}/ChangePassword`,
        body,
        method: 'POST',
      }),
    }),
  }),
});

export const {
  useGetUsersQuery,
  usePutUserMutation,
  usePostChangePasswordMutation,
} = userApi;
