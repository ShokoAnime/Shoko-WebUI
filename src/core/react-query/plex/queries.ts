import { useQuery } from '@tanstack/react-query';

import { axiosPlex as axios } from '@/core/axios';
import { transformLibraries } from '@/core/react-query/plex/helpers';

import type { PlexLibraryType, PlexServerType } from '@/core/types/api/plex';

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
  });

export const usePlexServersQuery = (enabled = false) =>
  useQuery<PlexServerType[]>({
    queryKey: ['plex', 'servers'],
    queryFn: () => axios.get('server/list'),
    enabled,
  });

export const usePlexLibrariesQuery = (enabled = false) =>
  useQuery<PlexLibraryType[]>({
    queryKey: ['plex', 'libraries'],
    queryFn: () => axios.get('libraries'),
    select: transformLibraries,
    enabled,
  });
