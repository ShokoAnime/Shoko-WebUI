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
