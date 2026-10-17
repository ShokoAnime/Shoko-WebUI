import { type Query, useQuery } from '@tanstack/react-query';

import { axios } from '@/core/axios';

import type { RestartReasonType, ServerStatusType, UserType, VersionType } from '@/core/types/api/init';

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

export const useServerStatusQuery = (
  refetchInterval: number | false | ((query: Query<ServerStatusType>) => number | false | undefined) = false,
) =>
  useQuery<ServerStatusType>({
    queryKey: ['init', 'server-status'],
    queryFn: () => axios.get('Init/Status'),
    refetchInterval,
  });

/** The reasons the server needs a restart, for admins. The `restart` feed keeps them current. */
export const useRestartReasonsQuery = (enabled: boolean) =>
  useQuery<RestartReasonType[]>({
    queryKey: ['init', 'restart-reasons'],
    queryFn: () => axios.get('Init/RestartReasons'),
    enabled,
  });
