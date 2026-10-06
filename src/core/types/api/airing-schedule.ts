import type { ImageType } from '@/core/types/api/common';
import type { ConfigurationInfoType } from '@/core/types/api/configuration';
import type { EpisodeTypeValues } from '@/core/types/api/episode';
import type { PluginInfoType } from '@/core/types/api/plugin';

export type AiringKindType = 'Original' | 'Subtitled' | 'Dubbed';

/** `Rerun` is marked by the provider; `DetectedRerun` is found by Shoko from the schedule's pattern. */
export type EpisodeAiringKindType = 'Normal' | 'Advance' | 'Rerun' | 'DetectedRerun';

export type AiringChannelKindType = 'Unknown' | 'Television' | 'Streaming';

export type AiringChannelReferenceType = {
  ID: string;
  Name: string;
  Type: AiringChannelKindType;
};

export type AiringSourceType = {
  ID: string;
  Name: string;
};

export type AiringTrackType = {
  Kind: AiringKindType;
  LanguageCode: string;
  CountryCode: string | null;
  Language: string;
};

export type AiringSeriesType = {
  ShokoID: number | null;
  AnidbID: number | null;
  Title: string;
};

/**
 * One episode airing, from `GET AiringSchedule/Airing`. All times are UTC. A date-only airing (`IsDateOnly`) is an
 * episode known only by its AniDB air date: it has an `AirDate` and no times, schedule, source, channel or tracks.
 */
export type EpisodeAiringType = {
  ID: string;
  ScheduleID: string | null;
  IsDateOnly: boolean;
  /** The air date of a date-only airing, eg. `2026-10-04`. */
  AirDate: string | null;
  AiredAt: string | null;
  /** When the airing's slot ends; `null` for a date-only airing. It is on air from `AiredAt` until then. */
  EndsAt: string | null;
  /** The episode's own length, eg. `00:24:00`; `null` when unknown. */
  Duration: string | null;
  OriginalAiredAt: string | null;
  IsDelayed: boolean;
  IsEstimated: boolean;
  /** The airing `preferredOnly` would keep for its episode, by the preferred channels and tracks; at most one per episode. */
  IsPreferred: boolean;
  Kind: EpisodeAiringKindType;
  OffsetFromOriginal: string | null;
  LinkID: string | null;
  Url: string | null;
  Source: AiringSourceType | null;
  Channel: AiringChannelReferenceType | null;
  Tracks: AiringTrackType[];
  IDs: {
    ShokoEpisode: number | null;
    AnidbEpisode: number | null;
    ShokoSeries: number | null;
    AnidbAnime: number | null;
  };
  VideoCount: number;
  Type: EpisodeTypeValues | null;
  Number: number | null;
  /** Only with `include=EpisodeTitle`. */
  EpisodeTitle: string | null;
  /** Only with `include=Series`. */
  Series: AiringSeriesType | null;
  /** Only with `include=Poster`. */
  Poster: ImageType | null;
  /** Only with `include=Thumbnail`. */
  Thumbnail: ImageType | null;
};

/** An airing placed on a day of `GET AiringSchedule/Calendar`. Times carry the offset of the request's time zone. */
export type AiringCalendarEntryType = {
  Airing: EpisodeAiringType;
  /** Its slot, the slot it was moved out of when only that is in range, or the start of its day when all-day. */
  Time: string;
  /** A date-only airing, shown for the whole day. */
  IsAllDay: boolean;
  /** Set when it is shown at its new slot, after a delay. */
  MovedFrom: string | null;
  /** Set when it is shown at the slot it was moved out of. */
  MovedTo: string | null;
};

/** One episode on a day: its lead airing, and its other airings that day when `everyChannel` is on. */
export type AiringCalendarEpisodeType = {
  Lead: AiringCalendarEntryType;
  Others: AiringCalendarEntryType[];
};

/** A local day of `GET AiringSchedule/Calendar`, with its episodes: the all-day ones first, then by time. */
export type AiringCalendarDayType = {
  /** The local date, eg. `2026-10-05`. */
  Date: string;
  Episodes: AiringCalendarEpisodeType[];
};

export type AiringScheduleProviderType = {
  ID: string;
  Version: string;
  Name: string;
  Description: string;
  Priority: number;
  IsEnabled: boolean;
  AvailableKinds: AiringKindType[];
  EnabledKinds: AiringKindType[];
  IsSwept: boolean;
  SweepInterval: string;
  /** The provider's own settings, when it has any. */
  Configuration: ConfigurationInfoType | null;
  /** Whether the provider, or its plugin, has an icon at `GET AiringSchedule/Provider/{id}/Icon`. */
  HasIcon: boolean;
  Plugin: PluginInfoType;
};

/** A channel from the shared registry, from `GET AiringSchedule/Channel`. */
export type AiringChannelType = AiringChannelReferenceType & {
  Aliases: string[];
  /** The channel's ISO 3166-1 alpha-2 country, or `null` for one without a country, like a global streaming service. */
  CountryCode: string | null;
  /** Left out of the airing reads unless they ask for hidden channels. */
  IsHidden: boolean;
  CreatedAt: string;
};
