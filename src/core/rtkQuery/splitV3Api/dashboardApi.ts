import { splitV3Api } from '@/core/rtkQuery/splitV3Api';

import type { DashboardPaginationType } from '@/core/types/api';
import type {
  DashboardEpisodeDetailsType,
  DashboardSeriesSummaryType,
  DashboardStatsType,
} from '@/core/types/api/dashboard';
import type { SeriesType } from '@/core/types/api/series';

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
    getDashboardRecentlyAddedEpisodes: build.query<DashboardEpisodeDetailsType[], DashboardPaginationType>({
      query: params => ({ url: 'Dashboard/RecentlyAddedEpisodes', params }),
      providesTags: ['EpisodeUpdated', 'FileDeleted', 'FileMatched'],
    }),

    // Get a list of recently added series.
    getDashboardRecentlyAddedSeries: build.query<SeriesType[], DashboardPaginationType>({
      query: params => ({ url: 'Dashboard/RecentlyAddedSeries', params }),
      providesTags: ['FileDeleted', 'FileMatched', 'SeriesUpdated'],
    }),

    // Get a list of the episodes to continue watching in recently watched order
    getDashboardContinueWatchingEpisodes: build.query<DashboardEpisodeDetailsType[], DashboardPaginationType>({
      query: params => ({ url: 'Dashboard/ContinueWatchingEpisodes', params }),
      providesTags: ['EpisodeUpdated', 'FileDeleted', 'SeriesUpdated'],
    }),

    // Get the next episodes for series that currently don't have an active watch session for the user.
    getDashboardNextUpEpisodes: build.query<DashboardEpisodeDetailsType[], DashboardPaginationType>({
      query: params => ({ url: 'Dashboard/NextUpEpisodes', params }),
      providesTags: ['EpisodeUpdated', 'FileDeleted', 'FileMatched', 'SeriesUpdated'],
    }),

    // Get a list of the episodes to continue watching (soon-to-be) in recently watched order
    getDashboardAniDBCalendar: build.query<
      DashboardEpisodeDetailsType[],
      { includeRestricted: boolean, showAll: boolean }
    >({
      query: params => ({ url: 'Dashboard/AniDBCalendar', params }),
      providesTags: ['SeriesUpdated'],
    }),
  }),
});

export const {
  useGetDashboardAniDBCalendarQuery,
  useGetDashboardContinueWatchingEpisodesQuery,
  useGetDashboardNextUpEpisodesQuery,
  useGetDashboardRecentlyAddedEpisodesQuery,
  useGetDashboardRecentlyAddedSeriesQuery,
  useGetDashboardSeriesSummaryQuery,
  useGetDashboardStatsQuery,
} = dashboardApi;
