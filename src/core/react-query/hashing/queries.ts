import { useQuery } from '@tanstack/react-query';

import { axios } from '@/core/axios';

import type { HashProviderInfoType, HashingSummaryType } from '@/core/react-query/hashing/types';

export const useHashingProvidersQuery = () =>
  useQuery<HashProviderInfoType[]>({
    queryKey: ['hashing', 'providers'],
    queryFn: () => axios.get('Hashing/Provider'),
  });

export const useHashingSummaryQuery = () =>
  useQuery<HashingSummaryType>({
    queryKey: ['hashing', 'summary'],
    queryFn: () => axios.get('Hashing/Summary'),
  });
