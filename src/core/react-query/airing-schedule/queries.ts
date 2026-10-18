import { skipToken, useQuery } from '@tanstack/react-query';

import { axios } from '@/core/axios';
import { transformAiringCalendar, transformAiringSeasonYears } from '@/core/react-query/airing-schedule/helpers';
import { INFINITE_STALE_TIME } from '@/core/util';

import type {
  AiringCalendarRequestType,
  AiringSeasonBodyType,
  AiringSeasonRequestType,
  AiringSeasonsByYearRequestType,
  CalendarEntryType,
  SeasonYearType,
} from '@/core/react-query/airing-schedule/types';
import type { AiringCalendarDayType, AiringScheduleProviderType } from '@/core/types/api/airing-schedule';
import type {
  AiringSeasonYearType,
  SeasonKey,
  SeasonSectionDefinitionType,
  SeasonSectionType,
} from '@/core/types/api/airing-season';

export const useAiringCalendarQuery = (params: AiringCalendarRequestType, enabled = true) =>
  useQuery<AiringCalendarDayType[], unknown, Map<string, CalendarEntryType[]>>({
    queryKey: ['airing-schedule', 'calendar', params],
    queryFn: () => axios.get('AiringSchedule/Calendar', { params }),
    select: transformAiringCalendar,
    // The airings change with a provider's sweep, which invalidates them; a view swapped back in keeps them.
    staleTime: 5 * 60_000,
    enabled,
  });

export const useAiringProvidersQuery = () =>
  useQuery<AiringScheduleProviderType[]>({
    queryKey: ['airing-schedule', 'providers'],
    queryFn: () => axios.get('AiringSchedule/Provider'),
    staleTime: INFINITE_STALE_TIME,
  });

/**
 * The anime of one season with their next new episode, by section and sorted by next airing, from
 * `POST AiringSchedule/Season/{year}/{season}/Sections` with the user's layout, or `null` for the server's default.
 * Every section of the layout comes back, empty ones included. With `asOf`, an ISO date-time with an offset, they are
 * read as of that time instead of now (the server's `at`), so the next airings may have aired since.
 */
export const useAiringSeasonSectionsQuery = (
  season: SeasonKey | undefined,
  params: AiringSeasonRequestType,
  sections: SeasonSectionDefinitionType[] | null,
  asOf?: string,
  enabled = true,
) =>
  useQuery<SeasonSectionType[]>({
    queryKey: ['airing-schedule', 'season', season?.year, season?.season, params, asOf, sections],
    // Without a season, which waits for the season under way to be known, nothing is read.
    queryFn: season
      ? () =>
        axios.post(
          `AiringSchedule/Season/${season.year}/${season.season}/Sections`,
          { Sections: sections } satisfies AiringSeasonBodyType,
          { params: { ...params, at: asOf } },
        )
      : skipToken,
    // The same season keeps its cards while a filter or the layout changes; another season starts over.
    placeholderData: (previousData, previousQuery) => {
      const [, , year, name] = previousQuery?.queryKey ?? [];
      return year === season?.year && name === season?.season ? previousData : undefined;
    },
    refetchInterval: 5 * 60_000,
    staleTime: 5 * 60_000,
    enabled,
  });

/**
 * The years with anime under the filters, newest first, with their seasons, from `POST AiringSchedule/Season/ByYear`
 * with the user's layout, or `null` for the server's default. Only the anime a section of the layout takes are counted.
 * The season under way is marked by the server, which is the only place that knows it.
 */
export const useAiringSeasonsByYearQuery = (
  params: AiringSeasonsByYearRequestType,
  sections: SeasonSectionDefinitionType[] | null,
  enabled = true,
) =>
  useQuery<AiringSeasonYearType[], unknown, SeasonYearType[]>({
    queryKey: ['airing-schedule', 'seasons-by-year', params, sections],
    queryFn: () =>
      axios.post('AiringSchedule/Season/ByYear', { Sections: sections } satisfies AiringSeasonBodyType, { params }),
    select: transformAiringSeasonYears,
    staleTime: 60 * 60_000,
    enabled,
  });

export const useAiringSeasonSectionDefaultsQuery = () =>
  useQuery<SeasonSectionDefinitionType[]>({
    queryKey: ['airing-schedule', 'season-section-defaults'],
    queryFn: () => axios.get('AiringSchedule/Season/Sections/Default'),
    staleTime: INFINITE_STALE_TIME,
  });
