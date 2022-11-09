import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import type { RootState } from '../store';
import type { PaginationType } from '../types/api';
import type { DashboardStatsType, DashboardSeriesSummaryType, DashboardEpisodeDetailsType } from '../types/api/dashboard';
import type { SeriesType } from '../types/api/series';

export const dashboardApi = createApi({
  reducerPath: 'dashboard',
  tagTypes: ['Series', 'Episode', 'FileMatch', 'FileHash', 'FileDelete'],
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v3/Dashboard/',
    prepareHeaders: (headers, { getState }) => {
      const apikey = (getState() as RootState).apiSession.apikey;
      headers.set('apikey', apikey);
      return headers;
    },
  }),
  refetchOnMountOrArgChange: true, // Refresh stats on component mount/page refresh (I think it works correctly)
  endpoints: build => ({

    // Get the counters of various collection stats
    getDashboardStats: build.query<DashboardStatsType, void>({
      query: () => ({ url: 'Stats' }),
      providesTags: ['Series', 'Episode', 'FileMatch', 'FileHash', 'FileDelete'],
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
      providesTags: ['Series'],
    }),

    // Get a list of recently added episodes (with additional details).
    getDashboardRecentlyAddedEpisodes: build.query<Array<DashboardEpisodeDetailsType>, PaginationType>({
      query: params => ({ url: 'RecentlyAddedEpisodes', params }),
      providesTags: ['Episode', 'FileMatch', 'FileDelete'],
    }),

    // Get a list of recently added series.
    getDashboardRecentlyAddedSeries: build.query<Array<SeriesType>, PaginationType>({
      query: params => ({ url: 'RecentlyAddedSeries', params }),
      providesTags: ['Series', 'FileMatch', 'FileDelete'],
    }),

    // Get a list of the episodes to continue watching in recently watched order
    getDashboardContinueWatchingEpisodes: build.query<Array<DashboardEpisodeDetailsType>, PaginationType>({
      query: params => ({ url: 'ContinueWatchingEpisodes', params }),
      providesTags: ['Series', 'Episode', 'FileDelete'],
    }),

    // Get the next episodes for series that currently don't have an active watch session for the user.
    getDashboardNextUpEpisodes: build.query<Array<DashboardEpisodeDetailsType>, PaginationType>({
      query: params => ({ url: 'NextUpEpisodes', params }),
      providesTags: ['Series', 'Episode', 'FileMatch', 'FileDelete'],
    }),

    // Get a list of the episodes to continue watching (soon-to-be) in recently watched order
    getDashboardAniDBCalendar: build.query<Array<DashboardEpisodeDetailsType>, { showAll: boolean }>({
      query: params => ({ url: 'AniDBCalendar', params }),
      providesTags: ['Series'],
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
