import { useQuery } from '@tanstack/react-query';

import { axiosExternal as axios } from '@/core/axios';
import { transformShokoNews } from '@/core/react-query/external/helpers';

import type { DashboardNewsType } from '@/core/types/api/dashboard';

export const useShokoNewsQuery = () =>
  useQuery<{ results?: DashboardNewsType[] }, unknown, DashboardNewsType[]>({
    queryKey: ['shoko-news'],
    queryFn: async () =>
      axios.get(
        'https://shokoanime.com/api/getFiles?type=blog&offset=0&limit=4&sort=dateDescending',
      ),
    select: transformShokoNews,
    retry: 1,
  });
