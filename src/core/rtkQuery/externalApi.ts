import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { DashboardNewsType } from '@/core/types/api/dashboard';

export const externalApi = createApi({
  reducerPath: 'external',
  baseQuery: fetchBaseQuery(),
  refetchOnMountOrArgChange: true,
  endpoints: build => ({
    // Get blog posts from shokoanime.com
    getShokoNewsFeed: build.query<Array<DashboardNewsType>, void>({
      query: () => ({ url: 'https://shokoanime.com/jsonfeed/index.json' }),
      transformResponse: (response: any) => response.items ?? [],
    }),
  }),
});

export const {
  useGetShokoNewsFeedQuery,
} = externalApi;
