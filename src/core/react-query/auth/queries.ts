import { useQuery } from '@tanstack/react-query';

import { axiosV2 } from '@/core/axios';

import type { AuthToken } from '@/core/types/api/authToken';

export const useApiKeyQuery = () =>
  useQuery<AuthToken[]>({
    queryKey: ['auth', 'auth'],
    queryFn: () => axiosV2.get('auth'),
  });
