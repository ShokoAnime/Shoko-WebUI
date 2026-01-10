import type { ImageType } from './common';
import type { EpisodeTypeEnum } from './episode';

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
  Type: EpisodeTypeEnum;
  AirDate: string | null;
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
