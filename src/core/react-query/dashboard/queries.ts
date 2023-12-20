import { useQuery } from '@tanstack/react-query';

import { axios } from '@/core/axios';
import { transformSeriesSummary } from '@/core/react-query/dashboard/helpers';

import type {
  DashboardCalendarRequestType,
  DashboardContinueWatchingRequestType,
  DashboardNextUpRequestType,
} from '@/core/react-query/dashboard/types';
import type { DashboardRequestType } from '@/core/react-query/types';
import type {
  DashboardEpisodeDetailsType,
  DashboardSeriesSummaryType,
  DashboardStatsType,
} from '@/core/types/api/dashboard';
import type { SeriesType } from '@/core/types/api/series';

export const useDashboardCalendarQuery = (params: DashboardCalendarRequestType) =>
  useQuery<DashboardEpisodeDetailsType[]>({
    queryKey: ['dashboard', 'calendar', params],
    queryFn: () => axios.get('Dashboard/AniDBCalendar', { params }),
  });

export const useDashboardContinueWatchingQuery = (params: DashboardContinueWatchingRequestType) =>
  useQuery<DashboardEpisodeDetailsType[]>({
    queryKey: ['dashboard', 'continue-watching', params],
    queryFn: () => axios.get('Dashboard/ContinueWatchingEpisodes', { params }),
  });

export const useDashboardNextUpQuery = (params: DashboardNextUpRequestType) =>
  useQuery<DashboardEpisodeDetailsType[]>({
    queryKey: ['dashboard', 'next-up', params],
    queryFn: () => axios.get('Dashboard/NextUpEpisodes', { params }),
  });

export const useDashboardRecentlyAddedEpisodesQuery = (params: DashboardRequestType) =>
  useQuery<DashboardEpisodeDetailsType[]>({
    queryKey: ['dashboard', 'recently-added-episodes', params],
    queryFn: () => axios.get('Dashboard/RecentlyAddedEpisodes', { params }),
  });

export const useDashboardRecentlyAddedSeriesQuery = (params: DashboardRequestType) =>
  useQuery<SeriesType[]>({
    queryKey: ['dashboard', 'recently-added-series', params],
    queryFn: () => axios.get('Dashboard/RecentlyAddedSeries', { params }),
  });

export const useDashboardSeriesSummaryQuery = () =>
  useQuery<DashboardSeriesSummaryType>({
    queryKey: ['dashboard', 'series-summary'],
    queryFn: () => axios.get('Dashboard/SeriesSummary'),
    select: transformSeriesSummary,
  });

export const useDashbordStatsQuery = () =>
  useQuery<DashboardStatsType>({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => axios.get('Dashboard/Stats'),
  });
