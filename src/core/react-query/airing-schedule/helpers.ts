import { dayjs } from '@/core/util';

import type { CalendarEntryType, SeasonSummaryType, SeasonYearType } from '@/core/react-query/airing-schedule/types';
import type { AiringCalendarDayType, AiringCalendarEntryType } from '@/core/types/api/airing-schedule';
import type { AiringSeasonType, AiringSeasonYearType } from '@/core/types/api/airing-season';

const transformCalendarEntry = (entry: AiringCalendarEntryType): CalendarEntryType => ({
  airing: entry.Airing,
  time: dayjs(entry.Time),
  isAllDay: entry.IsAllDay,
  movedTo: entry.MovedTo ? dayjs(entry.MovedTo) : null,
  movedFrom: entry.MovedFrom ? dayjs(entry.MovedFrom) : null,
});

export const transformAiringCalendar = (days: AiringCalendarDayType[]) =>
  new Map(days.map(day => [day.Date, day.Episodes.map(episode => transformCalendarEntry(episode.Lead))]));

const transformAiringSeason = (item: AiringSeasonType): SeasonSummaryType => ({
  key: { year: item.Year, season: item.AnimeSeason },
  count: item.Count,
  isCurrent: item.IsCurrent,
  poster: item.Poster ?? null,
  backdrop: item.Backdrop ?? null,
});

export const transformAiringSeasonYears = (years: AiringSeasonYearType[]): SeasonYearType[] =>
  years.map(item => ({ year: item.Year, seasons: item.Seasons.map(transformAiringSeason) }));
