import { splitApi } from '@/core/rtkQuery/splitApi';

import type { ApiLoginType, ApiSessionState } from '@/core/types/api';

export const authApi = splitApi.injectEndpoints({
  endpoints: build => ({
    // Get an authentication token for the user.
    postAuth: build.mutation<ApiSessionState, ApiLoginType>({
      query: ({ rememberUser: _, ...body }) => ({
        url: 'auth',
        body,
        method: 'POST',
      }),
      transformResponse: (response: { apikey: string }, _, arg) => {
        const { rememberUser, user: username } = arg;
        return { ...response, username, rememberUser };
      },
    }),
  }),
});

export const {
  usePostAuthMutation,
} = authApi;
