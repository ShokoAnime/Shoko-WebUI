import { useQuery } from '@tanstack/react-query';

import { axios } from '@/core/axios';

import type { ReleaseInfoSummaryType, ReleaseProviderInfoType } from '@/core/react-query/release-info/types';

export const useReleaseInfoSummaryQuery = () =>
  useQuery<ReleaseInfoSummaryType>({
    queryKey: ['release-info', 'summary'],
    queryFn: () => axios.get('ReleaseInfo/Summary'),
  });

export const useReleaseInfoProvidersQuery = () =>
  useQuery<ReleaseProviderInfoType[]>({
    queryKey: ['release-info', 'providers'],
    queryFn: () => axios.get('ReleaseInfo/Provider'),
  });
