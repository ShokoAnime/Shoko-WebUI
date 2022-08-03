import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import type { RootState } from '../store';
import type { DashboardStatsType, DashboardSeriesSummaryType, DashboardEpisodeDetailsType } from '../types/api/dashboard';
import type { SeriesType } from '../types/api/series';

export const dashboardApi = createApi({
  reducerPath: 'dashboard',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v3/Dashboard/',
    prepareHeaders: (headers, { getState }) => {
      const apikey = (getState() as RootState).apiSession.apikey;
      headers.set('apikey', apikey);
      return headers;
    },
  }),
  endpoints: build => ({

    // Get the counters of various collection stats
    getDashboardStats: build.query<DashboardStatsType, void>({
      query: () => ({ url: 'Stats' }),
    }),

    // Gets a breakdown of which types of anime the user has access to
    getDashboardSeriesSummary: build.query<DashboardSeriesSummaryType, void>({
      query: () => ({ url: 'SeriesSummary' }),
      transformResponse: (response: DashboardSeriesSummaryType) => {
        const result = response;
        result.Other += result.Special + result.None;
        return result;
      },
    }),

    // Get a list of recently added episodes (with additional details).
    getDashboardRecentlyAddedEpisodes: build.query<Array<DashboardEpisodeDetailsType>, { pageSize: number }>({
      query: args => ({ url: 'RecentlyAddedEpisodes', params: args }),
    }),

    // Get a list of recently added series.
    getDashboardRecentlyAddedSeries: build.query<Array<SeriesType>, { pageSize: number }>({
      query: args => ({ url: 'RecentlyAddedSeries', params: args }),
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useGetDashboardSeriesSummaryQuery,
  useGetDashboardRecentlyAddedEpisodesQuery,
  useGetDashboardRecentlyAddedSeriesQuery,
} = dashboardApi;
