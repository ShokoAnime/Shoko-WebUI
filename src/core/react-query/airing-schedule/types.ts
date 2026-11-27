import type { IncludeOnlyFilterType } from '@/core/react-query/types';
import type { AiringKindType, EpisodeAiringKindType, EpisodeAiringType } from '@/core/types/api/airing-schedule';
import type { SeasonKey, SeasonSectionDefinitionType } from '@/core/types/api/airing-season';
import type { ImageType } from '@/core/types/api/common';
import type { EpisodeTypeValues } from '@/core/types/api/episode';
import type { Dayjs } from '@/core/util';

/** The query of `GET AiringSchedule/Calendar`, which groups the airings by local day and episode. */
export type AiringCalendarRequestType = {
  /** ISO 8601 date-time with an offset; inclusive. */
  from: string;
  /** ISO 8601 date-time with an offset; exclusive. */
  to: string;
  timeZone: string;
  /** Keep each episode's other airings of the day, or only its lead. */
  everyChannel: boolean;
  kind?: AiringKindType[];
  provider?: string[];
  /** Series with a Shoko series, or every series. */
  inCollection?: IncludeOnlyFilterType;
  includeDateOnly?: boolean;
  /** Only these kinds of showing; every kind when left out. */
  episodeKind?: EpisodeAiringKindType[];
  includeRestricted?: IncludeOnlyFilterType;
  includeEstimates?: boolean;
  /** Only these AniDB episode types; every type when left out. */
  type?: EpisodeTypeValues[];
  include?: ('EpisodeTitle' | 'Series' | 'Poster')[];
};

type AiringSeasonFiltersType = {
  inCollection?: IncludeOnlyFilterType;
  includeRestricted?: IncludeOnlyFilterType;
};

/** The query of `POST AiringSchedule/Season/{year}/{season}/Sections`: the anime filters, then those of their airings. */
export type AiringSeasonRequestType = AiringSeasonFiltersType & {
  kind?: AiringKindType[];
  provider?: string[];
  episodeKind?: EpisodeAiringKindType[];
  includeEstimates?: boolean;
  /** Only the airings of these AniDB episode types; every type when left out. */
  episodeType?: EpisodeTypeValues[];
};

/** The query of `POST AiringSchedule/Season/ByYear`, the seasons with anime by year, newest first. */
export type AiringSeasonsByYearRequestType = AiringSeasonFiltersType & {
  include?: 'Images'[];
  /** Leave out the earlier years; the current season's year is listed either way. */
  fromYear?: number;
};

/**
 * The body of the `POST AiringSchedule/Season` routes: the layout to group and count the anime by, or `null` for the
 * server's default.
 */
export type AiringSeasonBodyType = {
  Sections: SeasonSectionDefinitionType[] | null;
};

export type CalendarEntryType = {
  airing: EpisodeAiringType;
  time: Dayjs;
  isAllDay: boolean;
  /** Set when the airing is shown at the slot it was moved out of. */
  movedTo: Dayjs | null;
  /** Set when the airing is shown at its new slot, after a delay. */
  movedFrom: Dayjs | null;
};

export type SeasonSummaryType = {
  key: SeasonKey;
  count: number;
  isCurrent: boolean;
  poster: ImageType | null;
  backdrop: ImageType | null;
};

export type SeasonYearType = {
  year: number;
  seasons: SeasonSummaryType[];
};

export type UpdateAiringProvidersRequestType = {
  ID: string;
  Priority: number;
  EnabledKinds: AiringKindType[];
  SweepInterval: string;
};
