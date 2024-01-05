import { useMutation } from '@tanstack/react-query';
import { identity, map, pickBy } from 'lodash';

import { axios } from '@/core/axios';
import { invalidateQueries } from '@/core/react-query/queryClient';

import type { ChangePasswordRequestType } from '@/core/react-query/user/types';
import type { UserType } from '@/core/types/api/user';

export const useChangePasswordMutation = () =>
  useMutation({
    mutationFn: ({ userId, ...data }: ChangePasswordRequestType) =>
      axios.post(`User/${userId ?? 'Current'}/ChangePassword`, data),
  });

export const useDeleteUserMutation = () =>
  useMutation({
    mutationFn: (userId: number) => axios.delete(`User/${userId}`),
    onSuccess: () => invalidateQueries(['user']),
  });

export const usePutUserMutation = () =>
  useMutation({
    mutationFn: ({ CommunitySites, ID, Password: _, ...user }: UserType) =>
      axios.put(
        `User/${ID}`,
        {
          ...user,
          CommunitySites: CommunitySites ? map(pickBy(CommunitySites, identity), (__, key) => key) : null,
        },
      ),
    onSuccess: () => invalidateQueries(['user']),
  });
