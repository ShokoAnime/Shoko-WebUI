import { splitApi } from '../splitApi';

import type { ApiLoginType, ApiSessionState } from '@/core/types/api';

export const authApi = splitApi.injectEndpoints({
  endpoints: build => ({
    // Get an authentication token for the user.
    postAuth: build.mutation<ApiSessionState, ApiLoginType>({
      query: ({ rememberUser, ...body }) => ({
        url: 'auth',
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
