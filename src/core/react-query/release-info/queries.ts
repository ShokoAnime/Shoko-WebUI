import { useQuery } from '@tanstack/react-query';

import { axios } from '@/core/axios';

import type { ReleaseInfoSummaryType } from '@/core/react-query/release-info/types';
import type { ReleaseProviderInfoType } from '@/core/types/api/release-info';

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
