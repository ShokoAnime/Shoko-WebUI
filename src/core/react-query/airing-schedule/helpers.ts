import { dayjs } from '@/core/util';

import type {
  AiringCalendarDayType,
  AiringCalendarEntryType,
  AiringScheduleProviderType,
} from '@/core/types/api/airing-schedule';
import type { CalendarEntryType } from '@/core/utilities/airingSchedule';

/** Where the server serves an airing provider's icon, as SVG or PNG. */
export const getAiringProviderIconUrl = (providerId: string) =>
  `/api/v3/AiringSchedule/Provider/${encodeURIComponent(providerId)}/Icon`;

/** The providers of `GET AiringSchedule/Provider` by ID. */
export const transformAiringProvidersById = (providers: AiringScheduleProviderType[]) =>
  new Map(providers.map(provider => [provider.ID, provider]));

const transformCalendarEntry = (
  entry: AiringCalendarEntryType,
  others: CalendarEntryType[] = [],
): CalendarEntryType => ({
  airing: entry.Airing,
  time: dayjs(entry.Time),
  isAllDay: entry.IsAllDay,
  movedTo: entry.MovedTo ? dayjs(entry.MovedTo) : null,
  movedFrom: entry.MovedFrom ? dayjs(entry.MovedFrom) : null,
  others,
});

/** The days of `GET AiringSchedule/Calendar` by local date (`DAY_KEY_FORMAT`), in order, one entry per episode. */
export const transformAiringCalendar = (days: AiringCalendarDayType[]) =>
  new Map(
    days.map(day => [
      day.Date,
      day.Episodes.map(episode =>
        transformCalendarEntry(episode.Lead, episode.Others.map(other => transformCalendarEntry(other)))
      ),
    ]),
  );
