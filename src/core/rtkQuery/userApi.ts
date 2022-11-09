import { splitV3Api } from './splitV3Api';

import type { UserType } from '../types/api/user';

const userApi = splitV3Api.injectEndpoints({
  endpoints: build => ({
    // List all Users. Admin only
    getUsers: build.query<Array<UserType>, void>({
      query: () => ({ url: 'User' }),
    }),
  }),
});

export const {
  useGetUsersQuery,
} = userApi;
