import { useQuery } from '@tanstack/react-query';

import { axiosPlex as axios } from '@/core/axios';

export const usePlexLoginUrlQuery = (enabled = true) =>
  useQuery<string>({
    queryKey: ['plex', 'login-url'],
    queryFn: () => axios.get('loginurl'),
    enabled,
  });

export const usePlexStatusQuery = (refetchInterval = 0) =>
  useQuery<boolean>({
    queryKey: ['plex', 'status'],
    queryFn: () => axios.get('pin/authenticated'),
    refetchInterval,
    enabled: refetchInterval !== 0,
  });
