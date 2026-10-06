import { useQuery } from '@tanstack/react-query';

import { axios } from '@/core/axios';
import { transformAiringCalendar, transformAiringProvidersById } from '@/core/react-query/airing-schedule/helpers';
import { INFINITE_STALE_TIME } from '@/core/util';

import type { AiringCalendarRequestType } from '@/core/react-query/airing-schedule/types';
import type {
  AiringCalendarDayType,
  AiringChannelType,
  AiringScheduleProviderType,
} from '@/core/types/api/airing-schedule';
import type { CalendarEntryType } from '@/core/utilities/airingSchedule';

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
