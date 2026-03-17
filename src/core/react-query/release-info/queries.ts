import { useQuery } from '@tanstack/react-query';

import { axios } from '@/core/axios';

import type { ReleaseInfoSettingsType, ReleaseProviderInfoType } from '@/core/react-query/release-info/types';

export const useReleaseInfoSummaryQuery = () =>
  useQuery<ReleaseInfoSettingsType>({
    queryKey: ['release-info', 'summary'],
    queryFn: () => axios.get('ReleaseInfo/Summary'),
  });

export const useReleaseInfoProvidersQuery = (noStale = false) =>
  useQuery<ReleaseProviderInfoType[]>({
    queryKey: ['release-info', 'providers', noStale],
    queryFn: () => axios.get('ReleaseInfo/Provider'),
    staleTime: noStale ? Infinity : 1000,
  });
