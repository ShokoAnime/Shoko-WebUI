import { useQuery } from '@tanstack/react-query';
import { isEqual } from 'lodash';

import { axios } from '@/core/axios';
import {
  transformAiringCalendar,
  transformAiringProvidersById,
  transformAiringSeasonYears,
  transformAiringSeasons,
} from '@/core/react-query/airing-schedule/helpers';
import { INFINITE_STALE_TIME } from '@/core/util';
import { getAtParam } from '@/core/utilities/clock';

import type {
  AiringCalendarRequestType,
  AiringSeasonRequestType,
  AiringSeasonsByYearRequestType,
  AiringSeasonsRequestType,
} from '@/core/react-query/airing-schedule/types';
import type {
  AiringCalendarDayType,
  AiringChannelType,
  AiringScheduleProviderType,
  AiringTrackPreferenceType,
} from '@/core/types/api/airing-schedule';
import type {
  AiringSeasonType,
  AiringSeasonYearType,
  SeasonSectionType,
  SeasonSummaryType,
  SeasonYearType,
} from '@/core/types/api/airing-season';
import type { ConfigurationInfoType } from '@/core/types/api/configuration';
import type { CalendarEntryType } from '@/core/utilities/airingSchedule';
import type { SeasonKey } from '@/core/utilities/season';

/** The airings by local day and episode, from `GET AiringSchedule/Calendar`, as calendar entries by day. */
export const useAiringCalendarQuery = (params: AiringCalendarRequestType, enabled = true) =>
  useQuery<AiringCalendarDayType[], unknown, Map<string, CalendarEntryType[]>>({
    queryKey: ['airing-schedule', 'calendar', params],
    queryFn: () => axios.get('AiringSchedule/Calendar', { params }),
    select: transformAiringCalendar,
    // The airings change with a provider's sweep, which invalidates them; a view swapped back in keeps them.
    staleTime: 5 * 60_000,
    enabled,
  });

/**
 * The airing schedule providers, from `GET AiringSchedule/Provider`. They change only with the plugins, and saving
 * the airing schedule settings refetches them, so they are read once.
 */
export const useAiringProvidersQuery = () =>
  useQuery<AiringScheduleProviderType[]>({
    queryKey: ['airing-schedule', 'providers'],
    queryFn: () => axios.get('AiringSchedule/Provider'),
    staleTime: INFINITE_STALE_TIME,
  });

/**
 * The airing schedule providers by ID, from the same read as {@link useAiringProvidersQuery}, for a page to share
 * with its entries and cards through `AiringProvidersContext`.
 */
export const useAiringProvidersByIdQuery = () =>
  useQuery<AiringScheduleProviderType[], unknown, Map<string, AiringScheduleProviderType>>({
    queryKey: ['airing-schedule', 'providers'],
    queryFn: () => axios.get('AiringSchedule/Provider'),
    select: transformAiringProvidersById,
    staleTime: INFINITE_STALE_TIME,
  });

export const useAiringChannelsQuery = (enabled = true) =>
  useQuery<AiringChannelType[]>({
    queryKey: ['airing-schedule', 'channels'],
    queryFn: () => axios.get('AiringSchedule/Channel'),
    enabled,
  });

export const useAiringChannelPriorityQuery = () =>
  useQuery<string[]>({
    queryKey: ['airing-schedule', 'channel-priority'],
    queryFn: () => axios.get('AiringSchedule/Channel/Priority'),
  });

/** The hidden channels' IDs, from `GET AiringSchedule/Channel/Hidden`. */
export const useAiringHiddenChannelsQuery = () =>
  useQuery<string[]>({
    queryKey: ['airing-schedule', 'hidden-channels'],
    queryFn: () => axios.get('AiringSchedule/Channel/Hidden'),
  });

export const useAiringTrackPriorityQuery = () =>
  useQuery<AiringTrackPreferenceType[]>({
    queryKey: ['airing-schedule', 'track-priority'],
    queryFn: () => axios.get('AiringSchedule/Track/Priority'),
  });

/**
 * The anime of one season with their next new episode, in the server's default sections and order, from
 * `GET AiringSchedule/Season/{year}/{season}/Sections`. A clock offset reads them as of the shifted time, and a recently
 * aired time, an ISO date-time with an offset, as of that time instead, so the next airings may have aired since.
 */
export const useAiringSeasonSectionsQuery = (
  season: SeasonKey,
  params: AiringSeasonRequestType,
  enabled = true,
  clockOffset: number | null = null,
  recentlyAiredAt: string | null = null,
) =>
  useQuery<SeasonSectionType[]>({
    queryKey: ['airing-schedule', 'season', season.year, season.season, params, clockOffset, recentlyAiredAt],
    queryFn: () =>
      axios.get(`AiringSchedule/Season/${season.year}/${season.season}/Sections`, {
        params: { ...params, at: recentlyAiredAt ?? getAtParam(clockOffset) },
      }),
    // The recently aired time steps on every 15 minutes; the same season keeps its cards until the new read is in.
    placeholderData: (previousData, previousQuery) => {
      const [, , year, name, previousParams, previousOffset] = previousQuery?.queryKey ?? [];
      const isSameRead = year === season.year && name === season.season && isEqual(previousParams, params)
        && previousOffset === clockOffset;
      return isSameRead ? previousData : undefined;
    },
    // The next airings move on as episodes air.
    refetchInterval: 5 * 60_000,
    staleTime: 5 * 60_000,
    enabled,
  });

/** The seasons with anime under the filters, from `GET AiringSchedule/Season`. */
export const useAiringSeasonsQuery = (
  params: AiringSeasonsRequestType,
  enabled = true,
  clockOffset: number | null = null,
) =>
  useQuery<AiringSeasonType[], unknown, SeasonSummaryType[]>({
    queryKey: ['airing-schedule', 'seasons', params, clockOffset],
    queryFn: () => axios.get('AiringSchedule/Season', { params: { ...params, at: getAtParam(clockOffset) } }),
    select: transformAiringSeasons,
    enabled,
  });

/** The years with anime under the filters, newest first, with their seasons, from `GET AiringSchedule/Season/ByYear`. */
export const useAiringSeasonsByYearQuery = (
  params: AiringSeasonsByYearRequestType,
  enabled = true,
  clockOffset: number | null = null,
) =>
  useQuery<AiringSeasonYearType[], unknown, SeasonYearType[]>({
    queryKey: ['airing-schedule', 'seasons-by-year', params, clockOffset],
    queryFn: () => axios.get('AiringSchedule/Season/ByYear', { params: { ...params, at: getAtParam(clockOffset) } }),
    select: transformAiringSeasonYears,
    // The seasons' counts change as anime are added, rarely; opening the browser again keeps them.
    staleTime: 60 * 60_000,
    enabled,
  });

/** The airing schedule service's own configuration, whose ID the configuration routes take. */
export const useAiringScheduleConfigurationQuery = () =>
  useQuery<ConfigurationInfoType>({
    queryKey: ['airing-schedule', 'configuration'],
    queryFn: () => axios.get('AiringSchedule/Configuration'),
  });
