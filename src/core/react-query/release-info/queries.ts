import { useQuery } from '@tanstack/react-query';

import { axios } from '@/core/axios';

import type { ReleaseProviderInfoType } from '@/core/react-query/release-info/types';

export const useReleaseInfoProvidersQuery = (noStale = false) =>
  useQuery<ReleaseProviderInfoType[]>({
    queryKey: ['release-info', 'providers', noStale],
    queryFn: () => axios.get('ReleaseInfo/Provider'),
    staleTime: noStale ? Infinity : 1000,
  });
