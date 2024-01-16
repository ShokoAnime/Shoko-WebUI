import { useMutation } from '@tanstack/react-query';

import { axiosV2 as axios } from '@/core/axios';
import { setDetails } from '@/core/slices/apiSession';
import store from '@/core/store';

import type { LoginRequestType } from '@/core/react-query/auth/types';
import type { ApiSessionState } from '@/core/types/api';

export const useLoginMutation = () =>
  useMutation<ApiSessionState, unknown, LoginRequestType>({
    mutationFn: ({ rememberUser: _, ...body }: LoginRequestType) => axios.post('auth', body),
    onSuccess: (data, params) => {
      store.dispatch(setDetails({
        ...data,
        username: params.user,
        rememberUser: params.rememberUser,
      }));
    },
  });

export const useCreateApiToken = () =>
  useMutation<string, unknown, string>({
    mutationFn: (key: string) =>
      axios.post('auth/apikey', key, {
        headers: {
          'Content-Type': 'application/json',
        },
      }),
  });

export const useDeleteApiToken = () =>
  useMutation({
    mutationFn: (key: string) =>
      axios.delete('auth', {
        headers: {
          'Content-Type': 'application/json',
        },
        params: {
          apikey: key,
        },
      }),
  });
