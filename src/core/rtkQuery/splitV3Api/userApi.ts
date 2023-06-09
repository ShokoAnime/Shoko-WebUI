import type { ApiUserType, CommunitySitesType, UserType } from '@/core/types/api/user';
import { identity, map, pickBy } from 'lodash';
import { splitV3Api } from '../splitV3Api';

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
          const { CommunitySites, ...tempUser } = user;
          users.push({ ...tempUser, CommunitySites: simplifyCommunitySites(CommunitySites) });
        });
        return users;
      },
      providesTags: ['Users'],
    }),

    // Edit User. This replaces all values, except Plex and Password.
    putUser: build.mutation<void, UserType>({
      query: ({ CommunitySites, ...user }) => ({
        url: 'User',
        method: 'PUT',
        body: { ...user, CommunitySites: map(pickBy(CommunitySites, identity), (_, key) => key) },
      }),
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

    // Change the user avatar for a user
    postUserChangeAvatar: build.mutation<void, { avatar: File, userId: number }>({
      query: ({ avatar, userId }) => {
        const formData = new FormData();
        formData.append('image', avatar);

        return {
          url: `User/${userId}/ChangeAvatar`,
          method: 'POST',
          body: formData,
          prepareHeaders: (headers) => {
            headers.set('Content-Type', 'multipart/form-data');
            return headers;
          },
        };
      },
      invalidatesTags: ['Users'],
    }),

    // Remove the user avatar for a user
    deleteUserAvatar: build.mutation<void, number>({
      query: userId => ({
        url: `User/${userId}/ChangeAvatar`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Users'],
    }),

    // Get the current Shoko.Server.API.v3.Models.Shoko.User
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
  useGetUsersQuery,
  usePutUserMutation,
  usePostChangePasswordMutation,
  usePostUserChangeAvatarMutation,
  useDeleteUserAvatarMutation,
  useGetCurrentUserQuery,
} = userApi;
