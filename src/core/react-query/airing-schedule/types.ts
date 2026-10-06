import type { IncludeOnlyFilterType } from '@/core/react-query/types';
import type { AiringKindType, EpisodeAiringKindType } from '@/core/types/api/airing-schedule';

export type AiringDataToIncludeType = 'EpisodeTitle' | 'Series' | 'Poster' | 'Thumbnail';

/** The query of `GET AiringSchedule/Calendar`, which groups the airings by local day and episode. */
export type AiringCalendarRequestType = {
  /** ISO 8601 date-time with an offset; inclusive. */
  from: string;
  /** ISO 8601 date-time with an offset; exclusive. */
  to: string;
  /** The IANA time zone the days are in. */
  timeZone: string;
  /** Keep each episode's other airings of the day, or only its lead. */
  everyChannel: boolean;
  kind?: AiringKindType[];
  /** Provider IDs. */
  provider?: string[];
  /** Series with a Shoko series, or every series. */
  inCollection?: IncludeOnlyFilterType;
  /** Include the episodes known only by an AniDB air date. */
  includeDateOnly?: boolean;
  /** Only these kinds of showing; every kind when left out. */
  episodeKind?: EpisodeAiringKindType[];
  includeRestricted?: IncludeOnlyFilterType;
  includeEstimates?: boolean;
  /** Comma-separated channel IDs, hidden ones included; the visible channels when left out. */
  channel?: string;
  include?: AiringDataToIncludeType[];
};
