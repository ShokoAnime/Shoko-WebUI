import { useQuery } from '@tanstack/react-query';

import { axios } from '@/core/axios';
import { transformUser, transformUsers } from '@/core/react-query/user/helpers';

import type { ApiUserType, UserType } from '@/core/types/api/user';

export const useCurrentUserQuery = () =>
  useQuery<ApiUserType, unknown, UserType>({
    queryKey: ['user', 'current'],
    queryFn: () => axios.get('User/Current'),
    select: transformUser,
  });

export const useUsersQuery = () =>
  useQuery<ApiUserType[], unknown, UserType[]>({
    queryKey: ['user'],
    queryFn: () => axios.get('User'),
    select: transformUsers,
  });
