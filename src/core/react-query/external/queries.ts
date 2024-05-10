import { useQuery } from '@tanstack/react-query';

import { axiosExternal as axios } from '@/core/axios';
import { transformShokoNews } from '@/core/react-query/external/helpers';

import type { DashboardNewsType } from '@/core/types/api/dashboard';

export const useShokoNewsQuery = () =>
  useQuery<{ items?: DashboardNewsType[] }, unknown, DashboardNewsType[]>({
    queryKey: ['shoko-news'],
    queryFn: () => axios.get('https://shokoanime.com/jsonfeed/index.json'),
    select: transformShokoNews,
    retry: 1,
  });
