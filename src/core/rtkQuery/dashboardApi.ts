import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import type { RootState } from '../store';
import type { PaginationType } from '../types/api';
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
  // refetchOnReconnect: true,
  // refetchOnFocus: true,
  refetchOnMountOrArgChange: true,
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
        result.Other += (result?.Special ?? 0) + (result?.None ?? 0);
        delete result.Special;
        delete result.None;
        return result;
      },
    }),

    // Get a list of recently added episodes (with additional details).
    getDashboardRecentlyAddedEpisodes: build.query<Array<DashboardEpisodeDetailsType>, PaginationType>({
      query: params => ({ url: 'RecentlyAddedEpisodes', params }),
    }),

    // Get a list of recently added series.
    getDashboardRecentlyAddedSeries: build.query<Array<SeriesType>, PaginationType>({
      query: params => ({ url: 'RecentlyAddedSeries', params }),
    }),

    // Get a list of the episodes to continue watching in recently watched order
    getDashboardContinueWatchingEpisodes: build.query<Array<DashboardEpisodeDetailsType>, PaginationType>({
      query: params => ({ url: 'ContinueWatchingEpisodes', params }),
    }),

    // Get the next episodes for series that currently don't have an active watch session for the user.
    getDashboardNextUpEpisodes: build.query<Array<DashboardEpisodeDetailsType>, PaginationType>({
      query: params => ({ url: 'NextUpEpisodes', params }),
    }),

    // Get a list of the episodes to continue watching (soon-to-be) in recently watched order
    getDashboardAniDBCalendar: build.query<Array<DashboardEpisodeDetailsType>, { showAll: boolean }>({
      query: params => ({ url: 'AniDBCalendar', params }),
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useGetDashboardSeriesSummaryQuery,
  useGetDashboardRecentlyAddedEpisodesQuery,
  useGetDashboardRecentlyAddedSeriesQuery,
  useGetDashboardContinueWatchingEpisodesQuery,
  useGetDashboardNextUpEpisodesQuery,
  useGetDashboardAniDBCalendarQuery,
} = dashboardApi;
