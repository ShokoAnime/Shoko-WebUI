import type { EpisodeAiringType } from '@/core/types/api/airing-schedule';
import type { ImageType } from '@/core/types/api/common';
import type { AnimeTypeValues } from '@/core/types/api/series';
import type { SeasonKey, YearlySeasonValues } from '@/core/utilities/season';

/** What the anime was adapted from, as AniDB's source material tags say. */
export type SourceMaterialValues =
  | 'Unknown'
  | 'Original'
  | 'Other'
  | 'Manga'
  | 'LightNovel'
  | 'VisualNovel'
  | 'VideoGame'
  | 'Novel'
  | 'Doujinshi'
  | 'Anime'
  | 'WebNovel'
  | 'LiveAction'
  | 'Game'
  | 'Comic'
  | 'MultimediaProject'
  | 'PictureBook'
  | 'Eroge'
  | 'Manhwa'
  | 'Manhua';

/** Whether a season's anime still has a new episode to air. */
export type SeasonAiringStatusType = 'Upcoming' | 'Finished' | 'Unknown';

/** One anime of a season, from `POST AiringSchedule/Season/{year}/{season}/Sections`. */
export type SeasonAnimeType = {
  /** The AniDB anime ID. */
  ID: number;
  /** The Shoko series made from the anime, when it is in the collection. */
  ShokoID: number | null;
  Type: AnimeTypeValues;
  /** The preferred title. */
  Title: string;
  /** The series' poster when it is in the collection, else the anime's. */
  Poster: ImageType | null;
  /** The preferred overview. */
  Overview: string | null;
  /** A date, possibly partial, eg. `2026-10`. */
  AirDate: string | null;
  EndDate: string | null;
  EpisodeCount: number | null;
  Restricted: boolean;
  /** The animation studios: AniDB's first, then those only the linked sources name. */
  Studios: { Source: string, ID: string, Name: string }[];
  SourceMaterial: SourceMaterialValues;
  /** The genres most sources agree on, without spoilers. */
  Tags: { Source: string, ID: string, Name: string }[];
  /** The local files of the Shoko series. */
  VideoCount: number;
  /** The season the first regular episode aired in; `null` when unknown. */
  StartSeason: { Year: number, AnimeSeason: YearlySeasonValues } | null;
  /** Whether an admin set the start season by hand. */
  IsStartSeasonOverridden: boolean;
  /** The median length of the regular episodes, eg. `00:24:00`; `null` when unknown. */
  EpisodeDuration: string | null;
  AiringStatus: SeasonAiringStatusType;
  /** The next new episode's airing, by the server's preference; it may be date-only. */
  NextAiring: EpisodeAiringType | null;
  /** The same episode's airings on the other channels, by time. */
  OtherAirings: EpisodeAiringType[];
};

/**
 * A section of the season view, as `GET` or `POST AiringSchedule/Season/{year}/{season}/Sections` sends it: every
 * section of the layout, in its order, empty ones included, each section's anime sorted by next airing.
 */
export type SeasonSectionType = {
  Title: string;
  Anime: SeasonAnimeType[];
};

/**
 * A section of a season view layout, as `GET AiringSchedule/Season/Sections/Default` sends the server's default and
 * `POST AiringSchedule/Season/{year}/{season}/Sections` takes one. Each anime goes to the first section it fits.
 */
export type SeasonSectionDefinitionType = {
  Title: string;
  /** The anime types it takes; `null` for every type, which makes it a rest group. */
  Types: AnimeTypeValues[] | null;
  /** Only anime still airing, or only those that are not; `null` for either. */
  Continuing: boolean | null;
  /** Only anime with half-length episodes, or only those without; `null` for either. */
  HalfLength: boolean | null;
};

/**
 * A season with matching anime, as `POST AiringSchedule/Season` sends it; `transformAiringSeasons` is the one place
 * that reads it. The current season is always listed.
 */
export type AiringSeasonType = {
  Year: number;
  AnimeSeason: YearlySeasonValues;
  /** How many anime the season has under the request's filters. */
  Count: number;
  IsCurrent: boolean;
  /** The poster of the season's pick, with `include=Images`. */
  Poster: ImageType | null;
  /** The backdrop of the same pick, with `include=Images`. */
  Backdrop: ImageType | null;
};

/** A year with anime, as `POST AiringSchedule/Season/ByYear` sends it, with its listed seasons from winter to fall. */
export type AiringSeasonYearType = {
  Year: number;
  Seasons: AiringSeasonType[];
};

/** A season as the views use it. */
export type SeasonSummaryType = {
  key: SeasonKey;
  count: number;
  isCurrent: boolean;
  poster: ImageType | null;
  backdrop: ImageType | null;
};

/** A year of the season list as the views use it. */
export type SeasonYearType = {
  year: number;
  seasons: SeasonSummaryType[];
};

/** A year and season as the start season routes send and take them. */
export type StartSeasonValueType = {
  Year: number;
  Season: YearlySeasonValues;
};

/** An anime's start season, from `GET Series/AniDB/{anidbID}/StartSeason`. */
export type StartSeasonType = {
  /** `null` when the anime has no dates to go by and no override. */
  Year: number | null;
  Season: YearlySeasonValues | null;
  /** Whether an admin set it by hand. */
  IsOverridden: boolean;
  /** The season worked out from the anime's dates, whether overridden or not. */
  Computed: StartSeasonValueType | null;
};

/** One start season set by hand, from `GET Series/AniDB/StartSeason/Overrides`. */
export type StartSeasonOverrideType = StartSeasonValueType & {
  AnidbAnimeID: number;
  /** The anime's preferred title; `null` when the server has no data for it or the user may not see it. */
  Title: string | null;
  CreatedAt: string;
  UpdatedAt: string;
  /** The user who last set it; `null` when the system did. */
  UserID: number | null;
};

/** What `POST Series/AniDB/StartSeason/Overrides.csv` did. */
export type StartSeasonImportSummaryType = {
  Added: number;
  Updated: number;
  Unchanged: number;
  /** The lines it could not import, in file order. */
  Rejected: { Line: number, Text: string, Reason: string }[];
};
