import { chunk, range } from 'lodash';

import { dayjs, formatDate, getPartialDateEnd } from '@/core/util';
import { getEpisodePrefix } from '@/core/utilities/getEpisodePrefix';

import type { CalendarEntryType } from '@/core/react-query/airing-schedule/types';
import type { AiringKindType, EpisodeAiringType } from '@/core/types/api/airing-schedule';
import type { SeasonAnimeType, SeasonSectionDefinitionType, SeasonSectionType } from '@/core/types/api/airing-season';
import type { AnimeTypeValues } from '@/core/types/api/series';
import type { Dayjs } from '@/core/util';

export type CalendarViewType = 'month' | 'week' | 'agenda';

export const CALENDAR_VIEWS: CalendarViewType[] = ['month', 'week', 'agenda'];

export const AIRING_KINDS: AiringKindType[] = ['Original', 'Subtitled', 'Dubbed'];

export const DAY_KEY_FORMAT = 'YYYY-MM-DD';

/** The weeks the month grid always shows, so its height stays the same from month to month. */
const MONTH_GRID_WEEKS = 6;

/** Weeks start on Monday, the way broadcast schedules are laid out. */
const startOfWeek = (date: Dayjs) => date.subtract((date.day() + 6) % 7, 'day').startOf('day');

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

export const getPeriodTitle = (view: CalendarViewType, date: Dayjs, start: Dayjs, end: Dayjs) => {
  if (view !== 'week') return date.format('MMMM YYYY');
  const last = end.subtract(1, 'day');
  if (start.isSame(last, 'month')) return `${start.format('MMMM D')} - ${last.format('D, YYYY')}`;
  if (start.isSame(last, 'year')) return `${start.format('MMMM D')} - ${last.format('MMMM D, YYYY')}`;
  return `${start.format('MMMM D, YYYY')} - ${last.format('MMMM D, YYYY')}`;
};

export const getPeriodUnit = (view: CalendarViewType) => (view === 'week' ? 'week' : 'month');

export const getPeriodDays = (start: Dayjs, end: Dayjs) =>
  range(end.diff(start, 'day')).map(offset => start.add(offset, 'day'));

export const getLocalTimeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

export const getAiringDisplayTime = (
  airing: EpisodeAiringType,
) => (airing.IsDateOnly ? dayjs(airing.AirDate, DAY_KEY_FORMAT) : dayjs(airing.AiredAt ?? airing.OriginalAiredAt));

export const isAiringNow = (airing: EpisodeAiringType, now: Dayjs) =>
  !!airing.AiredAt && !!airing.EndsAt && !now.isBefore(airing.AiredAt) && now.isBefore(airing.EndsAt);

export const hasAiringEnded = (airing: EpisodeAiringType, now: Dayjs) => {
  const end = airing.EndsAt ?? airing.AiredAt;
  return !!end && !now.isBefore(end);
};

/**
 * The two largest units of the time left until `target`, eg. `19 hours, 18 mins`; `now` when there is none. It counts
 * from the total minutes, because a dayjs duration folds 30 days or more into months and its parts then mislead.
 */
export const formatCountdown = (target: Dayjs, now: Dayjs) => {
  const minutes = Math.max(target.diff(now, 'minute'), 0);
  const parts = [
    { value: Math.floor(minutes / 1440), unit: 'day' },
    { value: Math.floor(minutes / 60) % 24, unit: 'hour' },
    { value: minutes % 60, unit: 'min' },
  ];
  const firstIndex = parts.findIndex(part => part.value > 0);
  if (firstIndex === -1) return 'now';
  return parts
    .slice(firstIndex, firstIndex + 2)
    .filter(part => part.value > 0)
    .map(part => `${part.value} ${part.unit}${part.value === 1 ? '' : 's'}`)
    .join(', ');
};

export const formatTimeSince = (target: Dayjs, now: Dayjs) => {
  const since = formatCountdown(now, target);
  return since === 'now' ? 'Just now' : `${since} ago`;
};

export const formatDayCountdown = (day: Dayjs, now: Dayjs) => {
  const days = Math.max(day.startOf('day').diff(now.startOf('day'), 'day'), 0);
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `${days} days`;
};

export const formatDaysSince = (day: Dayjs, now: Dayjs) => {
  const days = Math.max(now.startOf('day').diff(day.startOf('day'), 'day'), 0);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
};

export const UNRESOLVED_AIRING_HINT = 'Not on AniDB yet';

export const getAiringEpisodeNumber = (
  airing: EpisodeAiringType,
) => (airing.Number === null ? null : `${getEpisodePrefix(airing.Type ?? undefined)}${airing.Number}`);

/** `5 - Title`, `S2 - Title`, or whatever part of it is known; `Ep 14` for an unresolved airing. */
export const getAiringEpisodeLabel = (airing: EpisodeAiringType) => {
  const number = getAiringEpisodeNumber(airing);
  if (!airing.IsResolved) return number === null ? '' : `Ep ${number}`;
  if (number && airing.EpisodeTitle) return `${number} - ${airing.EpisodeTitle}`;
  return number ?? airing.EpisodeTitle ?? '';
};

export const getAiringSeriesIds = (airing: EpisodeAiringType) => ({
  anidbId: airing.Series?.AnidbID ?? airing.IDs.AnidbAnime,
  shokoId: airing.Series?.ShokoID ?? airing.IDs.ShokoSeries,
});

export type AgendaRowType =
  | { type: 'day', key: string, day: Dayjs, isDayEnd: boolean }
  | { type: 'entry', key: string, entry: CalendarEntryType, isStriped: boolean, isDayEnd: boolean };

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

const SLOT_FORMAT = 'ddd, MMM D, HH:mm';

export const getEntryBadges = ({ airing, movedFrom, movedTo }: CalendarEntryType) => {
  const badges: { text: string, tooltip: string, warning?: boolean }[] = [];
  if (movedTo) badges.push({ text: 'Moved', tooltip: `Moved to ${movedTo.format(SLOT_FORMAT)}`, warning: true });
  if (movedFrom) {
    badges.push({ text: 'Delayed', tooltip: `Delayed from ${movedFrom.format(SLOT_FORMAT)}`, warning: true });
  }
  if (airing.Kind === 'Advance') badges.push({ text: 'Advance', tooltip: 'An advance screening' });
  if (airing.Kind === 'Rerun') badges.push({ text: 'Rerun', tooltip: 'A rerun, as the provider marked it' });
  if (airing.Kind === 'DetectedRerun') badges.push({ text: 'Rerun', tooltip: 'A rerun, as Shoko detected it' });
  if (airing.IsEstimated) badges.push({ text: 'Estimated', tooltip: 'Estimated from the schedule' });
  return badges;
};

export const formatEntryTime = (entry: CalendarEntryType) => (entry.isAllDay ? 'All Day' : entry.time.format('HH:mm'));

export const getEntrySource = (
  { IsDateOnly, Source }: EpisodeAiringType,
) => (IsDateOnly ? 'AniDB air date' : (Source?.Name ?? ''));

export const formatLocalFiles = (count: number) => `${count} local ${count === 1 ? 'file' : 'files'}`;

export type SeasonGridRowType =
  | { type: 'title', key: string, section: SeasonSectionType }
  | { type: 'cards', key: string, anime: SeasonAnimeType[], isSectionEnd: boolean };

export const getSeasonGridRows = (sections: SeasonSectionType[], columns: number): SeasonGridRowType[] =>
  sections.flatMap((section, sectionIndex) => {
    if (section.Anime.length === 0) return [];
    const rows = chunk(section.Anime, columns);
    return [
      { type: 'title', key: `title-${sectionIndex}`, section } as const,
      ...rows.map((anime, index) => ({
        type: 'cards',
        key: `cards-${sectionIndex}-${index}`,
        anime,
        isSectionEnd: index === rows.length - 1,
      } as const)),
    ];
  });

export const getSeasonAnimeLabel = (anime: SeasonAnimeType, now: Dayjs) => {
  const { AirDate: airDate, EndDate: endDate } = anime;
  const finished = endDate ? `Finished ${formatDate(endDate)}` : 'Finished';
  if (anime.AiringStatus === 'Finished') return finished;
  // A partial end date, such as a year, is over only once its last day is.
  if (endDate && getPartialDateEnd(endDate).isBefore(now)) return finished;
  if (airDate && dayjs(airDate).isAfter(now)) return `Starts ${formatDate(airDate)}`;
  if (airDate) return `Airing since ${formatDate(airDate)}`;
  return 'Air date unknown';
};

export const ANIME_TYPE_OPTIONS: { label: string, value: AnimeTypeValues }[] = [
  { label: 'TV', value: 'TV' },
  { label: 'TV Special', value: 'TVSpecial' },
  { label: 'Web', value: 'Web' },
  { label: 'Movie', value: 'Movie' },
  { label: 'OVA', value: 'OVA' },
  { label: 'Music Video', value: 'MusicVideo' },
  { label: 'Other', value: 'Other' },
  { label: 'Unknown', value: 'Unknown' },
];

/** A section without a condition takes every anime no earlier section took, so none reaches a section after it. */
export const isRestSection = (section: SeasonSectionDefinitionType) =>
  section.Types === null && section.Continuing === null && section.HalfLength === null;

export const getSectionSummary = (section: SeasonSectionDefinitionType) => {
  const types = section.Types === null
    ? 'Every type'
    : section.Types.map(type => ANIME_TYPE_OPTIONS.find(option => option.value === type)?.label ?? type).join(', ');
  const parts = [types];
  if (section.Continuing !== null) parts.push(section.Continuing ? 'Continuing' : 'Not continuing');
  if (section.HalfLength !== null) parts.push(section.HalfLength ? 'Half length' : 'Full length');
  return parts.join(' · ');
};
