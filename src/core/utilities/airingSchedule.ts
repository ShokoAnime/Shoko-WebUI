import { dayjs } from '@/core/util';
import { getEpisodePrefix } from '@/core/utilities/getEpisodePrefix';

import type { EpisodeAiringType } from '@/core/types/api/airing-schedule';
import type { Dayjs } from 'dayjs';

export type CalendarViewType = 'month' | 'week' | 'agenda';

/** An airing placed on the calendar, at the slot that falls in the shown period. */
export type CalendarEntryType = {
  airing: EpisodeAiringType;
  /** The start of the day for a date-only airing. */
  time: Dayjs;
  /** A date-only airing, shown for the whole day. */
  isAllDay: boolean;
  /** Set when the airing is shown at the slot it was moved out of. */
  movedTo: Dayjs | null;
  /** Set when the airing is shown at its new slot, after a delay. */
  movedFrom: Dayjs | null;
  /** The other airings of the same episode on the same day, shown with this one. */
  others: CalendarEntryType[];
};

export const DAY_KEY_FORMAT = 'YYYY-MM-DD';

/** Weeks start on Monday, the way broadcast schedules are laid out. */
export const startOfWeek = (date: Dayjs) => date.subtract((date.day() + 6) % 7, 'day').startOf('day');

/** The weeks the month grid always shows, so its height stays the same from month to month. */
const MONTH_GRID_WEEKS = 6;

/**
 * The local period a view shows, as `[start, end)`. The month grid shows six whole weeks from the one with the month's
 * first day, the agenda the month itself.
 */
export const getCalendarPeriod = (view: CalendarViewType, date: Dayjs) => {
  if (view === 'week') {
    const start = startOfWeek(date);
    return { start, end: start.add(1, 'week') };
  }

  const monthStart = date.startOf('month');
  if (view === 'agenda') return { start: monthStart, end: monthStart.add(1, 'month') };

  const start = startOfWeek(monthStart);
  return { start, end: start.add(MONTH_GRID_WEEKS, 'week') };
};

export const getPeriodUnit = (view: CalendarViewType) => (view === 'week' ? 'week' : 'month');

/** A shown period's text, a key that sorts it among its view's periods, and the view it belongs to. */
export type SlidingTextType = { order: number, resetKey: string, text: string };

export type SlideDirectionType = 'forward' | 'backward';

/** Which way the shown text slides as it changes; none on a view switch, or when the text or its place stay put. */
export const getSlideDirection = (from: SlidingTextType, to: SlidingTextType): SlideDirectionType | null => {
  if (from.resetKey !== to.resetKey || from.text === to.text || from.order === to.order) return null;
  return to.order > from.order ? 'forward' : 'backward';
};

/** The local period as the `from` (inclusive) and `to` (exclusive) instants of `GET AiringSchedule/Calendar`. */
export const toAiringRequestDates = (start: Dayjs, end: Dayjs) => ({
  from: start.format(),
  to: end.format(),
});

/** Every local day from `start` up to `end`. */
export const getPeriodDays = (start: Dayjs, end: Dayjs) => {
  const days: Dayjs[] = [];
  for (let day = start; day.isBefore(end); day = day.add(1, 'day')) days.push(day);
  return days;
};

/** A row of the agenda's virtual list: a day's heading, or one of its entries. */
export type AgendaRowType =
  | { type: 'day', key: string, day: Dayjs, isDayEnd: boolean }
  | { type: 'entry', key: string, entry: CalendarEntryType, isStriped: boolean, isDayEnd: boolean };

/**
 * The period's days with entries as one list of rows: each day's heading, then its entries, every other one striped.
 * A day in the map without entries keeps its heading, which then ends the day.
 */
export const getAgendaRows = (start: Dayjs, end: Dayjs, entries: Map<string, CalendarEntryType[]>) =>
  getPeriodDays(start, end).flatMap((day): AgendaRowType[] => {
    const dayKey = day.format(DAY_KEY_FORMAT);
    const dayEntries = entries.get(dayKey);
    if (!dayEntries) return [];
    return [
      { type: 'day', key: dayKey, day, isDayEnd: dayEntries.length === 0 },
      ...dayEntries.map((entry, index) => ({
        type: 'entry' as const,
        key: `${dayKey}-${entry.airing.ID}`,
        entry,
        isStriped: index % 2 === 1,
        isDayEnd: index === dayEntries.length - 1,
      })),
    ];
  });

export const getAiringShokoSeriesId = (airing: EpisodeAiringType) =>
  airing.Series?.ShokoID ?? airing.IDs.ShokoSeries ?? null;

export const getAiringAnidbAnimeId = (airing: EpisodeAiringType) =>
  airing.Series?.AnidbID ?? airing.IDs.AnidbAnime ?? null;

/** The muted hint shown with an unresolved airing, whose episode AniDB does not list yet. */
export const UNRESOLVED_AIRING_HINT = 'Not on AniDB yet';

/** `5 - Title`, `S2 - Title`, or whatever part of it is known; `Ep 14` for an unresolved airing. */
export const getAiringEpisodeLabel = (airing: EpisodeAiringType) => {
  if (!airing.IsResolved) return airing.Number === null ? '' : `Ep ${airing.Number}`;
  const number = airing.Number === null ? null : `${getEpisodePrefix(airing.Type ?? undefined)}${airing.Number}`;
  if (number && airing.EpisodeTitle) return `${number} - ${airing.EpisodeTitle}`;
  return number ?? airing.EpisodeTitle ?? '';
};

/** The local files of the airing's episode; none for an unresolved airing, which has no episode yet. */
export const getAiringVideoCount = (airing: EpisodeAiringType) => (airing.IsResolved ? airing.VideoCount : 0);

/** The browser's IANA time zone, which every time of the airing schedule is shown in. */
export const getLocalTimeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

/** The whole days until `day`: `Today`, `Tomorrow` or `4 days`. */
export const formatDayCountdown = (day: Dayjs, now: Dayjs) => {
  const days = Math.max(day.startOf('day').diff(now.startOf('day'), 'day'), 0);
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `${days} days`;
};

/** The two largest units of the time left until `target`, eg. `19 hours, 18 mins`. */
export const formatCountdown = (target: Dayjs, now: Dayjs) => {
  const totalMinutes = Math.max(target.diff(now, 'minute'), 0);
  const parts = [
    { value: Math.floor(totalMinutes / 1440), unit: 'day' },
    { value: Math.floor((totalMinutes % 1440) / 60), unit: 'hour' },
    { value: totalMinutes % 60, unit: 'min' },
  ];
  const firstIndex = parts.findIndex(part => part.value > 0);
  if (firstIndex === -1) return 'now';
  return parts
    .slice(firstIndex, firstIndex + 2)
    .filter(part => part.value > 0)
    .map(part => `${part.value} ${part.unit}${part.value === 1 ? '' : 's'}`)
    .join(', ');
};

/** When an airing airs, or the start of its day when only its AniDB air date is known. */
export const getAiringDisplayTime = (
  airing: EpisodeAiringType,
) => (airing.IsDateOnly ? dayjs(airing.AirDate, DAY_KEY_FORMAT) : dayjs(airing.AiredAt ?? airing.OriginalAiredAt));

/** The airing as a calendar entry at its display time, for the season cards. */
export const toCalendarEntry = (airing: EpisodeAiringType): CalendarEntryType => {
  const isMoved = airing.IsDelayed && !!airing.AiredAt && !!airing.OriginalAiredAt
    && airing.AiredAt !== airing.OriginalAiredAt;
  return {
    airing,
    time: getAiringDisplayTime(airing),
    isAllDay: airing.IsDateOnly,
    movedTo: null,
    movedFrom: isMoved ? dayjs(airing.OriginalAiredAt) : null,
    others: [],
  };
};

/** Whether the airing is on air: from its `AiredAt` until its `EndsAt`. A date-only airing never is. */
export const isAiringNow = (airing: EpisodeAiringType, now: Dayjs) =>
  !!airing.AiredAt && !!airing.EndsAt && !now.isBefore(airing.AiredAt) && now.isBefore(airing.EndsAt);

/** Whether the airing's slot is over, or it started when its end is unknown. */
export const hasAiringEnded = (airing: EpisodeAiringType, now: Dayjs) => {
  const end = airing.EndsAt ?? airing.AiredAt;
  return !!end && !now.isBefore(end);
};

/** A server time span, eg. `00:24:00` or `1.02:00:00`, in whole minutes; `null` when there is none. */
export const parseTimeSpanMinutes = (value: string | null) => {
  const match = value?.match(/^(?:(\d+)\.)?(\d+):(\d+):(\d+)/);
  if (!match) return null;
  const [, days = '0', hours, minutes] = match;
  return Number(days) * 1440 + Number(hours) * 60 + Number(minutes);
};
