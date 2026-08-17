import { useQuery } from '@tanstack/react-query';

import { axios } from '@/core/axios';
import { transformListResultSimplified } from '@/core/react-query/helpers';

import type { ReleaseProviderInfoType } from '@/core/react-query/release-info/types';
import type { ListResultType } from '@/core/types/api';
import type { ReleaseGroupType } from '@/core/types/api/file';

export const useReleaseInfoProvidersQuery = (noStale = false, enabled = true) =>
  useQuery<ReleaseProviderInfoType[]>({
    queryKey: ['release-info', 'providers', noStale],
    queryFn: () => axios.get('ReleaseInfo/Provider'),
    staleTime: noStale ? Infinity : 1000,
    enabled,
  });

export const useReleaseInfoReleaseGroupsQuery = (enabled = true) =>
  useQuery<ListResultType<ReleaseGroupType>, unknown, ReleaseGroupType[]>({
    queryKey: ['release-info', 'release-groups'],
    queryFn: () => axios.get('ReleaseInfo/ReleaseGroup', { params: { pageSize: 0, includeMissing: true } }),
    select: transformListResultSimplified,
    enabled,
  });
