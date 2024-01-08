import { useQuery } from '@tanstack/react-query';

import { axiosV2 as axios } from '@/core/axios';

import type { TraktCodeType } from '@/core/types/api';

export const useTraktCodeQuery = (enabled = true) =>
  useQuery<TraktCodeType>({
    queryKey: ['trakt-code'],
    queryFn: () => axios.get('trakt/code'),
    enabled,
    refetchOnWindowFocus: false,
  });
