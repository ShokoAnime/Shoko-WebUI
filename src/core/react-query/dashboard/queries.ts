import { useQuery } from '@tanstack/react-query';

import { axios } from '@/core/axios';
import { transformSeriesSummary } from '@/core/react-query/dashboard/helpers';
import { transformListResultSimplified } from '@/core/react-query/helpers';

import type {
  DashboardCalendarRequestType,
  DashboardContinueWatchingRequestType,
  DashboardNextUpRequestType,
} from '@/core/react-query/dashboard/types';
import type { DashboardRequestType } from '@/core/react-query/types';
import type { ListResultType } from '@/core/types/api';
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
  useQuery<ListResultType<DashboardEpisodeDetailsType>, unknown, DashboardEpisodeDetailsType[]>({
    queryKey: ['dashboard', 'continue-watching', params],
    queryFn: () => axios.get('Dashboard/ContinueWatchingEpisodes', { params }),
    select: transformListResultSimplified,
  });

export const useDashboardNextUpQuery = (params: DashboardNextUpRequestType) =>
  useQuery<ListResultType<DashboardEpisodeDetailsType>, unknown, DashboardEpisodeDetailsType[]>({
    queryKey: ['dashboard', 'next-up', params],
    queryFn: () => axios.get('Dashboard/NextUpEpisodes', { params }),
    select: transformListResultSimplified,
  });

export const useDashboardRecentlyAddedEpisodesQuery = (params: DashboardRequestType) =>
  useQuery<ListResultType<DashboardEpisodeDetailsType>, unknown, DashboardEpisodeDetailsType[]>({
    queryKey: ['dashboard', 'recently-added-episodes', params],
    queryFn: () => axios.get('Dashboard/RecentlyAddedEpisodes', { params }),
    select: transformListResultSimplified,
  });

export const useDashboardRecentlyAddedSeriesQuery = (params: DashboardRequestType) =>
  useQuery<ListResultType<SeriesType>, unknown, SeriesType[]>({
    queryKey: ['dashboard', 'recently-added-series', params],
    queryFn: () => axios.get('Dashboard/RecentlyAddedSeries', { params }),
    select: transformListResultSimplified,
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
