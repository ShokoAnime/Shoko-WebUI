import type { ImageType } from './common';
import type { EpisodeTypeValues } from './episode';

export type DashboardSeriesSummaryType = {
  Series: number;
  OVA: number;
  Movie: number;
  Special?: number;
  Web: number;
  Other: number;
  None?: number;
  MusicVideo?: number;
  Unknown?: number;
};

export type DashboardStatsType = {
  FileCount: number;
  SeriesCount: number;
  GroupCount: number;
  FileSize: number;
  FinishedSeries: number;
  WatchedEpisodes: number;
  WatchedHours: number;
  PercentDuplicate: number;
  MissingEpisodes: number;
  MissingEpisodesCollecting: number;
  UnrecognizedFiles: number;
  SeriesWithMissingLinks: number;
  EpisodesWithMultipleFiles: number;
  FilesWithDuplicateLocations: number;
};

export type DashboardEpisodeDetailsType = {
  IDs: {
    ID: number;
    Series: number;
    ShokoFile: number | null;
    ShokoEpisode: number | null;
    ShokoSeries: number | null;
  };
  Title: string;
  Number: number;
  Type: EpisodeTypeValues;
  /** UTC calendar day of the broadcast (`YYYY-MM-DD`) when the time is known, otherwise the AniDB air date. */
  AirDate: string | null;
  /** ISO UTC datetime; midnight UTC on `AirDate` when no broadcast time is known. */
  AiredAt: string | null;
  /** `AiredAt` carries a real broadcast time (from AniList, or estimated). */
  HasAirTime: boolean;
  /** The broadcast time is an estimate learned from the series' other episodes. */
  IsAirTimeEstimated: boolean;
  Duration: string;
  ResumePosition: string | null;
  Watched: string | null;
  SeriesTitle: string;
  SeriesPoster: ImageType;
  Thumbnail?: ImageType;
};

export type DashboardNewsType = {
  filename: string;
  meta: {
    link: string;
    title: string;
    quick: string;
    date: string;
  };
};
