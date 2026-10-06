import type { IncludeOnlyFilterType } from '@/core/react-query/types';
import type { AiringKindType, EpisodeAiringKindType } from '@/core/types/api/airing-schedule';
import type { SeasonSectionDefinitionType } from '@/core/types/api/airing-season';
import type { AnimeTypeValues } from '@/core/types/api/series';

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
  /** Include the airings of episodes AniDB does not list yet; on when left out. */
  includeUnresolved?: boolean;
  /** Comma-separated AniDB episode types; every type when left out. */
  type?: string;
  /** Comma-separated channel IDs, hidden ones included; the visible channels when left out. */
  channel?: string;
  include?: AiringDataToIncludeType[];
};

/** The anime filters of the season routes, and the channels their airings are on. */
type AiringSeasonFiltersType = {
  type?: AnimeTypeValues[];
  inCollection?: IncludeOnlyFilterType;
  includeRestricted?: IncludeOnlyFilterType;
  /** Comma-separated channel IDs, hidden ones included; the visible channels when left out. */
  channel?: string;
};

/** The query of `POST AiringSchedule/Season/{year}/{season}/Sections`: the anime filters, then those of their airings. */
export type AiringSeasonRequestType = AiringSeasonFiltersType & {
  kind?: AiringKindType[];
  provider?: string[];
  episodeKind?: EpisodeAiringKindType[];
  includeEstimates?: boolean;
  /** Include the airings of episodes AniDB does not list yet; on when left out. */
  includeUnresolved?: boolean;
  /** Comma-separated AniDB episode types; every type when left out. */
  episodeType?: string;
};

/** The body of `POST AiringSchedule/Season/{year}/{season}/Sections`: the layout to group the anime by. */
export type AiringSeasonSectionsBodyType = {
  Sections: SeasonSectionDefinitionType[] | null;
};

/** The query of `GET AiringSchedule/Season`, the seasons with anime under the same filters. */
export type AiringSeasonsRequestType = AiringSeasonFiltersType;

/** The query of `GET AiringSchedule/Season/ByYear`, the same seasons by year, newest first. */
export type AiringSeasonsByYearRequestType = AiringSeasonFiltersType & {
  include?: 'Images'[];
  /** Leave out the earlier years; the current season's year is listed either way. */
  fromYear?: number;
};

/** One provider's changes for `POST AiringSchedule/Provider`. A provider with no enabled kinds is disabled. */
export type UpdateAiringProvidersRequestType = {
  ID: string;
  Priority?: number;
  EnabledKinds?: AiringKindType[];
  SweepInterval?: string;
};

/** The body of `POST AiringSchedule/Channel/{channelID}/Merge`: the channels merged into it and then gone. */
export type MergeAiringChannelsRequestType = {
  SourceIDs: string[];
};
