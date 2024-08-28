import { useQuery } from '@tanstack/react-query';

import { axios } from '@/core/axios';

import type { ServerStatusType, UserType, VersionType } from '@/core/types/api/init';

export const useVersionQuery = () =>
  useQuery<VersionType>({
    queryKey: ['init', 'version'],
    queryFn: () => axios.get('Init/Version'),
    staleTime: Infinity,
  });

export const useDefaultUserQuery = () =>
  useQuery<UserType>({
    queryKey: ['init', 'default-user'],
    queryFn: () => axios.get('Init/DefaultUser'),
  });

export const useServerStatusQuery = (refetchInterval = 0) =>
  useQuery<ServerStatusType>({
    queryKey: ['init', 'server-status'],
    queryFn: () => axios.get('Init/Status'),
    refetchInterval,
  });
