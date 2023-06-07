import type { ApiLoginType, ApiSessionState } from '@/core/types/api';
import { splitApi } from '../splitApi';

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
        const { user: username, rememberUser } = arg;
        return { ...response, username, rememberUser };
      },
    }),
  }),
});

export const {
  usePostAuthMutation,
} = authApi;
