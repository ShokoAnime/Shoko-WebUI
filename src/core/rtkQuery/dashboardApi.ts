import { splitV3Api } from './splitV3Api';

import type { PaginationType } from '../types/api';
import type { DashboardStatsType, DashboardSeriesSummaryType, DashboardEpisodeDetailsType } from '../types/api/dashboard';
import type { SeriesType } from '../types/api/series';

const dashboardApi = splitV3Api.injectEndpoints({
  // refetchOnMountOrArgChange: true, // Refresh stats on component mount/page refresh (I think it works correctly)
  endpoints: build => ({

    // Get the counters of various collection stats
    getDashboardStats: build.query<DashboardStatsType, void>({
      query: () => ({ url: 'Dashboard/Stats' }),
      providesTags: ['EpisodeUpdated', 'FileDeleted', 'FileHashed', 'FileIgnored', 'FileMatched', 'SeriesUpdated'],
    }),

    // Gets a breakdown of which types of anime the user has access to
    getDashboardSeriesSummary: build.query<DashboardSeriesSummaryType, void>({
      query: () => ({ url: 'Dashboard/SeriesSummary' }),
      transformResponse: (response: DashboardSeriesSummaryType) => {
        const result = response;
        result.Other += (result?.Special ?? 0) + (result?.None ?? 0);
        delete result.Special;
        delete result.None;
        return result;
      },
      providesTags: ['SeriesUpdated'],
    }),

    // Get a list of recently added episodes (with additional details).
    getDashboardRecentlyAddedEpisodes: build.query<Array<DashboardEpisodeDetailsType>, PaginationType>({
      query: params => ({ url: 'Dashboard/RecentlyAddedEpisodes', params }),
      providesTags: ['EpisodeUpdated', 'FileDeleted', 'FileMatched'],
    }),

    // Get a list of recently added series.
    getDashboardRecentlyAddedSeries: build.query<Array<SeriesType>, PaginationType>({
      query: params => ({ url: 'Dashboard/RecentlyAddedSeries', params }),
      providesTags: ['FileDeleted', 'FileMatched', 'SeriesUpdated'],
    }),

    // Get a list of the episodes to continue watching in recently watched order
    getDashboardContinueWatchingEpisodes: build.query<Array<DashboardEpisodeDetailsType>, PaginationType>({
      query: params => ({ url: 'Dashboard/ContinueWatchingEpisodes', params }),
      providesTags: ['EpisodeUpdated', 'FileDeleted', 'SeriesUpdated'],
    }),

    // Get the next episodes for series that currently don't have an active watch session for the user.
    getDashboardNextUpEpisodes: build.query<Array<DashboardEpisodeDetailsType>, PaginationType>({
      query: params => ({ url: 'Dashboard/NextUpEpisodes', params }),
      providesTags: ['EpisodeUpdated', 'FileDeleted', 'FileMatched', 'SeriesUpdated'],
    }),

    // Get a list of the episodes to continue watching (soon-to-be) in recently watched order
    getDashboardAniDBCalendar: build.query<Array<DashboardEpisodeDetailsType>, { showAll: boolean }>({
      query: params => ({ url: 'Dashboard/AniDBCalendar', params }),
      providesTags: ['SeriesUpdated'],
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
