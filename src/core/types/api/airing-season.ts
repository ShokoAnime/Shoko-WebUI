import type { EpisodeAiringType } from '@/core/types/api/airing-schedule';
import type { ImageType } from '@/core/types/api/common';
import type { AnimeTypeValues } from '@/core/types/api/series';

/** One of the four anime seasons of a year. */
export type YearlySeasonValues = 'Winter' | 'Spring' | 'Summer' | 'Fall';

export type SeasonKey = {
  year: number;
  season: YearlySeasonValues;
};

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

export type SeasonAiringStatusType = 'Upcoming' | 'Finished' | 'Unknown';

type SeasonAnimeLabelType = { Source: string, ID: string, Name: string };

export type SeasonAnimeType = {
  ID: number;
  ShokoID: number | null;
  Type: AnimeTypeValues;
  Title: string;
  /** The series' poster when it is in the collection, else the anime's. */
  Poster: ImageType | null;
  Overview: string | null;
  /** A date, possibly partial, eg. `2026-10`. */
  AirDate: string | null;
  EndDate: string | null;
  EpisodeCount: number | null;
  Restricted: boolean;
  /** The animation studios: AniDB's first, then those only the linked sources name. */
  Studios: SeasonAnimeLabelType[];
  SourceMaterial: SourceMaterialValues;
  /** The genres most sources agree on, without spoilers. */
  Tags: SeasonAnimeLabelType[];
  VideoCount: number;
  /** The season the first regular episode aired in; `null` when unknown. */
  StartSeason: { Year: number, AnimeSeason: YearlySeasonValues } | null;
  /** The median length of the regular episodes, eg. `00:24:00`; `null` when unknown. */
  EpisodeDuration: string | null;
  AiringStatus: SeasonAiringStatusType;
  /** The next new episode's airing, by the server's preference; it may be date-only. */
  NextAiring: EpisodeAiringType | null;
  /** The same episode's airings on the other channels, by time. */
  OtherAirings: EpisodeAiringType[];
};

/**
 * A section of the season view, as `POST AiringSchedule/Season/{year}/{season}/Sections` sends it: every section of
 * the layout, in its order, empty ones included, each section's anime sorted by next airing.
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
  Types: AnimeTypeValues[] | null;
  /** Only anime still airing, or only those that are not; `null` for either. */
  Continuing: boolean | null;
  /** Only anime with half-length episodes, or only those without; `null` for either. */
  HalfLength: boolean | null;
};

export type AiringSeasonType = {
  Year: number;
  AnimeSeason: YearlySeasonValues;
  Count: number;
  /** Whether the season is the one under way, by the server's clock and rules. */
  IsCurrent: boolean;
  /** The poster of the season's pick, with `include=Images`. */
  Poster: ImageType | null;
  /** The backdrop of the same pick, with `include=Images`. */
  Backdrop: ImageType | null;
};

export type AiringSeasonYearType = {
  Year: number;
  Seasons: AiringSeasonType[];
};
