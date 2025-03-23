import { useQuery } from '@tanstack/react-query';

import { axios } from '@/core/axios';

import type { HashingSummaryType } from '@/core/react-query/hashing/types';
import type { HashProviderInfoType } from '@/core/types/api/hashing';

export const useHashingSummaryQuery = () =>
  useQuery<HashingSummaryType>({
    queryKey: ['hashing', 'summary'],
    queryFn: () => axios.get('Hashing/Summary'),
  });

export const useHashingProvidersQuery = () =>
  useQuery<HashProviderInfoType[]>({
    queryKey: ['hashing', 'providers'],
    queryFn: () => axios.get('Hashing/Provider'),
  });
